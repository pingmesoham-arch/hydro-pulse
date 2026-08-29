import type * as GeoJSON from 'geojson';
import type { InfrastructureAsset } from '../../data/studyAreas/types';
import type { PrototypeScenarioResult, SimulationTimestep } from '../../store/useSimulationStore';
import { isPointInPolygon, assessInfrastructureRisk, assessRoadRisk } from '../impact/infrastructure';
import type {
  HADRPriorityLevel,
  HADRRiskScore,
  EvacuationPriorityItem,
  LocationInspectionResult,
  HADRSituationalSummary
} from './types';

/**
 * Calculates geodesic distance between two lat/lon pairs using the Haversine formula in meters.
 */
export function calculateHaversineDistanceM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates approximate surface area of a GeoJSON FeatureCollection in square kilometers (km²).
 */
export function calculateInundatedAreaKm2(featureCollection?: GeoJSON.FeatureCollection): number {
  if (!featureCollection || !featureCollection.features || featureCollection.features.length === 0) {
    return 0;
  }

  let totalAreaM2 = 0;

  for (const feature of featureCollection.features) {
    const geom = feature.geometry;
    if (geom.type === 'Polygon') {
      totalAreaM2 += computeSinglePolygonAreaM2(geom.coordinates[0]);
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates) {
        totalAreaM2 += computeSinglePolygonAreaM2(poly[0]);
      }
    }
  }

  return Number((totalAreaM2 / 1e6).toFixed(2));
}

function computeSinglePolygonAreaM2(coords?: number[][]): number {
  if (!coords || coords.length < 3) return 0;
  
  const R = 6371000; // Earth radius in meters
  let area = 0;
  const len = coords.length;
  
  // Projected planar coordinates using mean latitude
  const meanLat = coords.reduce((acc, c) => acc + c[1], 0) / len;
  const latFactor = (Math.PI * R) / 180;
  const lonFactor = ((Math.PI * R) / 180) * Math.cos((meanLat * Math.PI) / 180);

  for (let i = 0; i < len - 1; i++) {
    const x1 = coords[i][0] * lonFactor;
    const y1 = coords[i][1] * latFactor;
    const x2 = coords[i + 1][0] * lonFactor;
    const y2 = coords[i + 1][1] * latFactor;
    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area) / 2;
}

/**
 * Determines flood arrival time and maximum hydraulic characteristics for a point across all simulation timesteps.
 */
export function computePointArrival(
  point: [number, number], // [lon, lat]
  timesteps: SimulationTimestep[]
): {
  isFlooded: boolean;
  arrivalTimeMin: number | null;
  firstInundatedStepIndex: number | null;
  maxDepthM: number;
  maxVelocityMs: number;
} {
  if (!timesteps || timesteps.length === 0) {
    return {
      isFlooded: false,
      arrivalTimeMin: null,
      firstInundatedStepIndex: null,
      maxDepthM: 0,
      maxVelocityMs: 0
    };
  }

  let isFlooded = false;
  let arrivalTimeMin: number | null = null;
  let firstInundatedStepIndex: number | null = null;
  let maxDepthM = 0;
  let maxVelocityMs = 0;

  for (let i = 0; i < timesteps.length; i++) {
    const step = timesteps[i];
    const extent = step.floodExtent;
    if (!extent || !extent.features || extent.features.length === 0) continue;

    let inside = false;
    for (const feature of extent.features) {
      const geom = feature.geometry;
      if (geom.type === 'Polygon') {
        const ring = geom.coordinates[0];
        if (ring && isPointInPolygon(point, ring)) {
          inside = true;
          break;
        }
      } else if (geom.type === 'MultiPolygon') {
        for (const poly of geom.coordinates) {
          if (poly[0] && isPointInPolygon(point, poly[0])) {
            inside = true;
            break;
          }
        }
        if (inside) break;
      }
    }

    if (inside) {
      if (!isFlooded) {
        isFlooded = true;
        arrivalTimeMin = step.timeMin;
        firstInundatedStepIndex = i;
      }
      if (step.depth > maxDepthM) maxDepthM = step.depth;
      if (step.velocity > maxVelocityMs) maxVelocityMs = step.velocity;
    }
  }

  return {
    isFlooded,
    arrivalTimeMin,
    firstInundatedStepIndex,
    maxDepthM,
    maxVelocityMs
  };
}

