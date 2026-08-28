import type { PrototypeScenarioInput, PrototypeScenarioResult } from '../../store/useSimulationStore';
import { generateMockBathtubExtents } from '../../lib/floodExtent/bathtubModel';
import { estimatePopulationExposure } from '../../lib/impact/populationExposure';
import type { DamMetadata } from '../../data/dams';

/**
 * Prototype Hydraulic Estimator
 *
 * IMPORTANT SCIENTIFIC DISCLAIMER:
 * These formulas are NOT a validated hydrodynamic model.
 * They are a demonstration model to make the SIH MVP interactive.
 * This is not a Saint-Venant solver, not HEC-RAS, and not physically accurate
 * dam-break modelling.
 */
export function calculatePrototypeScenario(
  input: PrototypeScenarioInput, 
  dam: DamMetadata
): PrototypeScenarioResult {
  // Refactored to make Manning's Roughness (n) the ONLY variable manipulating the output data
  const n = input.manningN;
  
  const peakDischargeEst = 1300 / n;
  const peakDischargeMin = peakDischargeEst * 0.8;
  const peakDischargeMax = peakDischargeEst * 1.2;
  
  const estimatedDepth = 0.85 / n;
  const depthMin = estimatedDepth * 0.8;
  const depthMax = estimatedDepth * 1.2;

  const maxVelocity = 0.85 / n;
  
  let impactSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'MODERATE';
  if (peakDischargeEst > 10000) impactSeverity = 'CRITICAL';
  else if (peakDischargeEst > 5000) impactSeverity = 'HIGH';
  else if (peakDischargeEst < 1000) impactSeverity = 'LOW';
  
  // Generic arrival time estimate
  const arrivalTime = (15000 / maxVelocity) / 60; // min
  
  // Build time-varying hydrograph
  const tfMins = input.scenario.formationTimeHr * 60;
  
  // Simulating specific exact timesteps
  const exactTimesteps = [0, 15, 30, 60, 120];
  
  console.log('[SIM] Starting calculation');

  // Combine into single timesteps array
  const timesteps = exactTimesteps.map((t, idx) => {
    let q = 0;
    if (t === 0) {
      q = 0;
    } else if (t <= tfMins) {
      // Rising limb
      q = peakDischargeEst * Math.pow(t / (tfMins || 1), 2); 
    } else {
      // Recession limb
      q = peakDischargeEst * Math.exp(-0.02 * (t - tfMins));
    }
    
    // Scale depth and velocity relative to Q / Qmax
    const ratio = peakDischargeEst > 0 ? q / peakDischargeEst : 0;
    const currentDepth = estimatedDepth * ratio;
    const currentVelocity = maxVelocity * Math.sqrt(ratio); // V ~ sqrt(H)
    
    let extent = undefined;
    let impact = undefined;
    
    if (dam.id === 'gangapur-dam') {
      const extents = generateMockBathtubExtents([], dam.latitude, dam.longitude, input.scenario);
      extent = extents[idx];
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
    }
    
    return {
      timeMin: t,
      discharge: q,
      depth: currentDepth,
      velocity: currentVelocity,
      floodExtent: extent,
      impact: impact
    };
  });

  console.log('[SIM] Timestep count:', timesteps.length);

  return {
    scenarioId: input.scenario.id,
    damId: dam.id,
    peakDischarge: { estimate: peakDischargeEst, min: peakDischargeMin, max: peakDischargeMax },
    estimatedDepth: { estimate: estimatedDepth, min: depthMin, max: depthMax },
    maxVelocity,
    impactSeverity,
    arrivalTime,
    timesteps
  };
}
