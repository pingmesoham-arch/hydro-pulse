import { Outlet, NavLink } from 'react-router-dom';
import { Waves, Map, Activity, BarChart3, ShieldAlert, Layers, Settings, ChevronRight } from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';
import clsx from 'clsx';
import DemoWalkthrough from '../components/DemoWalkthrough';
import { useState } from 'react';

import { getStudyAreaData } from '../data/studyAreas/resolver';

function LayersPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { activeTheme, setActiveTheme, mapLayers, setMapLayers, selectedDam } = useSimulationStore();
  const studyData = selectedDam ? getStudyAreaData(selectedDam.id) : null;
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute bottom-6 left-24 w-64 bg-surface-container-highest border border-outline-variant shadow-2xl z-50 rounded-lg overflow-hidden flex flex-col pointer-events-auto">
      <div className="bg-surface-container p-3 border-b border-outline-variant flex justify-between items-center">
        <h3 className="text-xs font-bold tracking-widest text-on-surface uppercase">Layers</h3>
        <button onClick={onClose} className="text-on-surface-variant hover:text-white">&times;</button>
      </div>
      
      <div className="p-4 space-y-6">
        <div>
          <h4 className="text-[10px] font-bold tracking-widest text-primary uppercase mb-3 border-b border-outline-variant pb-1">Map Layers</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer hover:text-primary transition-colors">
              <input type="checkbox" checked={mapLayers.baseMap} onChange={(e) => setMapLayers({ baseMap: e.target.checked })} className="accent-primary" />
              Base Map
            </label>
            <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer hover:text-primary transition-colors">
              <input type="checkbox" checked={mapLayers.damLocation} onChange={(e) => setMapLayers({ damLocation: e.target.checked })} className="accent-primary" />
              Dam Location
            </label>
            
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer hover:text-primary transition-colors">
                <input type="checkbox" checked={mapLayers.floodExtent} onChange={(e) => setMapLayers({ floodExtent: e.target.checked })} className="accent-primary" />
                Flood Extent
              </label>
              {mapLayers.floodExtent && (!studyData?.hasFloodData) && (
                <div className="text-[10px] text-error pl-6">Precomputed flood extent unavailable for this study area.</div>
              )}
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer hover:text-primary transition-colors">
                <input type="checkbox" checked={mapLayers.infrastructure} onChange={(e) => setMapLayers({ infrastructure: e.target.checked })} className="accent-primary" />
                Infrastructure
              </label>
              {mapLayers.infrastructure && (!studyData?.infrastructure) && (
                <div className="text-[10px] text-error pl-6">Reference infrastructure dataset unavailable for this study area.</div>
              )}
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer hover:text-primary transition-colors">
                <input type="checkbox" checked={mapLayers.roads} onChange={(e) => setMapLayers({ roads: e.target.checked })} className="accent-primary" />
                Roads
              </label>
              {mapLayers.roads && (!studyData?.roads) && (
                <div className="text-[10px] text-error pl-6">Road dataset unavailable for this study area.</div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-[10px] font-bold tracking-widest text-primary uppercase mb-3 border-b border-outline-variant pb-1">Visual Theme</h4>
          <div className="space-y-2">
            {[
              { id: 'hydro-pulse-light', label: 'Hydro_Pulse Light' },
              { id: 'hydro-pulse-dark-gis', label: 'Hydro_Pulse Dark GIS' },
              { id: 'cyberpunk-neon', label: 'Cyberpunk Neon' },
              { id: 'swiss-minimal', label: 'Swiss Minimal' },
              { id: 'enterprise', label: 'Enterprise' },
              { id: 'synthwave', label: 'Synthwave' },
              { id: 'eco-natural', label: 'Eco Natural' },
            ].map(theme => (
              <label key={theme.id} className="flex items-center gap-2 text-sm text-on-surface cursor-pointer hover:text-primary transition-colors">
                <input 
                  type="radio" 
                  name="theme" 
                  checked={activeTheme === theme.id} 
                  onChange={() => setActiveTheme(theme.id as any)}
                  className="accent-primary"
                />
                {theme.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SideNavBar({ onToggleLayers }: { onToggleLayers: () => void }) {
  return (
    <nav className="w-20 bg-surface-container border-r border-outline-variant flex flex-col items-center py-6 gap-2 fixed left-0 top-16 bottom-0 z-50">
      <NavLink 
        to="/" 
        className={({ isActive }) => clsx(
          "flex flex-col items-center gap-1 group w-16 py-3 rounded-lg transition-colors",
          isActive ? "bg-primary-container text-on-surface" : "text-on-surface-variant hover:text-primary hover:bg-surface-variant"
        )}
      >
        <Map className={clsx("w-6 h-6 transition-transform", "group-hover:scale-110")} />
        <span className="text-[10px] font-semibold">Overview</span>
      </NavLink>
      <NavLink 
        to="/scenario" 
        className={({ isActive }) => clsx(
          "flex flex-col items-center gap-1 group w-16 py-3 rounded-lg transition-colors",
          isActive ? "bg-primary-container text-on-surface" : "text-on-surface-variant hover:text-primary hover:bg-surface-variant"
        )}
      >
        <Activity className={clsx("w-6 h-6 transition-transform", "group-hover:scale-110")} />
        <span className="text-[10px] font-semibold">Scenario</span>
      </NavLink>
      <NavLink 
        to="/simulation" 
        className={({ isActive }) => clsx(
          "flex flex-col items-center gap-1 group w-16 py-3 rounded-lg transition-colors",
          isActive ? "bg-primary-container text-on-surface" : "text-on-surface-variant hover:text-primary hover:bg-surface-variant"
        )}
      >
        <Waves className={clsx("w-6 h-6 transition-transform", "group-hover:scale-110")} />
        <span className="text-[10px] font-semibold">Simulation</span>
      </NavLink>
      <NavLink 
        to="/results" 
        className={({ isActive }) => clsx(
          "flex flex-col items-center gap-1 group w-16 py-3 rounded-lg transition-colors",
          isActive ? "bg-primary-container text-on-surface" : "text-on-surface-variant hover:text-primary hover:bg-surface-variant"
        )}
      >
        <BarChart3 className={clsx("w-6 h-6 transition-transform", "group-hover:scale-110")} />
        <span className="text-[10px] font-semibold">Results</span>
      </NavLink>
      <NavLink 
        to="/emergency" 
        className={({ isActive }) => clsx(
          "flex flex-col items-center gap-1 group w-16 py-3 rounded-lg transition-colors",
          isActive ? "bg-primary-container text-on-surface" : "text-on-surface-variant hover:text-primary hover:bg-surface-variant"
        )}
      >
        <ShieldAlert className={clsx("w-6 h-6 transition-transform", "group-hover:scale-110")} />
        <span className="text-[10px] font-semibold">Emergency</span>
      </NavLink>
      <div className="flex-grow"></div>
      <button onClick={onToggleLayers} className="flex flex-col items-center gap-1 group w-16 py-3 rounded-lg transition-colors text-on-surface-variant hover:text-primary hover:bg-surface-variant">
        <Layers className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-semibold">Layers</span>
      </button>
    </nav>
  );
}

import teamLogo from '../assets/team-logo.png';
import { dams } from '../data/dams';

function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { activeTheme, setActiveTheme, autoCenterMap, setAutoCenterMap, showMapLabels, setShowMapLabels } = useSimulationStore();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto bg-black/50 backdrop-blur-sm">
      <div className="w-[500px] bg-surface-container border border-outline-variant rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-surface-container-highest p-4 border-b border-outline-variant flex justify-between items-center">
          <h2 className="text-sm font-bold tracking-widest text-on-surface uppercase">Settings</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-white">&times;</button>
        </div>
        
        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
          
          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-primary uppercase mb-3 border-b border-outline-variant pb-1">Display</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'hydro-pulse-light', label: 'Hydro_Pulse Light' },
                { id: 'hydro-pulse-dark-gis', label: 'Hydro_Pulse Dark GIS' },
                { id: 'cyberpunk-neon', label: 'Cyberpunk Neon' },
                { id: 'swiss-minimal', label: 'Swiss Minimal' },
                { id: 'enterprise', label: 'Enterprise' },
                { id: 'synthwave', label: 'Synthwave' },
                { id: 'eco-natural', label: 'Eco Natural' },
              ].map(theme => (
                <label key={theme.id} className="flex items-center gap-2 text-sm text-on-surface cursor-pointer hover:text-primary transition-colors">
                  <input 
                    type="radio" 
                    name="modal-theme" 
                    checked={activeTheme === theme.id} 
                    onChange={() => setActiveTheme(theme.id as any)}
                    className="accent-primary"
                  />
                  {theme.label}
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-primary uppercase mb-3 border-b border-outline-variant pb-1">Map</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer hover:text-primary transition-colors">
                <input 
                  type="checkbox" 
                  checked={showMapLabels} 
                  onChange={(e) => setShowMapLabels(e.target.checked)}
                  className="accent-primary"
                />
                Show map labels
              </label>
              <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer hover:text-primary transition-colors">
                <input 
                  type="checkbox" 
                  checked={autoCenterMap} 
                  onChange={(e) => setAutoCenterMap(e.target.checked)}
                  className="accent-primary"
                />
                Auto-center on selected dam
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-primary uppercase mb-3 border-b border-outline-variant pb-1">System</h3>
            <div className="text-xs text-on-surface-variant space-y-2">
              <p><strong>Hydraulic Model:</strong> Prototype / Bathtub Equation</p>
              <p><strong>Infrastructure:</strong> Public Reference Data (where available)</p>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-primary uppercase mb-3 border-b border-outline-variant pb-1">About</h3>
            <div className="text-xs text-on-surface-variant space-y-2">
              <p><strong className="text-white">Hydro_Pulse</strong> - Prototype Dam-Break Inundation System.</p>
              <p>Built for SIH PS 26161.</p>
              <p>NTRO Problem Statement.</p>
              <p>Disclaimer: Uses prototype and precomputed data. Not a validated hydrodynamic model.</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

function TopNavBar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { simulationStatus, selectedDam, setSelectedDam } = useSimulationStore();
  
  return (
    <header className="h-16 fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-6 pl-26">
      <div className="flex items-center gap-6 pl-20">
        <div className="flex items-center gap-3">
          <img src={teamLogo} alt="Team Logo" className="h-12 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight text-on-surface">Hydro<span className="text-primary">_Pulse</span></span>
        </div>
        
        <div className="h-6 w-px bg-outline-variant mx-2"></div>
        
        <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
          <select 
            value={selectedDam?.id || ''}
            onChange={(e) => {
              const dam = dams.find(d => d.id === e.target.value);
              if (dam) setSelectedDam(dam);
            }}
            className="bg-transparent text-on-surface font-bold border-b border-dashed border-outline-variant cursor-pointer focus:outline-none focus:border-primary pb-0.5"
          >
            {dams.map(d => (
              <option key={d.id} value={d.id} className="bg-surface-container">{d.name}</option>
            ))}
          </select>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-on-surface">{selectedDam?.district || selectedDam?.state} Study Area</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={clsx(
            "w-2 h-2 rounded-full",
            simulationStatus === 'ready' ? "bg-primary animate-pulse" : 
            simulationStatus === 'idle' ? "bg-outline-variant" : "bg-warning"
          )}></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            {simulationStatus === 'computing' ? 'Computing...' : 
             simulationStatus === 'ready' ? 'Data Ready' : 'Idle'}
          </span>
        </div>
        <div className="h-4 w-px bg-outline-variant mx-1"></div>
        <button onClick={onOpenSettings} className="text-on-surface-variant hover:text-primary transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

export default function MainLayout() {
  const [layersOpen, setLayersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col overflow-hidden transition-colors duration-200">
      <TopNavBar onOpenSettings={() => setSettingsOpen(true)} />
      <div className="flex flex-1 pt-16">
        <SideNavBar onToggleLayers={() => setLayersOpen(!layersOpen)} />
        <main className="flex-1 ml-20 relative h-[calc(100vh-64px)]">
          <Outlet />
          <LayersPanel isOpen={layersOpen} onClose={() => setLayersOpen(false)} />
          <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </main>
        <DemoWalkthrough />
      </div>
    </div>
  );
}
