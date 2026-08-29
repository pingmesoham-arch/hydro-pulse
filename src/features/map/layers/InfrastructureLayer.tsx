import { useEffect, useState } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { fetchInfrastructure } from '../../../data/studyAreas/resolver';

interface InfrastructureLayerProps {
  damId: string;
  isLightMap: boolean;
  showMapLabels: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function InfrastructureLayer({ damId, isLightMap, showMapLabels, onLoadingChange }: InfrastructureLayerProps) {
  const [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    let mounted = true;
    onLoadingChange?.(true);
    
    fetchInfrastructure(damId).then((infData) => {
      if (mounted) {
        setData(infData);
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
    <>
      {data.map(inf => {
        let markerColor = '#facc15'; // Default yellow
        
        if (isLightMap) {
          if (inf.type === 'hospital') markerColor = '#ef4444'; // Red
          else if (inf.type === 'school') markerColor = '#f59e0b'; // Amber
          else if (inf.type === 'bridge') markerColor = '#64748b'; // Slate
          else markerColor = '#0891b2'; // Cyan
        }

        return (
          <CircleMarker
            key={inf.id}
            center={[inf.latitude, inf.longitude]}
            radius={5}
            pathOptions={{ color: isLightMap ? '#ffffff' : markerColor, fillColor: markerColor, fillOpacity: 0.9, weight: 1.5 }}
          >
            {showMapLabels && (
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                {inf.name} ({inf.type})
              </Tooltip>
            )}
          </CircleMarker>
        );
      })}
    </>
  );
}
