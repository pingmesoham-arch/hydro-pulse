import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import GisMap from './features/map/GisMap';
import ScenarioBuilder from './features/scenarios/ScenarioBuilder';
import ResultsPage from './pages/ResultsPage';
import EmergencyPage from './pages/EmergencyPage';
import { useSimulationStore } from './store/useSimulationStore';
import { Play, Pause } from 'lucide-react';
import { useEffect } from 'react';
import clsx from 'clsx';

import { getStudyAreaData } from './data/studyAreas/resolver';

function Dashboard() {
  const { selectedDam, simulationStatus } = useSimulationStore();
  const damName = selectedDam?.name || 'Gangapur Dam';
  const damRiver = selectedDam?.river || 'Godavari River';
  const damState = selectedDam?.state || 'Maharashtra';
  const damDistrict = selectedDam?.district || 'Nashik';
  const studyData = selectedDam ? getStudyAreaData(selectedDam.id) : null;

  // Clean up unused/unnecessary local state mappings
  return (
    <>
      <GisMap />
      
      {/* Welcome Panel */}
      <div className="absolute top-6 left-6 z-10 w-72 bg-surface-container/90 backdrop-blur-md border border-outline-variant shadow-lg pointer-events-auto">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <div className="text-[10px] font-bold tracking-widest text-primary uppercase">Active Study Dam</div>
          </div>
          <h2 className="text-xl font-bold text-on-surface leading-tight mb-2">{damName}</h2>
          <div className="text-[10px] text-on-surface-variant uppercase tracking-wide">{damRiver} • {damState}</div>
          
          <div className="flex items-center gap-2 mt-4 mb-3 pt-4 border-t border-outline-variant">
            <div className={clsx("w-2 h-2 rounded-full", simulationStatus === 'ready' ? "bg-primary animate-pulse" : "bg-outline-variant")}></div>
            <span className="text-xs font-semibold text-on-surface">Dam-Break Inundation Prototype</span>
          </div>
          
          <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
            Select <span className="text-on-surface font-medium">Scenario</span> to configure a dam-break scenario for this location.
          </p>

          <div className="border-t border-outline-variant pt-3">
            <div className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">Data Availability</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Hydraulic Model</span>
                {studyData?.hasFloodData ? <span className="text-primary font-medium">✓ Available</span> : <span className="text-warning font-medium">⚠ Pending</span>}
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Infrastructure</span>
                {studyData?.infrastructure ? <span className="text-primary font-medium">✓ Reference Data</span> : <span className="text-on-surface-variant font-medium">Unavailable</span>}
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Road Network</span>
                {studyData?.roads ? <span className="text-primary font-medium">✓ Reference Data</span> : <span className="text-on-surface-variant font-medium">Unavailable</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Status Panels */}
      <div className="absolute bottom-6 left-6 z-10 flex gap-4 pointer-events-none max-w-5xl">
        <div className="bg-surface-container/90 backdrop-blur-md border border-outline-variant p-4 w-36 pointer-events-auto">
          <div className="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase mb-1">Study Area</div>
          <div className="text-sm font-bold text-on-surface truncate">{damName}</div>
        </div>
        <div className="bg-surface-container/90 backdrop-blur-md border border-outline-variant p-4 w-40 pointer-events-auto">
          <div className="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase mb-1">Location</div>
          <div className="text-sm font-bold text-on-surface truncate">{damDistrict}, {damState}</div>
        </div>
        <div className="bg-surface-container/90 backdrop-blur-md border border-outline-variant p-4 w-36 pointer-events-auto">
          <div className="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase mb-1">River</div>
          <div className="text-sm font-bold text-on-surface truncate">{damRiver}</div>
        </div>
        <div className="bg-surface-container/90 backdrop-blur-md border border-outline-variant p-4 w-32 pointer-events-auto">
          <div className="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase mb-1">Dam Status</div>
          <div className="text-sm font-bold text-on-surface">Ready</div>
        </div>
        <div className="bg-surface-container/90 backdrop-blur-md border border-outline-variant p-4 w-32 pointer-events-auto">
          <div className="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase mb-1">Scenario</div>
          <div className="text-sm font-bold text-on-surface">{simulationStatus === 'ready' ? 'Computed' : 'Not Run'}</div>
        </div>
        <div className="bg-surface-container/90 backdrop-blur-md border border-outline-variant p-4 w-48 pointer-events-auto border-l-2 border-l-primary">
          <div className="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase mb-1">Data</div>
          <div className="text-sm font-bold text-primary leading-tight">Prototype / Public Reference Data</div>
        </div>
      </div>
    </>
  );
}

function ScenarioPage() {
  return (
    <>
      <GisMap />
      <ScenarioBuilder />
    </>
  );
}

function SimulationPage() {
  const { 
    simulationResults, 
    currentTimelineIndex, 
    setCurrentTimelineIndex, 
    isPlaying, 
    setIsPlaying 
  } = useSimulationStore();

  useEffect(() => {
    let interval: number;
    if (isPlaying && simulationResults?.timesteps) {
      interval = window.setInterval(() => {
        const current = useSimulationStore.getState().currentTimelineIndex;
        if (current >= simulationResults.timesteps.length - 1) {
          setIsPlaying(false);
        } else {
          setCurrentTimelineIndex(current + 1);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simulationResults, setCurrentTimelineIndex, setIsPlaying]);

  if (!simulationResults) {
    return (
      <>
        <GisMap />
        <div className="absolute top-6 left-6 z-10 w-72 bg-surface-container/90 backdrop-blur-md border border-outline-variant shadow-lg p-5">
          <div className="text-[10px] font-bold tracking-widest text-error uppercase mb-1">Error</div>
          <h2 className="text-lg font-bold text-on-surface leading-tight mb-2">No Scenario Data</h2>
          <p className="text-xs text-on-surface-variant">Please configure and run a scenario first.</p>
        </div>
      </>
    );
  }

  const currentData = simulationResults.timesteps[currentTimelineIndex];
  const maxIndex = simulationResults.timesteps.length - 1;

  return (
    <>
      <GisMap />
      
      {/* Simulation Info Panel */}
      <div className="absolute top-6 left-6 z-10 w-80 bg-surface-container/90 backdrop-blur-md border border-outline-variant shadow-lg pointer-events-auto p-5">
        <div className="text-[10px] font-bold tracking-widest text-primary uppercase mb-1">Simulation Control</div>
        <h2 className="text-lg font-bold text-on-surface leading-tight mb-4">Inundation Timeline</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider">Time (min)</span>
            <span className="text-lg font-mono font-bold text-primary">T+{currentData.timeMin}</span>
          </div>
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider">Discharge</span>
            <span className="text-lg font-mono font-bold text-on-surface">{Math.round(currentData.discharge).toLocaleString()} <span className="text-xs">m³/s</span></span>
          </div>
          
          <div className="pt-2">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-primary-container transition-colors shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </button>
              <div className="flex-1">
                <input 
                  type="range" 
                  min={0} 
                  max={maxIndex} 
                  value={currentTimelineIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentTimelineIndex(Number(e.target.value));
                  }}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-surface-container-highest border border-outline-variant rounded text-[10px] text-on-surface-variant leading-relaxed">
          Prototype Flood Extent — DEM-derived bathtub/HAND approximation. Not a substitute for 2D hydrodynamic (HEC-RAS) modelling.
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="scenario" element={<ScenarioPage />} />
          <Route path="simulation" element={<SimulationPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="emergency" element={<EmergencyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
