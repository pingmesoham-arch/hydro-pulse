import {
  calculateHaversineDistanceM,
  calculateHADRRiskScore
} from '../hadrEngine';

export function runHadrEngineSanityChecks(): boolean {
  const dist = calculateHaversineDistanceM(20.03535, 73.68311, 19.9975, 73.7898);
  if (dist < 10000 || dist > 14000) return false;

  const safe = calculateHADRRiskScore(0, 0, null);
  if (safe.score !== 0 || safe.category !== 'SAFE') return false;

  const catastrophic = calculateHADRRiskScore(4.5, 6.5, 15, 'hospital');
  if (catastrophic.score < 75 || catastrophic.category !== 'CRITICAL') return false;

  return true;
}
