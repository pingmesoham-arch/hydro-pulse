import type { PrototypeScenarioInput, PrototypeScenarioResult } from '../../store/useSimulationStore';
import { generateMockBathtubExtents } from '../../lib/floodExtent/bathtubModel';
import { estimatePopulationExposure } from '../../lib/impact/populationExposure';
import type { DamMetadata } from '../../data/dams';

/**
 * Prototype Hydraulic Estimator
 *
 * IMPORTANT SCIENTIFIC DISCLAIMER:
 * These formulas are a demonstration prototype estimator to make the interactive SIH MVP responsive.
 * This is NOT a validated 2D hydrodynamic model (such as HEC-RAS or Telemac-2D).
 * Units:
 * - Discharge: m³/s
 * - Depth: m
 * - Velocity: m/s
 * - Time: minutes
 */
export function calculatePrototypeScenario(
  input: PrototypeScenarioInput, 
  dam: DamMetadata
): PrototypeScenarioResult {
  const n = Math.max(0.01, input.manningN || 0.035);
  const scenario = input.scenario;
  const isCatastrophic = scenario.id === 'catastrophic';

  // 1. Dam and breach parameters
  const damHeight = Math.max(1, dam.heightM || 36.59);
  const grossStorageM3 = (dam.grossStorageMcm || 215.88) * 1e6;
  const breachWidthM = scenario.breachWidthM || (isCatastrophic ? 150 : 40);
  const crestFailureRatio = scenario.crestFailureRatio || (isCatastrophic ? 1.0 : 0.4);
  const effectiveBreachDepth = damHeight * crestFailureRatio;
  const formationTimeHr = scenario.formationTimeHr || (isCatastrophic ? 0.5 : 3.5);
  const formationTimeMin = formationTimeHr * 60;

  // 2. Peak Discharge Calculation (Froehlich / Weir empirical regression)
  // Weir capacity over breach opening: Q_weir = 1.7 * B * H^1.5
  const qWeir = 1.7 * breachWidthM * Math.pow(effectiveBreachDepth, 1.5);
  
  // Storage-constrained peak discharge estimate (Froehlich empirical regression formula)
  const effectiveVolumeM3 = grossStorageM3 * (isCatastrophic ? 1.0 : 0.25);
  const qFroehlich = 0.607 * Math.pow(effectiveVolumeM3, 0.295) * Math.pow(effectiveBreachDepth, 1.24);

  // Blend weir opening capacity with volume-limited peak flow
  const basePeakDischarge = Math.min(qWeir, qFroehlich * 1.15);

  // Manning's roughness channel attenuation on peak outflow
  const peakDischargeEst = Math.max(10, basePeakDischarge * Math.pow(0.035 / n, 0.25));
  const peakDischargeMin = peakDischargeEst * 0.8;
  const peakDischargeMax = peakDischargeEst * 1.2;

  // 3. Impact Severity classification
  let impactSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'MODERATE';
  if (peakDischargeEst >= 10000) impactSeverity = 'CRITICAL';
  else if (peakDischargeEst >= 5000) impactSeverity = 'HIGH';
  else if (peakDischargeEst >= 1500) impactSeverity = 'MODERATE';
  else impactSeverity = 'LOW';

  // 4. Downstream channel geometry for depth and velocity (Manning's open channel routing)
  // Representative valley width W and river bed slope S
  const valleyWidth = 100; // m
  const bedSlope = 0.0025; // 0.25% slope

  const calcDepth = (q: number): number => {
    if (q <= 0) return 0;
    // Manning's depth for rectangular channel: y = (Q * n / (W * sqrt(S)))^(3/5)
    return Math.pow((q * n) / (valleyWidth * Math.sqrt(bedSlope)), 0.6);
  };

  const calcVelocity = (q: number, y: number): number => {
    if (q <= 0 || y <= 0) return 0;
    // Manning's velocity: v = (1/n) * y^(2/3) * sqrt(S)
    return (1 / n) * Math.pow(y, 2 / 3) * Math.sqrt(bedSlope);
  };

  const estimatedDepth = calcDepth(peakDischargeEst);
  const depthMin = estimatedDepth * 0.8;
  const depthMax = estimatedDepth * 1.2;

  const maxVelocity = calcVelocity(peakDischargeEst, estimatedDepth);

  // Arrival time to critical reach (5km downstream): T = Distance / (Velocity * 60) in minutes
  const arrivalTime = maxVelocity > 0 ? (5000 / maxVelocity) / 60 : 15;

  // 5. Timestep calculations across standard [0, 15, 30, 60, 120] min timeline
  const exactTimesteps = [0, 15, 30, 60, 120];

  const extents = dam.id === 'gangapur-dam' 
    ? generateMockBathtubExtents([], dam.latitude, dam.longitude, scenario)
    : [];

  const timesteps = exactTimesteps.map((t, idx) => {
    let q = 0;
    if (t === 0) {
      q = 0;
    } else if (isCatastrophic) {
      // Catastrophic: Rapid surge peaking at T_formation (30 min), followed by exponential recession
      if (t <= formationTimeMin) {
        q = peakDischargeEst * Math.pow(t / formationTimeMin, 2);
      } else {
        q = peakDischargeEst * Math.exp(-0.022 * (t - formationTimeMin));
      }
    } else {
      // Partial: Gradual rising limb across extended formation time (210 min)
      q = peakDischargeEst * Math.pow(t / (formationTimeMin || 210), 1.4);
    }

    // Numerical safety clamp
    q = Math.max(0, isNaN(q) || !isFinite(q) ? 0 : q);

    const depth = calcDepth(q);
    const velocity = calcVelocity(q, depth);

    let extent = extents[idx];
    let impact = undefined;

    if (extent && extent.features && extent.features.length > 0) {
      impact = {
        population: estimatePopulationExposure(extent, impactSeverity, q)
      };
    } else {
      impact = {
        population: {
          critical: 0,
          high: 0,
          moderate: 0
        }
      };
    }

    return {
      timeMin: t,
      discharge: q,
      depth: isNaN(depth) || !isFinite(depth) ? 0 : depth,
      velocity: isNaN(velocity) || !isFinite(velocity) ? 0 : velocity,
      floodExtent: extent,
      impact: impact
    };
  });

  return {
    scenarioId: scenario.id,
    damId: dam.id,
    peakDischarge: { 
      estimate: isNaN(peakDischargeEst) ? 0 : peakDischargeEst, 
      min: isNaN(peakDischargeMin) ? 0 : peakDischargeMin, 
      max: isNaN(peakDischargeMax) ? 0 : peakDischargeMax 
    },
    estimatedDepth: { 
      estimate: isNaN(estimatedDepth) ? 0 : estimatedDepth, 
      min: isNaN(depthMin) ? 0 : depthMin, 
      max: isNaN(depthMax) ? 0 : depthMax 
    },
    maxVelocity: isNaN(maxVelocity) ? 0 : maxVelocity,
    impactSeverity,
    arrivalTime: isNaN(arrivalTime) ? 0 : arrivalTime,
    timesteps
  };
}

