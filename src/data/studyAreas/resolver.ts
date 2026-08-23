import type { StudyAreaData } from './types';
import type * as GeoJSON from 'geojson';
import { gangapurInfrastructure } from './gangapur/infrastructure';
import { bhakraInfrastructure } from './bhakra/infrastructure';
import { hirakudInfrastructure } from './hirakud/infrastructure';
import rawRoads from '../geostatial/gangapur/roads.geojson?raw';

let gangapurRoads: GeoJSON.FeatureCollection | null = null;
try {
  gangapurRoads = JSON.parse(rawRoads);
} catch (e) {
  console.warn("Failed to parse roads.geojson");
}

export function getStudyAreaData(damId: string): StudyAreaData {
  switch (damId) {
    case 'gangapur-dam':
      return {
        infrastructure: gangapurInfrastructure,
        roads: gangapurRoads,
        hasFloodData: true,
      };
    case 'bhakra-dam':
      return {
        infrastructure: bhakraInfrastructure.length > 0 ? bhakraInfrastructure : null,
        roads: null,
        hasFloodData: false,
      };
    case 'hirakud-dam':
      return {
        infrastructure: hirakudInfrastructure.length > 0 ? hirakudInfrastructure : null,
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
