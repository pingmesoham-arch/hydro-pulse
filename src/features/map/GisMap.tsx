import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Popup, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useSimulationStore } from '../../store/useSimulationStore';
import { RoadsLayer } from './layers/RoadsLayer';
import { InfrastructureLayer } from './layers/InfrastructureLayer';
import { FloodExtentLayer } from './layers/FloodExtentLayer';
import { LocationInspector } from './LocationInspector';
import { Loader2 } from 'lucide-react';

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
  
  const centerCoord: [number, number] = selectedDam ? [selectedDam.latitude, selectedDam.longitude] : [20.03535, 73.68311];
  
  const currentExtent = simulationResults?.timesteps?.[currentTimelineIndex]?.floodExtent;

  const isLightMap = activeTheme === 'hydro-pulse-light' || activeTheme === 'eco-natural' || activeTheme === 'swiss-minimal' || activeTheme === 'enterprise';

  const basemapUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const [isRoadsLoading, setIsRoadsLoading] = useState(false);
  const [isInfraLoading, setIsInfraLoading] = useState(false);

  const handleRoadsLoadingChange = useCallback((loading: boolean) => {
    setIsRoadsLoading(loading);
  }, []);

  const handleInfraLoadingChange = useCallback((loading: boolean) => {
    setIsInfraLoading(loading);
  }, []);

  const isMapLoading = isRoadsLoading || isInfraLoading;

  return (
    <div className="w-full h-full relative z-0 bg-background">
      {isMapLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-surface-container-highest/90 backdrop-blur-sm px-4 py-2 rounded-full border border-outline-variant shadow-lg flex items-center gap-2 pointer-events-none transition-opacity duration-300">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs font-semibold text-on-surface">Loading geospatial data...</span>
        </div>
      )}
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
            keepBuffer={2}
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
        
        {mapLayers.roads && selectedDam && (
          <RoadsLayer 
            damId={selectedDam.id} 
            isLightMap={isLightMap} 
            onLoadingChange={handleRoadsLoadingChange} 
          />
        )}
        
        {mapLayers.floodExtent && currentExtent && selectedDam?.id === 'gangapur-dam' && (
          <FloodExtentLayer 
            damId={selectedDam.id}
            scenarioId={selectedScenario?.scenario?.id}
            timelineIndex={currentTimelineIndex}
            isLightMap={isLightMap}
            currentExtent={currentExtent}
          />
        )}

        {mapLayers.infrastructure && selectedDam && (
          <InfrastructureLayer
            damId={selectedDam.id}
            isLightMap={isLightMap}
            showMapLabels={showMapLabels}
            onLoadingChange={handleInfraLoadingChange}
          />
        )}

        {/* Interactive Location Inspector HUD */}
        <LocationInspector isLightMap={isLightMap} />
      </MapContainer>
    </div>
  );
}
