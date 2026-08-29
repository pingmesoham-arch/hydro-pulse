import { useState } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { calculatePrototypeScenario } from '../simulation/prototypeEstimator';
import { Play, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { predefinedScenarios } from '../../data/scenarios';
import { dams } from '../../data/dams';

import { getStudyAreaData } from '../../data/studyAreas/resolver';

export default function ScenarioBuilder() {
  const navigate = useNavigate();
  const { 
    setSimulationStatus, 
    setSimulationResults, 
    simulationStatus, 
    selectedDam, 
    setSelectedDam, 
    selectedScenario, 
    setSelectedScenario, 
    setMapLayers,
    setCurrentTimelineIndex 
  } = useSimulationStore();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [processingStep, setProcessingStep] = useState(0);

  const [manningN, setManningN] = useState(selectedScenario?.manningN?.toString() || '0.035');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(selectedScenario?.scenario?.id || 'catastrophic');

  const scenario = predefinedScenarios[selectedScenarioId];
  const studyData = selectedDam ? getStudyAreaData(selectedDam.id) : null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!manningN || isNaN(Number(manningN)) || Number(manningN) <= 0) newErrors.manningN = 'Must be > 0';
    if (!selectedDam) newErrors.general = 'No dam selected';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRunSimulation = () => {
    if (!validate() || !selectedDam) return;

    setSimulationStatus('computing');
    setProcessingStep(1); // VALIDATING SCENARIO

    const scenarioInput = {
      manningN: Number(manningN),
      scenario
    };
    // This now also clears the old prototype result and sets simulationStatus to 'idle' first
    setSelectedScenario(scenarioInput);
    // But we are in the middle of a run, so we immediately set it back to computing!
    setSimulationStatus('computing');

    setTimeout(() => setProcessingStep(2), 600); // PROCESSING INPUTS
    setTimeout(() => {
      setProcessingStep(3); // GENERATING ESTIMATE
      
      try {
        const result = calculatePrototypeScenario(scenarioInput, selectedDam);
        
        setTimeout(() => setProcessingStep(4), 600); // PREPARING VISUALIZATION
        
        setTimeout(() => {
          setSimulationResults(result);
          setMapLayers({ floodExtent: true }); // Automatically show the flood extent
          setSimulationStatus('ready');
          setProcessingStep(5);
          navigate('/results');
        }, 1200);

      } catch (error) {
        console.error('[SIMULATION ERROR]', error);
        setSimulationResults(null);
        setSimulationStatus('error');
        setErrors({ general: 'Simulation failed to generate data.' });
      }
    }, 1200);
  };

  const processingLabels = [
    '',
    'VALIDATING SCENARIO',
    'PROCESSING INPUTS',
    'GENERATING ESTIMATE',
    'PREPARING VISUALIZATION',
    'PROTOTYPE SCENARIO READY'
  ];

  return (
    <div className="w-[400px] h-full bg-surface-container-low border-r border-outline-variant flex flex-col pointer-events-auto absolute left-0 top-0 z-10 overflow-y-auto">
      <div className="p-6 border-b border-outline-variant">
        <h2 className="text-lg font-bold text-on-surface tracking-tight">Scenario Builder</h2>
        <p className="text-xs text-on-surface-variant mt-1">Configure prototype estimates. Not a validated hydrodynamic model.</p>
      </div>

      <div className="p-6 space-y-6 flex-1">
        {errors.general && (
          <div className="bg-error/20 border border-error/50 p-3 rounded flex items-center gap-2 text-error text-xs">
            <AlertCircle className="w-4 h-4" /> {errors.general}
          </div>
        )}

        <div className="space-y-4">
          <div className="text-[10px] font-semibold tracking-widest text-primary uppercase">Study Area</div>
          
          <div>
            <label className="block text-[12px] font-semibold text-on-surface mb-1.5">Select Dam</label>
            <select 
              value={selectedDam?.id || ''}
              onChange={e => {
                const dam = dams.find(d => d.id === e.target.value);
                if (dam) {
                  // setSelectedDam already clears state to idle
                  setSelectedDam(dam);
                }
              }}
              className="w-full bg-surface-container-highest border border-outline-variant rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="" disabled>Select a dam...</option>
              {dams.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.state})</option>
              ))}
            </select>
          </div>

          {!studyData?.hasFloodData && (
            <div className="bg-surface-container-highest border border-outline-variant p-3 rounded flex items-start gap-2 text-warning text-xs mt-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> 
              <div>
                <strong>Hydraulic dataset pending</strong>
                <p className="mt-1 opacity-80">Prototype scenario scalar estimates available. Flood geometry not available for this dam.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-[10px] font-semibold tracking-widest text-primary uppercase mt-2">Scenario Type</div>
          
          <div>
            <label className="block text-[12px] font-semibold text-on-surface mb-1.5">Failure Mode</label>
            <select 
              value={selectedScenarioId}
              onChange={e => {
                setSelectedScenarioId(e.target.value);
                if (simulationStatus === 'ready' || simulationStatus === 'error') {
                  setSimulationStatus('idle');
                  setSimulationResults(null);
                  setCurrentTimelineIndex(0);
                }
              }}
              className="w-full bg-surface-container-highest border border-outline-variant rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              {Object.values(predefinedScenarios).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <div className="bg-surface-container p-4 rounded border border-outline-variant space-y-2">
            <p className="text-xs text-on-surface-variant mb-3">{scenario.description}</p>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Breach Width:</span>
              <span className="text-on-surface font-mono">{scenario.breachWidthM} m</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Formation Time:</span>
              <span className="text-on-surface font-mono">{scenario.formationTimeHr} hrs</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Crest Failure:</span>
              <span className="text-on-surface font-mono">{(scenario.crestFailureRatio * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-[10px] font-semibold tracking-widest text-primary uppercase mt-6">Hydraulic Parameters</div>

          <div>
            <label className="block text-[12px] font-semibold text-on-surface mb-1.5">Manning's Roughness (n)</label>
            <div className="relative">
              <input 
                type="number" step="0.005"
                value={manningN} 
                onChange={e => {
                  setManningN(e.target.value);
                  if (simulationStatus === 'ready' || simulationStatus === 'error') {
                    setSimulationStatus('idle');
                    setSimulationResults(null);
                    setCurrentTimelineIndex(0);
                  }
                }}
                className={`w-full bg-surface-container-highest border ${errors.manningN ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'} rounded px-3 py-2 text-sm text-on-surface focus:outline-none`}
              />
              {errors.manningN && <span className="absolute right-3 top-2.5 text-error text-[10px]"><AlertCircle className="w-3.5 h-3.5" /></span>}
            </div>
            {errors.manningN && <p className="text-[10px] text-error mt-1">{errors.manningN}</p>}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-outline-variant bg-surface-container-low mt-auto">
        {simulationStatus === 'computing' && (
          <div className="mb-4 space-y-2 p-3 bg-surface-container-highest rounded border border-outline-variant">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className={`flex items-center justify-between text-[10px] font-mono ${processingStep >= step ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                <span>{processingLabels[step]}</span>
                {processingStep === step ? <Loader2 className="w-3 h-3 animate-spin" /> : processingStep > step ? <CheckCircle2 className="w-3 h-3" /> : null}
              </div>
            ))}
          </div>
        )}
        
        <button 
          onClick={handleRunSimulation}
          disabled={simulationStatus === 'computing'}
          className={`w-full font-semibold text-sm py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${simulationStatus === 'ready' ? 'bg-primary-container text-primary hover:bg-primary-container/80 border border-primary/30' : 'bg-primary text-on-primary hover:bg-primary-container'}`}
        >
          {simulationStatus === 'computing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
           simulationStatus === 'ready' ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {simulationStatus === 'ready' ? 'RE-RUN SIMULATION' : 'RUN SIMULATION'}
        </button>
      </div>
    </div>
  );
}