/**
 * Calculates a transparent, multi-factor HADR Risk Score (0 - 100).
 *
 * Formula:
 * Risk = 0.30 * DepthRisk + 0.20 * VelocityRisk + 0.25 * ArrivalUrgency + 0.25 * CriticalityRisk
 */
export function calculateHADRRiskScore(
  depthM: number,
  velocityMs: number,
  arrivalTimeMin: number | null,
  assetType?: string
): HADRRiskScore {
  if (depthM <= 0 && arrivalTimeMin === null) {
    return {
      score: 0,
      category: 'SAFE',
      factors: {
        depthFactor: 0,
        velocityFactor: 0,
        arrivalUrgencyFactor: 0,
        criticalityFactor: 0
      },
      explanation: ['Location is outside the inundation boundary in this scenario.']
    };
  }

  // 1. Depth Risk (0 - 100) -> 3.5m+ considered max danger
  const depthFactor = Math.min(100, Math.max(0, Math.round((depthM / 3.5) * 100)));

  // 2. Velocity Risk (0 - 100) -> 6.0m/s+ considered max destructive momentum
  const velocityFactor = Math.min(100, Math.max(0, Math.round((velocityMs / 6.0) * 100)));

  // 3. Arrival Urgency Factor (0 - 100) -> Earlier arrival yields higher urgency
  let arrivalUrgencyFactor = 0;
  if (arrivalTimeMin !== null) {
    if (arrivalTimeMin <= 15) arrivalUrgencyFactor = 100;
    else if (arrivalTimeMin <= 30) arrivalUrgencyFactor = 85;
    else if (arrivalTimeMin <= 60) arrivalUrgencyFactor = 60;
    else arrivalUrgencyFactor = 35;
  }

  // 4. Criticality Factor (0 - 100)
  let criticalityFactor = 50;
  const lowerType = (assetType || '').toLowerCase();
  if (lowerType.includes('hospital') || lowerType.includes('emergency') || lowerType.includes('clinic')) {
    criticalityFactor = 95;
  } else if (lowerType.includes('bridge') || lowerType.includes('motorway') || lowerType.includes('trunk')) {
    criticalityFactor = 85;
  } else if (lowerType.includes('school') || lowerType.includes('settlement') || lowerType.includes('residential')) {
    criticalityFactor = 75;
  } else if (lowerType.includes('primary') || lowerType.includes('secondary')) {
    criticalityFactor = 60;
  } else {
    criticalityFactor = 40;
  }

  // Weighted Composite Formula
  const rawScore =
    0.30 * depthFactor +
    0.20 * velocityFactor +
    0.25 * arrivalUrgencyFactor +
    0.25 * criticalityFactor;

  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let category: HADRPriorityLevel = 'LOW';
  if (score >= 75) category = 'CRITICAL';
  else if (score >= 50) category = 'HIGH';
  else if (score >= 25) category = 'MODERATE';

  const explanation: string[] = [];
  if (depthFactor >= 70) explanation.push(`Severe water depth (${depthM.toFixed(1)}m) exceeding safe structural limits.`);
  if (velocityFactor >= 70) explanation.push(`High hydrodynamic flow velocity (${velocityMs.toFixed(1)}m/s) poses washing hazard.`);
  if (arrivalUrgencyFactor >= 80) explanation.push(`Critical lead time: floodwater arrives within ${arrivalTimeMin} minutes.`);
  if (criticalityFactor >= 80) explanation.push(`High-criticality facility requiring prioritized evacuation assets.`);

  if (explanation.length === 0) {
    explanation.push(`Moderate hydraulic parameters with manageable lead time (T+${arrivalTimeMin || 0} min).`);
  }

  return {
    score,
    category,
    factors: {
      depthFactor,
      velocityFactor,
      arrivalUrgencyFactor,
      criticalityFactor
    },
    explanation
  };
}

