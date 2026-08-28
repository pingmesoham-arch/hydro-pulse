import { useEffect } from 'react';
import { MapContainer, TileLayer, Popup, useMap, CircleMarker, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useSimulationStore } from '../../store/useSimulationStore';
import { getStudyAreaData } from '../../data/studyAreas/resolver';

function MapController() {
  const map = useMap();
  const { selectedDam, autoCenterMap } = useSimulationStore();

  useEffect(() => {
    if (selectedDam && autoCenterMap) {
      map.flyTo([selectedDam.latitude, selectedDam.longitude], 13, { animate: true, duration: 1.5 });
    }
  }, [selectedDam, map, autoCenterMap]);

  return null;
}

export default function GisMap() {
  const { selectedDam, selectedScenario, simulationResults, currentTimelineIndex, mapLayers, showMapLabels, activeTheme } = useSimulationStore();
  const studyData = selectedDam ? getStudyAreaData(selectedDam.id) : null;

  const centerCoord: [number, number] = selectedDam ? [selectedDam.latitude, selectedDam.longitude] : [20.03535, 73.68311];
  
  const currentExtent = simulationResults?.timesteps?.[currentTimelineIndex]?.floodExtent;

  const isLightMap = activeTheme === 'hydro-pulse-light' || activeTheme === 'eco-natural' || activeTheme === 'swiss-minimal' || activeTheme === 'enterprise';

  const basemapUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <div className="w-full h-full relative z-0 bg-background">
      <MapContainer 
        center={centerCoord} 
        zoom={13} 
        style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-surface)' }}
        zoomControl={false}
      >
        {mapLayers.baseMap && (
          <TileLayer
            key={basemapUrl}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        )}
        <MapController />

        {mapLayers.damLocation && selectedDam && (
          <CircleMarker
            center={[selectedDam.latitude, selectedDam.longitude]}
            radius={8}
            pathOptions={{ 
              color: isLightMap ? '#0891b2' : '#00e5ff', 
              fillColor: isLightMap ? '#0891b2' : '#00e5ff', 
              fillOpacity: 0.8,
              weight: 3
            }}
          >
            <Popup className="text-sm">
              <div className="font-bold text-primary">{selectedDam.name}</div>
              <div className="text-xs text-on-surface-variant">{selectedDam.river}</div>
              <div className="mt-1 text-on-surface">
                Type: {selectedDam.type}<br />
                Height: {selectedDam.heightM}m<br />
                Storage: {selectedDam.grossStorageMcm} MCM
              </div>
            </Popup>
          </CircleMarker>
        )}
        
        {mapLayers.roads && studyData?.roads && (
          <GeoJSON 
            key={`roads-${selectedDam?.id}-${isLightMap}`}
            data={studyData.roads}
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
        )}
        
        {mapLayers.floodExtent && currentExtent && selectedDam?.id === 'gangapur-dam' && (
          <GeoJSON 
            key={`${selectedDam?.id}-${selectedScenario?.scenario?.id}-${currentTimelineIndex}-${isLightMap}`}
            data={currentExtent} 
            style={(feature) => {
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
            }}
          />
        )}

        {mapLayers.infrastructure && studyData?.infrastructure && studyData.infrastructure.map(inf => {
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


      </MapContainer>
    </div>
  );
}
