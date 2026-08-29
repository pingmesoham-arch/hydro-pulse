import type { StudyAreaData } from './types';
import type * as GeoJSON from 'geojson';

export function getStudyAreaData(damId: string): StudyAreaData {
  switch (damId) {
    case 'gangapur-dam':
      return {
        infrastructure: null,
        roads: null,
        hasFloodData: true,
      };
    case 'bhakra-dam':
      return {
        infrastructure: null,
        roads: null,
        hasFloodData: false,
      };
    case 'hirakud-dam':
      return {
        infrastructure: null,
        roads: null,
        hasFloodData: false,
      };
    default:
      return {
        infrastructure: null,
        roads: null,
        hasFloodData: false,
      };
  }
}

let cachedGangapurRoads: GeoJSON.FeatureCollection | null = null;
export async function fetchGangapurRoads(): Promise<GeoJSON.FeatureCollection | null> {
  if (cachedGangapurRoads) return cachedGangapurRoads;
  try {
    const raw = (await import('../geostatial/gangapur/roads.geojson?raw')).default;
    cachedGangapurRoads = JSON.parse(raw);
    return cachedGangapurRoads;
  } catch (e) {
    console.warn("Failed to parse roads.geojson", e);
    return null;
  }
}

let cachedGangapurInfrastructure: any[] | null = null;
export async function fetchGangapurInfrastructure() {
  if (cachedGangapurInfrastructure) return cachedGangapurInfrastructure;
  const mod = await import('./gangapur/infrastructure');
  cachedGangapurInfrastructure = mod.gangapurInfrastructure;
  return cachedGangapurInfrastructure;
}

let cachedBhakraInfrastructure: any[] | null = null;
export async function fetchBhakraInfrastructure() {
  if (cachedBhakraInfrastructure) return cachedBhakraInfrastructure;
  const mod = await import('./bhakra/infrastructure');
  cachedBhakraInfrastructure = mod.bhakraInfrastructure;
  return cachedBhakraInfrastructure;
}

let cachedHirakudInfrastructure: any[] | null = null;
export async function fetchHirakudInfrastructure() {
  if (cachedHirakudInfrastructure) return cachedHirakudInfrastructure;
  const mod = await import('./hirakud/infrastructure');
  cachedHirakudInfrastructure = mod.hirakudInfrastructure;
  return cachedHirakudInfrastructure;
}

export async function fetchInfrastructure(damId: string) {
  if (damId === 'gangapur-dam') return await fetchGangapurInfrastructure();
  if (damId === 'bhakra-dam') return await fetchBhakraInfrastructure();
  if (damId === 'hirakud-dam') return await fetchHirakudInfrastructure();
  return null;
}

export async function fetchRoads(damId: string) {
  if (damId === 'gangapur-dam') return await fetchGangapurRoads();
  return null;
}
