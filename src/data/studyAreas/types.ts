export interface InfrastructureAsset {
  id: string;
  name: string;
  type: 'hospital' | 'school' | 'bridge' | 'settlement' | 'road' | 'emergency_service';
  latitude: number;
  longitude: number;
  elevationM: number;
  damId: string;
  source: string;
  status: 'REAL' | 'REFERENCE' | 'PROTOTYPE';
}

export interface StudyAreaData {
  infrastructure: InfrastructureAsset[] | null;
  roads: GeoJSON.FeatureCollection | null;
  hasFloodData: boolean;
}