/**
 * Generates actionable emergency directive for a given priority and arrival time.
 */
export function getActionDirective(priority: HADRPriorityLevel | 'SAFE', arrivalTimeMin: number | null): string {
  if (priority === 'SAFE' || arrivalTimeMin === null) {
    return 'Area clear. Maintain situational awareness and monitor secondary runoff.';
  }
  if (priority === 'CRITICAL') {
    return arrivalTimeMin <= 30
      ? 'IMMEDIATE VERTICAL EVACUATION: Direct residents to designated elevated concrete shelters.'
      : 'RAPID PERIMETER EVACUATION: Establish roadblocks and deploy high-clearance rescue craft.';
  }
  if (priority === 'HIGH') {
    return 'PRIORITY EVACUATION: Mobilize mass transit corridors; secure electricity and hospital backup generators.';
  }
  if (priority === 'MODERATE') {
    return 'STANDBY & PREPARE: Restrict low-lying bridge crossings; pre-position sandbags and medical kits.';
  }
  return 'MONITOR: Alert local wardens; keep communication channels open.';
}

/**
 * Inspects a geographic coordinate on the map against the active simulation and infrastructure.
 */
export function inspectLocation(
  coords: [number, number], // [lat, lon]
  simulationResults: PrototypeScenarioResult | null,
  currentTimelineIndex: number,
  infrastructure: InfrastructureAsset[] | null
): LocationInspectionResult {
  const [lat, lon] = coords;
  const point: [number, number] = [lon, lat];

  if (!simulationResults || !simulationResults.timesteps || simulationResults.timesteps.length === 0) {
    const riskScore: HADRRiskScore = {
      score: 0,
      category: 'SAFE',
      factors: { depthFactor: 0, velocityFactor: 0, arrivalUrgencyFactor: 0, criticalityFactor: 0 },
      explanation: ['No simulation data currently available.']
    };
    return {
      latitude: lat,
      longitude: lon,
      isFlooded: false,
      isFloodedAtCurrentTime: false,
      arrivalTimeMin: null,
      currentDepthM: 0,
      maxDepthM: 0,
      currentVelocityMs: 0,
      maxVelocityMs: 0,
      currentDischargeM3s: 0,
      riskScore,
      nearestAsset: null,
      evacuationDirective: 'Run a scenario to calculate location-specific flood intelligence.'
    };
  }

  // 1. Point arrival across all timesteps
  const arrival = computePointArrival(point, simulationResults.timesteps);

  // 2. Active timestep status
  const currentStep = simulationResults.timesteps[currentTimelineIndex] || simulationResults.timesteps[0];
  let isFloodedAtCurrentTime = false;
  if (currentStep.floodExtent && currentStep.floodExtent.features) {
    for (const feat of currentStep.floodExtent.features) {
      if (feat.geometry.type === 'Polygon' && isPointInPolygon(point, feat.geometry.coordinates[0])) {
        isFloodedAtCurrentTime = true;
        break;
      }
    }
  }

  const currentDepthM = isFloodedAtCurrentTime ? currentStep.depth : 0;
  const currentVelocityMs = isFloodedAtCurrentTime ? currentStep.velocity : 0;

  // 3. Find nearest infrastructure asset
  let nearestAsset: LocationInspectionResult['nearestAsset'] = null;
  if (infrastructure && infrastructure.length > 0) {
    let minDistance = Infinity;
    let closest: InfrastructureAsset | null = null;

    for (const asset of infrastructure) {
      const dist = calculateHaversineDistanceM(lat, lon, asset.latitude, asset.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closest = asset;
      }
    }

    if (closest) {
      const assetRisk = assessInfrastructureRisk(closest, currentStep.floodExtent);
      nearestAsset = {
        name: closest.name,
        type: closest.type,
        distanceM: Math.round(minDistance),
        latitude: closest.latitude,
        longitude: closest.longitude,
        riskCategory: assetRisk
      };
    }
  }

  // 4. Calculate risk score for this location
  const riskScore = calculateHADRRiskScore(
    arrival.maxDepthM,
    arrival.maxVelocityMs,
    arrival.arrivalTimeMin,
    nearestAsset ? nearestAsset.type : 'general'
  );

  const evacuationDirective = getActionDirective(
    arrival.isFlooded ? riskScore.category : 'SAFE',
    arrival.arrivalTimeMin
  );

  return {
    latitude: lat,
    longitude: lon,
    isFlooded: arrival.isFlooded,
    isFloodedAtCurrentTime,
    arrivalTimeMin: arrival.arrivalTimeMin,
    currentDepthM: Number(currentDepthM.toFixed(2)),
    maxDepthM: Number(arrival.maxDepthM.toFixed(2)),
    currentVelocityMs: Number(currentVelocityMs.toFixed(2)),
    maxVelocityMs: Number(arrival.maxVelocityMs.toFixed(2)),
    currentDischargeM3s: Math.round(currentStep.discharge),
    riskScore,
    nearestAsset,
    evacuationDirective
  };
}

