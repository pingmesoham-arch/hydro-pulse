import { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { fetchRoads } from '../../../data/studyAreas/resolver';
import type * as GeoJSONTypes from 'geojson';

interface RoadsLayerProps {
  damId: string;
  isLightMap: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function RoadsLayer({ damId, isLightMap, onLoadingChange }: RoadsLayerProps) {
  const [data, setData] = useState<GeoJSONTypes.FeatureCollection | null>(null);

  useEffect(() => {
    let mounted = true;
    onLoadingChange?.(true);
    
    fetchRoads(damId).then((roadsData) => {
      if (mounted) {
        setData(roadsData);
        onLoadingChange?.(false);
      }
    });

    return () => {
      mounted = false;
      onLoadingChange?.(false);
    };
  }, [damId, onLoadingChange]);

  if (!data) return null;

  return (
    <GeoJSON 
      key={`roads-${damId}-${isLightMap}`}
      data={data}
      style={(feature) => {
        const highway = feature?.properties?.highway;
        
        let weight = isLightMap ? 1 : 1.5;
        let color = isLightMap ? '#94a3b8' : '#475569';
        
        if (highway === 'trunk' || highway === 'motorway') {
          weight = isLightMap ? 2.5 : 3;
          color = isLightMap ? '#475569' : '#94a3b8';
        } else if (highway === 'primary') {
          weight = isLightMap ? 2 : 2.5;
          color = isLightMap ? '#64748b' : '#cbd5e1';
        } else if (highway === 'secondary') {
          weight = isLightMap ? 1.5 : 2;
          color = isLightMap ? '#94a3b8' : '#e2e8f0';
        }

        return {
          color,
          weight,
          opacity: isLightMap ? 0.9 : 0.8
        };
      }}
    />
  );
}
