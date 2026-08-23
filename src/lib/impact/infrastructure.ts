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
export function assessInfrastructureRisk(
  asset: InfrastructureAsset,
  floodExtent?: GeoJSON.FeatureCollection
): 'SAFE' | 'SHALLOW' | 'MODERATE' | 'CRITICAL' {
  if (!floodExtent || !floodExtent.features || floodExtent.features.length === 0) {
    return 'SAFE';
  }

  // Assuming single feature for prototype
  const feature = floodExtent.features[0];
  const geometry = feature.geometry;

  if (geometry.type !== 'Polygon') {
    return 'SAFE'; // Only handling Polygon in this prototype
  }

  // First ring is the exterior boundary
  const coords = geometry.coordinates[0];
  const point: [number, number] = [asset.longitude, asset.latitude];

  const inside = isPointInPolygon(point, coords);

  if (inside) {
    // If inside, the risk is equivalent to the depthCategory
    const depthCategory = feature.properties?.depthCategory;
    if (depthCategory === 'CRITICAL') return 'CRITICAL';
    if (depthCategory === 'MODERATE') return 'MODERATE';
    if (depthCategory === 'SHALLOW') return 'SHALLOW';
    return 'MODERATE'; // Default if missing
  }

  return 'SAFE';
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

  const feature = floodExtent.features[0];
  const floodGeom = feature.geometry;

  if (floodGeom.type !== 'Polygon') {
    return 'SAFE';
  }

  if (road.geometry.type !== 'LineString') {
    return 'SAFE'; 
  }

  const coords = floodGeom.coordinates[0];
  const roadCoords = road.geometry.coordinates as [number, number][];

  let isAffected = false;
  for (const pt of roadCoords) {
    if (isPointInPolygon([pt[0], pt[1]], coords)) {
      isAffected = true;
      break;
    }
  }

  if (isAffected) {
    const depthCategory = feature.properties?.depthCategory;
    if (depthCategory === 'CRITICAL') return 'CRITICAL';
    if (depthCategory === 'MODERATE') return 'MODERATE';
    if (depthCategory === 'SHALLOW') return 'SHALLOW';
    return 'MODERATE';
  }

  return 'SAFE';
}