/**
 * Computes a prioritized list of affected infrastructure and areas for evacuation planning.
 */
export function computeEvacuationPriorities(
  infrastructure: InfrastructureAsset[] | null,
  simulationResults: PrototypeScenarioResult | null,
  currentTimelineIndex: number
): EvacuationPriorityItem[] {
  if (!infrastructure || !simulationResults || !simulationResults.timesteps) {
    return [];
  }

  const timesteps = simulationResults.timesteps;
  const currentStep = timesteps[currentTimelineIndex] || timesteps[0];
  const items: EvacuationPriorityItem[] = [];

  // Evaluate each infrastructure asset
  for (const asset of infrastructure) {
    const point: [number, number] = [asset.longitude, asset.latitude];
    const arrival = computePointArrival(point, timesteps);

    // Only include assets that are inundated in the simulation
    if (arrival.isFlooded) {
      const isFloodedNow = assessInfrastructureRisk(asset, currentStep.floodExtent) !== 'SAFE';
      const currentDepth = isFloodedNow ? currentStep.depth : 0;

      const riskScore = calculateHADRRiskScore(
        arrival.maxDepthM,
        arrival.maxVelocityMs,
        arrival.arrivalTimeMin,
        asset.type
      );

      const priority = riskScore.category === 'SAFE' ? 'LOW' : riskScore.category;
      const actionDirective = getActionDirective(priority, arrival.arrivalTimeMin);

      items.push({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        latitude: asset.latitude,
        longitude: asset.longitude,
        arrivalTimeMin: arrival.arrivalTimeMin,
        currentDepthM: Number(currentDepth.toFixed(2)),
        peakDepthM: Number(arrival.maxDepthM.toFixed(2)),
        peakVelocityMs: Number(arrival.maxVelocityMs.toFixed(2)),
        riskScore,
        priority,
        actionDirective
      });
    }
  }

  // Sort priority queue: Highest risk first, then earliest arrival time
  const weightMap: Record<HADRPriorityLevel, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MODERATE: 2,
    LOW: 1
  };

  items.sort((a, b) => {
    if (weightMap[b.priority] !== weightMap[a.priority]) {
      return weightMap[b.priority] - weightMap[a.priority];
    }
    const arrA = a.arrivalTimeMin ?? 999;
    const arrB = b.arrivalTimeMin ?? 999;
    if (arrA !== arrB) return arrA - arrB;
    return b.riskScore.score - a.riskScore.score;
  });

  return items;
}

