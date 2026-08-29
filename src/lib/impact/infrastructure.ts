import type * as GeoJSON from 'geojson';
import type { InfrastructureAsset } from '../../data/studyAreas/types';

/**
 * Lightweight dependency-free Ray-Casting algorithm to check if a point is inside a polygon.
 * 
 * @param point [longitude, latitude]
 * @param polygonCoords Array of coordinate pairs representing a single-ring polygon.
 * @returns boolean
 */
export function isPointInPolygon(point: [number, number], polygonCoords: number[][]): boolean {
  const x = point[0]; // lon
  const y = point[1]; // lat
  let inside = false;
  
  for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
    const xi = polygonCoords[i][0];
    const yi = polygonCoords[i][1];
    const xj = polygonCoords[j][0];
    const yj = polygonCoords[j][1];
    
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) {
      inside = !inside;
    }
  }
  
  return inside;
}

/**
 * Assesses the risk level of an infrastructure asset based on the current flood polygon.
 * 
 * @param asset The infrastructure asset with lat/lon.
 * @param floodExtent The current timestep's GeoJSON flood extent.
 * @returns 'SAFE' | 'SHALLOW' | 'MODERATE' | 'CRITICAL'
 */
/**
 * Assesses the risk level of an infrastructure asset based on the current flood polygon.
 * 
 * @param asset The infrastructure asset with lat/lon.
 * @param floodExtent The current timestep's GeoJSON flood extent.
 * @returns 'SAFE' | 'SHALLOW' | 'MODERATE' | 'CRITICAL'
 */
export function assessInfrastructureRisk(
  asset: InfrastructureAsset,
  floodExtent?: GeoJSON.FeatureCollection
): 'SAFE' | 'SHALLOW' | 'MODERATE' | 'CRITICAL' {
  if (!floodExtent || !floodExtent.features || floodExtent.features.length === 0) {
    return 'SAFE';
  }

  const point: [number, number] = [asset.longitude, asset.latitude];
  let highestRisk: 'SAFE' | 'SHALLOW' | 'MODERATE' | 'CRITICAL' = 'SAFE';

  for (const feature of floodExtent.features) {
    const geometry = feature.geometry;
    let inside = false;

    if (geometry.type === 'Polygon') {
      const coords = geometry.coordinates[0];
      if (coords && isPointInPolygon(point, coords)) {
        inside = true;
      }
    } else if (geometry.type === 'MultiPolygon') {
      for (const poly of geometry.coordinates) {
        if (poly[0] && isPointInPolygon(point, poly[0])) {
          inside = true;
          break;
        }
      }
    }

    if (inside) {
      const depthCategory = feature.properties?.depthCategory;
      if (depthCategory === 'CRITICAL') return 'CRITICAL';
      if (depthCategory === 'MODERATE') highestRisk = 'MODERATE';
      else if (depthCategory === 'SHALLOW' && highestRisk === 'SAFE') highestRisk = 'SHALLOW';
      else if (highestRisk === 'SAFE') highestRisk = 'MODERATE';
    }
  }

  return highestRisk;
}

/**
 * Assesses the risk level of a road/LineString asset based on the current flood polygon.
 * 
 * @param road The road GeoJSON feature.
 * @param floodExtent The current timestep's GeoJSON flood extent.
 * @returns 'SAFE' | 'SHALLOW' | 'MODERATE' | 'CRITICAL'
 */
export function assessRoadRisk(
  road: GeoJSON.Feature,
  floodExtent?: GeoJSON.FeatureCollection
): 'SAFE' | 'SHALLOW' | 'MODERATE' | 'CRITICAL' {
  if (!floodExtent || !floodExtent.features || floodExtent.features.length === 0) {
    return 'SAFE';
  }

  if (road.geometry.type !== 'LineString' && road.geometry.type !== 'MultiLineString') {
    return 'SAFE'; 
  }

  let highestRisk: 'SAFE' | 'SHALLOW' | 'MODERATE' | 'CRITICAL' = 'SAFE';

  for (const feature of floodExtent.features) {
    const floodGeom = feature.geometry;
    let isAffected = false;

    const testLineAgainstRing = (lineCoords: [number, number][], ringCoords: number[][]) => {
      for (const pt of lineCoords) {
        if (isPointInPolygon([pt[0], pt[1]], ringCoords)) {
          return true;
        }
      }
      return false;
    };

    if (floodGeom.type === 'Polygon') {
      const ring = floodGeom.coordinates[0];
      if (ring) {
        if (road.geometry.type === 'LineString') {
          isAffected = testLineAgainstRing(road.geometry.coordinates as [number, number][], ring);
        } else if (road.geometry.type === 'MultiLineString') {
          for (const line of road.geometry.coordinates as [number, number][][]) {
            if (testLineAgainstRing(line, ring)) {
              isAffected = true;
              break;
            }
          }
        }
      }
    } else if (floodGeom.type === 'MultiPolygon') {
      for (const poly of floodGeom.coordinates) {
        const ring = poly[0];
        if (ring) {
          if (road.geometry.type === 'LineString') {
            if (testLineAgainstRing(road.geometry.coordinates as [number, number][], ring)) {
              isAffected = true;
              break;
            }
          } else if (road.geometry.type === 'MultiLineString') {
            for (const line of road.geometry.coordinates as [number, number][][]) {
              if (testLineAgainstRing(line, ring)) {
                isAffected = true;
                break;
              }
            }
            if (isAffected) break;
          }
        }
      }
    }

    if (isAffected) {
      const depthCategory = feature.properties?.depthCategory;
      if (depthCategory === 'CRITICAL') return 'CRITICAL';
      if (depthCategory === 'MODERATE') highestRisk = 'MODERATE';
      else if (depthCategory === 'SHALLOW' && highestRisk === 'SAFE') highestRisk = 'SHALLOW';
      else if (highestRisk === 'SAFE') highestRisk = 'MODERATE';
    }
  }

  return highestRisk;
}
