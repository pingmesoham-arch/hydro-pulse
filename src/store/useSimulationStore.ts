import { create } from 'zustand'
import { dams } from '../data/dams'
import type { DamMetadata } from '../data/dams'

import type { PredefinedScenario } from '../data/scenarios'

export interface PrototypeScenarioInput {
  manningN: number
  scenario: PredefinedScenario
}

export interface SimulationTimestep {
  timeMin: number;
  discharge: number;
  depth: number;
  velocity: number;
  floodExtent?: GeoJSON.FeatureCollection;
  impact?: {
    population: { critical: number; high: number; moderate: number };
  };
}

export interface PrototypeScenarioResult {
  scenarioId: string;
  damId: string;
  peakDischarge: { estimate: number; min: number; max: number };
  estimatedDepth: { estimate: number; min: number; max: number };
  maxVelocity: number;
  impactSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  arrivalTime: number;
  timesteps: SimulationTimestep[];
}

export type SimulationStatus = 'idle' | 'computing' | 'ready' | 'error';

export type ThemeType = 'hydro-pulse-light' | 'hydro-pulse-dark-gis' | 'cyberpunk-neon' | 'swiss-minimal' | 'enterprise' | 'synthwave' | 'eco-natural';

export interface MapLayers {
  baseMap: boolean;
  damLocation: boolean;
  floodExtent: boolean;
  infrastructure: boolean;
  roads: boolean;
}

interface SimulationState {
  selectedDam: DamMetadata | null
  selectedScenario: PrototypeScenarioInput | null
  simulationResults: PrototypeScenarioResult | null
  simulationStatus: SimulationStatus
  currentTimelineIndex: number
  isPlaying: boolean
  
  activeTheme: ThemeType
  mapLayers: MapLayers
  autoCenterMap: boolean
  showMapLabels: boolean
  
  setSelectedDam: (dam: DamMetadata) => void
  setSelectedScenario: (scenario: PrototypeScenarioInput) => void
  setSimulationResults: (result: PrototypeScenarioResult | null) => void
  setSimulationStatus: (status: SimulationStatus) => void
  setCurrentTimelineIndex: (index: number) => void
  setIsPlaying: (playing: boolean) => void
  setActiveTheme: (theme: ThemeType) => void
  setMapLayers: (layers: Partial<MapLayers>) => void
  setAutoCenterMap: (autoCenter: boolean) => void
  setShowMapLabels: (show: boolean) => void
}

const initialTheme = (localStorage.getItem('hydro-pulse-theme-v2') as ThemeType) || 'hydro-pulse-light';
if (typeof document !== 'undefined') {
  document.documentElement.dataset.theme = initialTheme;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  selectedDam: dams[0],
  selectedScenario: null,
  simulationResults: null,
  simulationStatus: 'idle',
  currentTimelineIndex: 0,
  isPlaying: false,
  
  activeTheme: initialTheme,
  mapLayers: {
    baseMap: true,
    damLocation: true,
    floodExtent: false,
    infrastructure: false,
    roads: false,
  },
  autoCenterMap: true,
  showMapLabels: true,

  setSelectedDam: (dam) => set({ 
    selectedDam: dam,
    simulationResults: null,
    simulationStatus: 'idle',
    currentTimelineIndex: 0,
    isPlaying: false
  }),
  setSelectedScenario: (scenario) => set({ 
    selectedScenario: scenario,
    simulationResults: null,
    simulationStatus: 'idle',
    currentTimelineIndex: 0,
    isPlaying: false 
  }),
  setSimulationResults: (result) => set({ simulationResults: result }),
  setSimulationStatus: (status) => set({ simulationStatus: status }),
  setCurrentTimelineIndex: (index) => set({ currentTimelineIndex: index }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setActiveTheme: (theme) => {
    localStorage.setItem('hydro-pulse-theme-v2', theme);
    document.documentElement.dataset.theme = theme;
    set({ activeTheme: theme });
  },
  
  setMapLayers: (layers) => set({ mapLayers: { ...get().mapLayers, ...layers } }),
  setAutoCenterMap: (autoCenter) => set({ autoCenterMap: autoCenter }),
  setShowMapLabels: (show) => set({ showMapLabels: show }),
}))
