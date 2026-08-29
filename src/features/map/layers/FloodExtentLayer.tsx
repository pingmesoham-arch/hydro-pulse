import { GeoJSON } from 'react-leaflet';
import type * as GeoJSONTypes from 'geojson';
import { useMemo } from 'react';

interface FloodExtentLayerProps {
  damId: string;
  scenarioId: string | undefined;
  timelineIndex: number;
  isLightMap: boolean;
  currentExtent: GeoJSONTypes.FeatureCollection;
}

export function FloodExtentLayer({ damId, scenarioId, timelineIndex, isLightMap, currentExtent }: FloodExtentLayerProps) {
  
  // Memoize the style function so it's stable, though isLightMap changes rarely
  const styleFn = useMemo(() => {
    return (feature: any) => {
      // Default (Dark map)
      let color = '#00b4d8';
      let fillColor = '#4cd6fb';
      let fillOpacity = 0.3;
      
      const depth = feature?.properties?.depthCategory;
      
      if (isLightMap) {
        if (depth === 'SHALLOW' || !depth) {
          color = '#38BDF8';
          fillColor = '#38BDF8';
          fillOpacity = 0.4;
        } else if (depth === 'MODERATE') {
          color = '#0284C7';
          fillColor = '#0284C7';
          fillOpacity = 0.6;
        } else if (depth === 'CRITICAL') {
          color = '#0C4A6E';
          fillColor = '#0C4A6E';
          fillOpacity = 0.75;
        }
      } else {
        if (depth === 'MODERATE') {
          color = '#0077b6';
          fillColor = '#0096c7';
          fillOpacity = 0.5;
        } else if (depth === 'CRITICAL') {
          color = '#03045e';
          fillColor = '#023e8a';
          fillOpacity = 0.7;
        }
      }

      return {
        color, 
        fillColor, 
        fillOpacity,
        weight: isLightMap ? 1 : 2
      };
    };
  }, [isLightMap]);

  if (!currentExtent) return null;

  return (
    <GeoJSON 
      key={`${damId}-${scenarioId}-${timelineIndex}-${isLightMap}`}
      data={currentExtent} 
      style={styleFn}
    />
  );
}
