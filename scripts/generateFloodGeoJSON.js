const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'src', 'data', 'studyAreas', 'gangapur', 'flood');

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Ensure output dirs
ensureDirSync(path.join(outputDir, 'partial'));
ensureDirSync(path.join(outputDir, 'catastrophic'));

// Dam coordinates
const damLat = 20.03535;
const damLon = 73.68311;

// Approximate river path points (South-East towards Nashik)
const riverPath = [
  { lat: 20.035, lon: 73.683 },
  { lat: 20.025, lon: 73.700 },
  { lat: 20.010, lon: 73.725 },
  { lat: 19.995, lon: 73.750 },
  { lat: 19.980, lon: 73.780 },
  { lat: 19.970, lon: 73.810 }
];

// Simple function to generate a polygon along a segment of the river
function generateRiverPolygon(progress, widthFactor, scenario) {
  if (progress <= 0) return null;
  
  const endIdx = Math.max(1, Math.floor(progress * (riverPath.length - 1)));
  const fraction = (progress * (riverPath.length - 1)) % 1;
  
  let currentPath = riverPath.slice(0, endIdx);
  if (fraction > 0 && endIdx < riverPath.length) {
    const p1 = riverPath[endIdx - 1];
    const p2 = riverPath[endIdx];
    currentPath.push({
      lat: p1.lat + (p2.lat - p1.lat) * fraction,
      lon: p1.lon + (p2.lon - p1.lon) * fraction
    });
  }

  // Create a buffer around the path
  const leftSide = [];
  const rightSide = [];
  
  for (let i = 0; i < currentPath.length; i++) {
    const pt = currentPath[i];
    let dx = 0, dy = 0;
    if (i < currentPath.length - 1) {
      dx = currentPath[i+1].lon - pt.lon;
      dy = currentPath[i+1].lat - pt.lat;
    } else if (i > 0) {
      dx = pt.lon - currentPath[i-1].lon;
      dy = pt.lat - currentPath[i-1].lat;
    }
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    // Perpendicular vector
    const nx = -dy / len;
    const ny = dx / len;
    
    // Width increases as it goes downstream, but scaled by widthFactor
    // Add some random noise for "natural" look
    const localWidth = 0.005 + (i * 0.002) + (widthFactor * 0.02);
    
    leftSide.push([pt.lon + nx * localWidth, pt.lat + ny * localWidth]);
    rightSide.unshift([pt.lon - nx * localWidth, pt.lat - ny * localWidth]); // unshift for reverse order
  }
  
  // Cap the ends to make a closed polygon
  const coordinates = [...leftSide, ...rightSide, leftSide[0]];

  // Determine depth category based on scenario severity and distance
  let depthCategory = 'SHALLOW';
  if (scenario === 'catastrophic') {
    if (progress > 0.5) depthCategory = 'CRITICAL';
    else depthCategory = 'MODERATE';
  } else {
    if (progress > 0.8) depthCategory = 'MODERATE';
    else depthCategory = 'SHALLOW';
  }

  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {
        depthCategory,
        description: 'PRECOMPUTED PROTOTYPE FLOOD EXTENT'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    }]
  };
}

const timesteps = [0, 15, 30, 60, 120];

// Partial Scenario
timesteps.forEach(t => {
  let progress = 0;
  if (t === 15) progress = 0.1;
  if (t === 30) progress = 0.25;
  if (t === 60) progress = 0.5;
  if (t === 120) progress = 0.7;
  
  const geojson = generateRiverPolygon(progress, 0.2, 'partial');
  
  const fileContent = `// PRECOMPUTED PROTOTYPE FLOOD EXTENT
import type * as GeoJSON from 'geojson';
export const partial_t${t}: GeoJSON.FeatureCollection = ${geojson ? JSON.stringify(geojson, null, 2) : '{"type": "FeatureCollection", "features": []}'};
`;
  fs.writeFileSync(path.join(outputDir, 'partial', `t${t}.ts`), fileContent);
});

// Catastrophic Scenario
timesteps.forEach(t => {
  let progress = 0;
  if (t === 15) progress = 0.3;
  if (t === 30) progress = 0.6;
  if (t === 60) progress = 0.9;
  if (t === 120) progress = 1.0;
  
  const geojson = generateRiverPolygon(progress, 0.8, 'catastrophic');
  
  const fileContent = `// PRECOMPUTED PROTOTYPE FLOOD EXTENT
import type * as GeoJSON from 'geojson';
export const catastrophic_t${t}: GeoJSON.FeatureCollection = ${geojson ? JSON.stringify(geojson, null, 2) : '{"type": "FeatureCollection", "features": []}'};
`;
  fs.writeFileSync(path.join(outputDir, 'catastrophic', `t${t}.ts`), fileContent);
});

console.log('GeoJSON flood extent data generated successfully.');
