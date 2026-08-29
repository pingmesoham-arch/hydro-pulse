import { useSimulationStore } from '../store/useSimulationStore';
import { useNavigate } from 'react-router-dom';
import { BarChart3, AlertTriangle, ArrowRight } from 'lucide-react';
import { getStudyAreaData, fetchInfrastructure } from '../data/studyAreas/resolver';
import { assessInfrastructureRisk } from '../lib/impact/infrastructure';
import { useEffect, useState } from 'react';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { simulationStatus, simulationResults, selectedScenario, selectedDam, currentTimelineIndex } = useSimulationStore();
  const studyData = selectedDam ? getStudyAreaData(selectedDam.id) : null;
  const [infrastructure, setInfrastructure] = useState<any[] | null>(null);

  useEffect(() => {
    if (selectedDam) {
      fetchInfrastructure(selectedDam.id).then(setInfrastructure);
    }
  }, [selectedDam]);

  if (simulationStatus !== 'ready' || !simulationResults || !selectedScenario || !selectedDam || !studyData?.hasFloodData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background text-center z-10 relative">
        <div className="bg-surface-container border border-outline-variant p-8 rounded-xl max-w-md w-full">
          <BarChart3 className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-on-surface mb-2">
            {!studyData?.hasFloodData && simulationStatus === 'ready' ? 'Hydraulic Dataset Pending' : 'NO SIMULATION RESULTS'}
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">
            {!studyData?.hasFloodData && simulationStatus === 'ready' 
              ? 'Prototype scalar estimates available, but spatial inundation results are pending for this study area.' 
              : 'You need to configure and run a scenario first to view the prototype hydraulic estimates.'}
          </p>
          <button 
            onClick={() => navigate('/scenario')}
            className="w-full bg-primary text-on-primary hover:bg-primary-container font-semibold py-2.5 rounded flex items-center justify-center gap-2 transition-colors"
          >
            Configure Scenario <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const currentHydrographData = simulationResults.timesteps[currentTimelineIndex];
  const timeMin = currentHydrographData?.timeMin || 0;

  return (
    <div className="w-full h-full p-8 bg-background overflow-y-auto z-10 relative text-on-surface">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Prototype Results</h1>
            <p className="text-on-surface-variant text-sm mt-1">Hydraulic estimate for {selectedDam.name}</p>
          </div>
          <div className="bg-surface-container-highest px-3 py-1.5 rounded border border-outline-variant flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-semibold text-primary">Timestep: T+{timeMin} min</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-surface-container-highest p-4 rounded-lg border border-outline-variant space-y-2">
            <h3 className="text-[10px] font-bold tracking-widest text-primary uppercase mb-3">Parameters</h3>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Scenario:</span>
              <span className="text-on-surface font-mono">{selectedScenario.scenario.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Breach Width:</span>
              <span className="text-on-surface font-mono">{selectedScenario.scenario.breachWidthM} m</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Formation Time:</span>
              <span className="text-on-surface font-mono">{selectedScenario.scenario.formationTimeHr} hrs</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Crest Failure:</span>
              <span className="text-on-surface font-mono">{(selectedScenario.scenario.crestFailureRatio * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Manning's n:</span>
              <span className="text-on-surface font-mono">{selectedScenario.manningN}</span>
            </div>
          </div>

          <div className="col-span-2 bg-surface-container border border-outline-variant p-5 rounded-lg">
            <h3 className="text-[10px] font-bold tracking-widest text-primary uppercase border-b border-outline-variant pb-2 mb-4">Timestep Estimates (T+{timeMin})</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-surface-container-highest p-4 rounded border border-outline-variant text-center">
                <div className="text-2xl font-mono font-bold text-on-surface mb-1">
                  {Math.round(currentHydrographData?.discharge || 0).toLocaleString()}
                </div>
                <div className="text-[10px] font-mono text-on-surface-variant mb-2">Prototype Estimate</div>
                <div className="text-xs text-on-surface-variant uppercase tracking-wider">Discharge (m³/s)</div>
              </div>
              
              <div className="bg-surface-container-highest p-4 rounded border border-outline-variant text-center">
                <div className="text-2xl font-mono font-bold text-on-surface mb-1">
                  {(currentHydrographData?.velocity || 0).toFixed(1)}
                </div>
                <div className="text-[10px] font-mono text-on-surface-variant mb-2">Prototype Estimate</div>
                <div className="text-xs text-on-surface-variant uppercase tracking-wider">Velocity (m/s)</div>
              </div>
              
              <div className="bg-surface-container-highest p-4 rounded border border-outline-variant text-center">
                <div className="text-2xl font-mono font-bold text-on-surface mb-1">
                  {(currentHydrographData?.depth || 0).toFixed(1)}
                </div>
                <div className="text-[10px] font-mono text-on-surface-variant mb-2">Prototype Estimate</div>
                <div className="text-xs text-on-surface-variant uppercase tracking-wider">Depth (m)</div>
              </div>
              
              <div className="bg-surface-container-highest p-4 rounded border border-outline-variant text-center">
                <div className="text-2xl font-mono font-bold text-on-surface mb-1">
                  {(() => {
                    let critical = 0;
                    if (infrastructure && currentHydrographData?.floodExtent) {
                      infrastructure.forEach(inf => {
                        const riskLevel = assessInfrastructureRisk(inf, currentHydrographData.floodExtent);
                        if (riskLevel === 'CRITICAL') {
                          critical++;
                        }
                      });
                    }
                    return critical.toLocaleString();
                  })()}
                </div>
                <div className="text-[10px] font-mono text-on-surface-variant mb-2">Prototype Estimate</div>
                <div className="text-xs text-on-surface-variant uppercase tracking-wider">Critical Assets</div>
              </div>
            </div>
            
            <div className="mt-6 flex items-start gap-3 bg-primary-container/10 border border-primary/20 p-3 rounded text-primary text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Prototype Estimate — Precomputed Scenario. These values are generated by a simplified prototype hydraulic estimator and do not represent a scientifically validated hydrodynamic simulation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