/**
 * Generates comprehensive HADR Situational Summary statistics.
 */
export function generateHADRSummary(
  simulationResults: PrototypeScenarioResult | null,
  currentTimelineIndex: number,
  infrastructure: InfrastructureAsset[] | null,
  roads: GeoJSON.FeatureCollection | null
): HADRSituationalSummary {
  if (!simulationResults || !simulationResults.timesteps || simulationResults.timesteps.length === 0) {
    return {
      inundatedAreaKm2: 0,
      totalAssetsAffected: 0,
      hospitalsAffected: 0,
      schoolsAffected: 0,
      bridgesAffected: 0,
      roadsAffected: 0,
      estimatedAffectedRoadLengthKm: 0,
      highestRiskLocation: 'None (Simulation Not Ready)',
      earliestArrivalMin: null,
      priorityCounts: { critical: 0, high: 0, moderate: 0, low: 0 }
    };
  }

  const currentStep = simulationResults.timesteps[currentTimelineIndex] || simulationResults.timesteps[0];
  const extent = currentStep.floodExtent;

  // 1. Inundated Area in km²
  const inundatedAreaKm2 = calculateInundatedAreaKm2(extent);

  // 2. Count affected infrastructure
  let totalAssetsAffected = 0;
  let hospitalsAffected = 0;
  let schoolsAffected = 0;
  let bridgesAffected = 0;

  const priorities = computeEvacuationPriorities(
    infrastructure,
    simulationResults,
    currentTimelineIndex
  );

  const priorityCounts = { critical: 0, high: 0, moderate: 0, low: 0 };
  let highestRiskLocation = 'None';
  let highestScore = -1;
  let earliestArrivalMin: number | null = null;

  if (infrastructure && extent) {
    for (const asset of infrastructure) {
      const risk = assessInfrastructureRisk(asset, extent);
      if (risk !== 'SAFE') {
        totalAssetsAffected++;
        const type = (asset.type || '').toLowerCase();
        if (type.includes('hospital') || type.includes('clinic')) hospitalsAffected++;
        if (type.includes('school')) schoolsAffected++;
        if (type.includes('bridge')) bridgesAffected++;
      }
    }
  }

  for (const item of priorities) {
    if (item.priority === 'CRITICAL') priorityCounts.critical++;
    else if (item.priority === 'HIGH') priorityCounts.high++;
    else if (item.priority === 'MODERATE') priorityCounts.moderate++;
    else priorityCounts.low++;

    if (item.riskScore.score > highestScore) {
      highestScore = item.riskScore.score;
      highestRiskLocation = `${item.name} (${item.type})`;
    }

    if (item.arrivalTimeMin !== null) {
      if (earliestArrivalMin === null || item.arrivalTimeMin < earliestArrivalMin) {
        earliestArrivalMin = item.arrivalTimeMin;
      }
    }
  }

  // 3. Count affected roads
  let roadsAffected = 0;
  let estimatedAffectedRoadLengthKm = 0;
  if (roads && extent) {
    for (const road of roads.features) {
      const roadRisk = assessRoadRisk(road, extent);
      if (roadRisk !== 'SAFE') {
        roadsAffected++;
        // Approximate length based on coordinate count
        if (road.geometry.type === 'LineString') {
          const coords = road.geometry.coordinates;
          for (let i = 0; i < coords.length - 1; i++) {
            estimatedAffectedRoadLengthKm +=
              calculateHaversineDistanceM(coords[i][1], coords[i][0], coords[i + 1][1], coords[i + 1][0]) / 1000;
          }
        }
      }
    }
  }

  return {
    inundatedAreaKm2,
    totalAssetsAffected,
    hospitalsAffected,
    schoolsAffected,
    bridgesAffected,
    roadsAffected,
    estimatedAffectedRoadLengthKm: Number(estimatedAffectedRoadLengthKm.toFixed(1)),
    highestRiskLocation,
    earliestArrivalMin,
    priorityCounts
  };
}
