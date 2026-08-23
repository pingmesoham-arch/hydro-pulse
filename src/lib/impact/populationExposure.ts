import type * as GeoJSON from 'geojson';

export interface PopulationExposure {
  critical: number;
  high: number;
  moderate: number;
}

/**
 * Calculates population exposure based on a flood polygon.
 * 
 * In a real implementation, this would intersect the GeoJSON polygon 
 * with a gridded population dataset (e.g. WorldPop, GHSL) using geospatial logic.
 * 
 * For this MVP, we use a procedural estimate scaled by the polygon's size
 * and the scenario's severity.
 */
export function estimatePopulationExposure(
  floodExtent: GeoJSON.FeatureCollection,
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
  discharge: number
): PopulationExposure {
  if (!floodExtent || !floodExtent.features || floodExtent.features.length === 0) {
    return {
      critical: 0,
      high: 0,
      moderate: 0
    };
  }



  
  // Base population scalar
  const basePop = discharge * 0.5;

  let critical = 0;
  let high = 0;
  let moderate = 0;

  if (severity === 'CRITICAL') {
    critical = basePop * 0.6;
    high = basePop * 0.3;
    moderate = basePop * 0.1;
  } else if (severity === 'HIGH') {
    critical = basePop * 0.2;
    high = basePop * 0.5;
    moderate = basePop * 0.3;
  } else {
    critical = basePop * 0.05;
    high = basePop * 0.25;
    moderate = basePop * 0.7;
  }

  return {
    critical: Math.round(critical),
    high: Math.round(high),
    moderate: Math.round(moderate)
  };
}
