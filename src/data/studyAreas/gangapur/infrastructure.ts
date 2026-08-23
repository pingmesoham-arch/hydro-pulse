import type { InfrastructureAsset } from '../types';

import rawData from '../../geostatial/gangapur/infrastructure.geojson?raw';

const parsed = JSON.parse(rawData);

export const gangapurInfrastructure: InfrastructureAsset[] = parsed.features.map((feature: any) => ({
  id: feature.id || feature.properties?.['@id'] || Math.random().toString(),
  name: feature.properties?.name || "Unnamed Asset",
  type: feature.properties?.amenity || feature.properties?.building || feature.properties?.highway || "infrastructure",
  latitude: feature.geometry.coordinates[1],
  longitude: feature.geometry.coordinates[0],
  elevationM: 570, // Default elevation fallback for prototype
  damId: "gangapur-dam",
  source: "OpenStreetMap",
  status: "REFERENCE"
}));
