import { useSimulationStore } from '../store/useSimulationStore';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, AlertTriangle } from 'lucide-react';
import { getStudyAreaData } from '../data/studyAreas/resolver';
import { assessInfrastructureRisk, assessRoadRisk } from '../lib/impact/infrastructure';

export default function EmergencyPage() {
  const navigate = useNavigate();
  const { simulationStatus, simulationResults, selectedDam, currentTimelineIndex, selectedScenario } = useSimulationStore();
  const studyData = selectedDam ? getStudyAreaData(selectedDam.id) : null;

  if (simulationStatus !== 'ready' || !simulationResults) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background text-center z-10 relative">
        <div className="bg-surface-container border border-outline-variant p-8 rounded-xl max-w-md w-full">
          <ShieldAlert className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-on-surface mb-2">NO SIMULATION RESULTS</h2>
          <p className="text-sm text-on-surface-variant mb-6">Run a scenario to view emergency impact assessments.</p>
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

  const currentTimestep = simulationResults.timesteps[currentTimelineIndex];
  const currentImpact = currentTimestep?.impact;
  const currentExtent = currentTimestep?.floodExtent;
  const timeMin = currentTimestep?.timeMin || 0;

  return (
    <div className="w-full h-full p-8 bg-background overflow-y-auto z-10 relative text-on-surface">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-error flex items-center gap-2">
              <ShieldAlert className="w-6 h-6" /> Prototype Impact Assessment
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">Estimated impact on local infrastructure based on prototype hydraulic values.</p>
          </div>
          <div className="text-right">
             <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-widest">{selectedDam?.name} • {selectedScenario?.scenario?.name}</div>
             <div className="bg-error/10 text-error px-3 py-1.5 rounded font-bold border border-error/20 inline-block">
               Simulation Time: T+{timeMin} min
             </div>
          </div>
        </div>

        {currentImpact && (
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="col-span-1 bg-surface-container border border-outline-variant p-5 rounded-lg space-y-4">
              <h3 className="text-[10px] font-bold tracking-widest text-primary uppercase border-b border-outline-variant pb-2">Critical Infrastructure Exposure</h3>
              <p className="text-xs text-on-surface-variant">Number of critical assets (hospitals, schools, bridges, etc.) intersected by the flood extent at T+{timeMin} min.</p>
              
              <div className="space-y-3 pt-2">
                {(() => {
                  let critical = 0;
                  let moderate = 0;
                  let shallow = 0;

                  if (studyData?.infrastructure) {
                    studyData.infrastructure.forEach(inf => {
                      const riskLevel = assessInfrastructureRisk(inf, currentExtent);
                      if (riskLevel === 'CRITICAL') critical++;
                      if (riskLevel === 'MODERATE') moderate++;
                      if (riskLevel === 'SHALLOW') shallow++;
                    });
                  }

                  return (
                    <>
                      <div>
                        <div className="text-[10px] text-error uppercase mb-1 font-semibold">Critical Zone</div>
                        <div className="text-xl font-mono text-on-surface">{critical} Assets</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-orange-400 uppercase mb-1 font-semibold">Moderate Zone</div>
                        <div className="text-xl font-mono text-on-surface">{moderate} Assets</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-yellow-400 uppercase mb-1 font-semibold">Shallow Zone</div>
                        <div className="text-xl font-mono text-on-surface">{shallow} Assets</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="col-span-2 bg-surface-container border border-outline-variant rounded-lg overflow-hidden flex flex-col">
              <div className="p-5 border-b border-outline-variant bg-surface-container-highest">
                <h3 className="text-[10px] font-bold tracking-widest text-primary uppercase">Infrastructure Risk at T+{timeMin} min</h3>
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container-highest border-b border-outline-variant text-[10px] font-bold tracking-widest text-on-surface-variant uppercase sticky top-0">
                    <tr>
                      <th className="px-6 py-3">Infrastructure Name</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Elevation</th>
                      <th className="px-6 py-3">Est. Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {studyData?.infrastructure ? studyData.infrastructure.map(inf => {
                      const riskLevel = assessInfrastructureRisk(inf, currentExtent);
                      
                      let riskColor = 'text-green-400 bg-green-400/10 border-green-400/20';
                      if (riskLevel === 'CRITICAL') riskColor = 'text-error bg-error/10 border-error/20';
                      if (riskLevel === 'MODERATE') riskColor = 'text-orange-400 bg-orange-400/10 border-orange-400/20';
                      if (riskLevel === 'SHALLOW') riskColor = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';

                      return (
                        <tr key={inf.id} className="hover:bg-surface-container-highest/50 transition-colors">
                          <td className="px-6 py-3 font-medium">{inf.name}</td>
                          <td className="px-6 py-3 capitalize text-on-surface-variant">{inf.type}</td>
                          <td className="px-6 py-3 font-mono">{inf.elevationM} m</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${riskColor}`}>
                              {riskLevel}
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant text-sm">
                          Reference infrastructure dataset unavailable for this study area.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {studyData?.roads && currentExtent && (
          <div className="bg-surface-container border border-outline-variant rounded-lg flex flex-col max-h-96 mb-8">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface shrink-0 rounded-t-lg">
              <h3 className="text-[10px] font-bold tracking-widest text-primary uppercase">Critical Transport Network Impact</h3>
              <div className="text-xs text-on-surface-variant">OSM Reference Features</div>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-highest border-b border-outline-variant text-[10px] font-bold tracking-widest text-on-surface-variant uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Road/Bridge Name</th>
                    <th className="px-6 py-3">Highway Type</th>
                    <th className="px-6 py-3">Est. Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {studyData.roads.features
                    .map((road, idx) => {
                      const riskLevel = assessRoadRisk(road, currentExtent);
                      return { road, riskLevel, id: road.id || `road-${idx}` };
                    })
                    // Show CRITICAL and MODERATE first, then SHALLOW, then SAFE
                    .sort((a, b) => {
                      const riskWeight = { 'CRITICAL': 3, 'MODERATE': 2, 'SHALLOW': 1, 'SAFE': 0 };
                      return riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
                    })
                    .map(({ road, riskLevel, id }) => {
                      let riskColor = 'text-green-400 bg-green-400/10 border-green-400/20';
                      if (riskLevel === 'CRITICAL') riskColor = 'text-error bg-error/10 border-error/20';
                      if (riskLevel === 'MODERATE') riskColor = 'text-orange-400 bg-orange-400/10 border-orange-400/20';
                      if (riskLevel === 'SHALLOW') riskColor = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
                      
                      const name = road.properties?.name || 'Unnamed segment';
                      const type = road.properties?.bridge === 'yes' ? 'Bridge' : road.properties?.highway || 'Road';

                      return (
                        <tr key={id} className="hover:bg-surface-container-highest/50 transition-colors">
                          <td className="px-6 py-3 font-medium truncate max-w-[200px]" title={name}>{name}</td>
                          <td className="px-6 py-3 capitalize text-on-surface-variant">{type}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${riskColor}`}>
                              {riskLevel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-3 bg-surface-container-highest p-4 rounded text-on-surface-variant text-xs border border-outline-variant">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>This assessment uses prototype geometric ray-casting for inundation mapping. It should not be used for actual emergency planning or decision making.</p>
        </div>

      </div>
    </div>
  );
}
