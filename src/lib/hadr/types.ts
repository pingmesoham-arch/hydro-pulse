export type HADRPriorityLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface FloodArrivalAnalysis {
  isFlooded: boolean;
  arrivalTimeMin: number | null;
  firstInundatedStepIndex: number | null;
  maxDepthM: number;
  maxVelocityMs: number;
  timeToImpactMin: number | null; // relative to active timeline
}

export interface HADRRiskFactors {
  depthFactor: number;       // 0 - 100
  velocityFactor: number;    // 0 - 100
  arrivalUrgencyFactor: number; // 0 - 100
  criticalityFactor: number; // 0 - 100
}

export interface HADRRiskScore {
  score: number;             // 0 - 100
  category: HADRPriorityLevel | 'SAFE';
  factors: HADRRiskFactors;
  explanation: string[];
}

export interface EvacuationPriorityItem {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  arrivalTimeMin: number | null;
  currentDepthM: number;
  peakDepthM: number;
  peakVelocityMs: number;
  riskScore: HADRRiskScore;
  priority: HADRPriorityLevel;
  actionDirective: string;
}

export interface LocationInspectionResult {
  latitude: number;
  longitude: number;
  isFlooded: boolean;
  isFloodedAtCurrentTime: boolean;
  arrivalTimeMin: number | null;
  currentDepthM: number;
  maxDepthM: number;
  currentVelocityMs: number;
  maxVelocityMs: number;
  currentDischargeM3s: number;
  riskScore: HADRRiskScore;
  nearestAsset: {
    name: string;
    type: string;
    distanceM: number;
    latitude: number;
    longitude: number;
    riskCategory: string;
  } | null;
  evacuationDirective: string;
}

export interface HADRSituationalSummary {
  inundatedAreaKm2: number;
  totalAssetsAffected: number;
  hospitalsAffected: number;
  schoolsAffected: number;
  bridgesAffected: number;
  roadsAffected: number;
  estimatedAffectedRoadLengthKm: number;
  highestRiskLocation: string;
  earliestArrivalMin: number | null;
  priorityCounts: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
}
