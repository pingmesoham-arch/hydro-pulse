// Node.js verification script for HADR engine
import assert from 'node:assert';

function calculateHaversineDistanceM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
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

function calculateHADRRiskScore(depthM, velocityMs, arrivalTimeMin, assetType) {
  if (depthM <= 0 && arrivalTimeMin === null) {
    return { score: 0, category: 'SAFE' };
  }

  const depthFactor = Math.min(100, Math.max(0, Math.round((depthM / 3.5) * 100)));
  const velocityFactor = Math.min(100, Math.max(0, Math.round((velocityMs / 6.0) * 100)));

  let arrivalUrgencyFactor = 0;
  if (arrivalTimeMin !== null) {
    if (arrivalTimeMin <= 15) arrivalUrgencyFactor = 100;
    else if (arrivalTimeMin <= 30) arrivalUrgencyFactor = 85;
    else if (arrivalTimeMin <= 60) arrivalUrgencyFactor = 60;
    else arrivalUrgencyFactor = 35;
  }

  let criticalityFactor = 50;
  const lowerType = (assetType || '').toLowerCase();
  if (lowerType.includes('hospital') || lowerType.includes('emergency')) criticalityFactor = 95;
  else if (lowerType.includes('bridge') || lowerType.includes('motorway')) criticalityFactor = 85;
  else if (lowerType.includes('school') || lowerType.includes('settlement')) criticalityFactor = 75;
  else criticalityFactor = 40;

  const rawScore =
    0.30 * depthFactor +
    0.20 * velocityFactor +
    0.25 * arrivalUrgencyFactor +
    0.25 * criticalityFactor;

  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let category = 'LOW';
  if (score >= 75) category = 'CRITICAL';
  else if (score >= 50) category = 'HIGH';
  else if (score >= 25) category = 'MODERATE';

  return { score, category, factors: { depthFactor, velocityFactor, arrivalUrgencyFactor, criticalityFactor } };
}

// Test 1: Distance
const dist = calculateHaversineDistanceM(20.03535, 73.68311, 19.9975, 73.7898);
console.log(`[TEST 1] Distance Gangapur -> Nashik: ${(dist / 1000).toFixed(2)} km`);
assert(dist > 10000 && dist < 14000, 'Distance should be ~11.8 km');

// Test 2: Unflooded Risk
const safe = calculateHADRRiskScore(0, 0, null);
console.log(`[TEST 2] Safe zone risk: score=${safe.score}, cat=${safe.category}`);
assert.strictEqual(safe.score, 0);
assert.strictEqual(safe.category, 'SAFE');

// Test 3: Catastrophic Hospital Risk
const catRisk = calculateHADRRiskScore(4.5, 6.2, 15, 'hospital');
console.log(`[TEST 3] Catastrophic Hospital risk: score=${catRisk.score}, cat=${catRisk.category}`);
assert(catRisk.score >= 75, 'Catastrophic risk should be >= 75');
assert.strictEqual(catRisk.category, 'CRITICAL');

// Test 4: Moderate School Risk
const modRisk = calculateHADRRiskScore(1.2, 1.8, 60, 'school');
console.log(`[TEST 4] Moderate School risk: score=${modRisk.score}, cat=${modRisk.category}`);
assert(modRisk.score >= 25 && modRisk.score < 75, 'Moderate risk in range [25, 75)');

console.log('✅ ALL HADR ENGINE MATHEMATICAL TESTS PASSED SUCCESSFULLY.');
