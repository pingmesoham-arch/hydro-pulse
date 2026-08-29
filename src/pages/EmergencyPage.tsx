import { useSimulationStore } from '../store/useSimulationStore';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ArrowRight, 
  AlertTriangle, 
  Clock, 
  Waves, 
  Building2, 
  Activity, 
  AlertOctagon,
  LifeBuoy
} from 'lucide-react';
import { fetchInfrastructure, fetchRoads } from '../data/studyAreas/resolver';
import { assessInfrastructureRisk, assessRoadRisk } from '../lib/impact/infrastructure';
import { 
  computeEvacuationPriorities, 
  generateHADRSummary, 
  computePointArrival 
} from '../lib/hadr/hadrEngine';
import { OperationalInputsPanel } from '../features/hadr/OperationalInputsPanel';
import { useEffect, useState, useMemo } from 'react';
import type * as GeoJSON from 'geojson';
import clsx from 'clsx';

export default function EmergencyPage() {
  const navigate = useNavigate();
  const { simulationStatus, simulationResults, selectedDam, currentTimelineIndex, selectedScenario } = useSimulationStore();
  const [infrastructure, setInfrastructure] = useState<any[] | null>(null);
  const [roads, setRoads] = useState<GeoJSON.FeatureCollection | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  useEffect(() => {
    if (selectedDam) {
      fetchInfrastructure(selectedDam.id).then(setInfrastructure);
      fetchRoads(selectedDam.id).then(setRoads);
    }
  }, [selectedDam]);

  const summary = useMemo(() => {
    return generateHADRSummary(
      simulationResults,
      currentTimelineIndex,
      infrastructure,
      roads
    );
  }, [simulationResults, currentTimelineIndex, infrastructure, roads]);

  const evacuationQueue = useMemo(() => {
    return computeEvacuationPriorities(
      infrastructure,
      simulationResults,
      currentTimelineIndex
    );
  }, [infrastructure, simulationResults, currentTimelineIndex]);

  const filteredQueue = useMemo(() => {
    if (filterPriority === 'ALL') return evacuationQueue;
    return evacuationQueue.filter(item => item.priority === filterPriority);
  }, [evacuationQueue, filterPriority]);

  if (simulationStatus !== 'ready' || !simulationResults) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background text-center z-10 relative">
        <div className="bg-surface-container border border-outline-variant p-8 rounded-xl max-w-md w-full">
          <ShieldAlert className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-on-surface mb-2">NO SIMULATION RESULTS</h2>
          <p className="text-sm text-on-surface-variant mb-6">Run a scenario to view emergency HADR impact assessments and evacuation priorities.</p>
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
  const currentExtent = currentTimestep?.floodExtent;
  const timeMin = currentTimestep?.timeMin || 0;

  return (
    <div className="w-full h-full p-8 bg-background overflow-y-auto z-10 relative text-on-surface">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-error flex items-center gap-2">
              <ShieldAlert className="w-7 h-7" /> HADR Command & Decision Support
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Real-time multi-criteria impact assessment, flood arrival lead times, and prioritized evacuation triage.
            </p>
          </div>
          <div className="text-right">
             <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-widest font-mono">
               {selectedDam?.name} • {selectedScenario?.scenario?.name}
             </div>
             <div className="bg-error/10 text-error px-3.5 py-1.5 rounded-lg font-bold border border-error/20 inline-flex items-center gap-2">
               <Clock className="w-4 h-4 animate-pulse" /> Active Timestep: T+{timeMin} min
             </div>
          </div>
        </div>

        {/* HADR Situational Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-surface-container border border-outline-variant p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold uppercase tracking-wider mb-1">
              <span className="text-on-surface font-semibold">Inundated Surface</span>
              <Waves className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-2xl font-mono font-bold text-on-surface">{summary.inundatedAreaKm2} <span className="text-xs font-normal text-on-surface-variant">km²</span></div>
            <div className="text-[11px] text-on-surface-variant font-medium mt-1">At T+{timeMin} min footprint</div>
          </div>

          <div className="bg-surface-container border border-outline-variant p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold uppercase tracking-wider mb-1">
              <span className="text-on-surface font-semibold">Earliest Arrival</span>
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-mono font-bold text-primary">
              {summary.earliestArrivalMin !== null ? `T+${summary.earliestArrivalMin} min` : 'None'}
            </div>
            <div className="text-[11px] text-on-surface-variant font-medium mt-1">First downstream impact</div>
          </div>

          <div className="bg-surface-container border border-outline-variant p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold uppercase tracking-wider mb-1">
              <span className="text-on-surface font-semibold">Critical Facilities</span>
              <Building2 className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-mono font-bold text-on-surface">
              {summary.hospitalsAffected + summary.schoolsAffected + summary.bridgesAffected}
            </div>
            <div className="text-[11px] text-on-surface-variant font-medium mt-1">
              {summary.hospitalsAffected} Hosp • {summary.schoolsAffected} Sch • {summary.bridgesAffected} Brg
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold uppercase tracking-wider mb-1">
              <span className="text-on-surface font-semibold">Transport Network</span>
              <AlertOctagon className="w-4 h-4 text-error" />
            </div>
            <div className="text-2xl font-mono font-bold text-on-surface">
              {summary.roadsAffected} <span className="text-xs font-normal text-on-surface-variant">segments</span>
            </div>
            <div className="text-[11px] text-on-surface-variant font-medium mt-1">
              ~{summary.estimatedAffectedRoadLengthKm} km cut off
            </div>
          </div>
        </div>

        {/* Optional HADR Operational Planning Inputs */}
        <OperationalInputsPanel earliestArrivalMin={summary.earliestArrivalMin} />

        {/* Evacuation Priority Queue */}
        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden shadow-lg">
          <div className="p-5 border-b border-outline-variant bg-surface-container-highest flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-error/10 border border-error/20 text-error">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-on-surface uppercase">
                  Prioritized Evacuation & HADR Rescue Queue
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Ranked by composite HADR risk score, arrival lead time, and infrastructure vulnerability.
                </p>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant text-xs">
              {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={clsx(
                    "px-3 py-1 rounded-md text-[10px] font-bold transition-colors",
                    filterPriority === p 
                      ? "bg-primary text-on-primary shadow-sm" 
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-highest border-b border-outline-variant text-[10px] font-bold tracking-widest text-on-surface-variant uppercase sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3">Rank</th>
                  <th className="px-5 py-3">Facility / Settlement</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Flood Arrival</th>
                  <th className="px-5 py-3">Peak Depth</th>
                  <th className="px-5 py-3">HADR Risk</th>
                  <th className="px-5 py-3">Priority Action Directive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredQueue.length > 0 ? (
                  filteredQueue.map((item, idx) => {
                    let badgeColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
                    if (item.priority === 'CRITICAL') badgeColor = 'bg-error/10 text-error border-error/30';
                    else if (item.priority === 'HIGH') badgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/30';

                    return (
                      <tr key={item.id} className="hover:bg-surface-container-highest/40 transition-colors">
                        <td className="px-5 py-3 font-mono font-bold text-xs text-on-surface-variant">#{idx + 1}</td>
                        <td className="px-5 py-3 font-semibold text-on-surface">{item.name}</td>
                        <td className="px-5 py-3 capitalize text-xs text-on-surface-variant">{item.type}</td>
                        <td className="px-5 py-3 font-mono font-bold text-primary text-xs">
                          {item.arrivalTimeMin !== null ? `T+${item.arrivalTimeMin} min` : 'Unflooded'}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs">{item.peakDepthM} m</td>
                        <td className="px-5 py-3">
                          <span className={clsx("px-2.5 py-1 rounded text-[10px] font-bold border", badgeColor)}>
                            {item.riskScore.score} • {item.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-on-surface leading-snug">
                          {item.actionDirective}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant text-sm">
                      No assets match the active priority filter in this scenario extent.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transport Corridors & OSM Asset Matrix */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Critical Infrastructure Exposure Table */}
          <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden flex flex-col max-h-96">
            <div className="p-4 border-b border-outline-variant bg-surface-container-highest flex justify-between items-center">
              <h3 className="text-[10px] font-bold tracking-widest text-primary uppercase flex items-center gap-2">
                <Building2 className="w-4 h-4" /> OSM Infrastructure Assets
              </h3>
              <span className="text-xs font-mono text-on-surface-variant">{infrastructure?.length || 0} Total in Reach</span>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-highest border-b border-outline-variant text-[10px] font-bold tracking-widest text-on-surface-variant uppercase sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5">Asset</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Arrival</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {infrastructure ? infrastructure.map((inf) => {
                    const geoRisk = assessInfrastructureRisk(inf, currentExtent);
                    const arrival = computePointArrival([inf.longitude, inf.latitude], simulationResults.timesteps);
                    
                    let riskColor = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
                    if (geoRisk === 'CRITICAL') riskColor = 'text-error bg-error/10 border-error/20';
                    else if (geoRisk === 'MODERATE') riskColor = 'text-orange-400 bg-orange-400/10 border-orange-400/20';
                    else if (geoRisk === 'SHALLOW') riskColor = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';

                    return (
                      <tr key={inf.id} className="hover:bg-surface-container-highest/50 transition-colors">
                        <td className="px-4 py-2.5 font-medium truncate max-w-[180px]" title={inf.name}>{inf.name}</td>
                        <td className="px-4 py-2.5 capitalize text-xs text-on-surface-variant">{inf.type}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-primary">
                          {arrival.arrivalTimeMin !== null ? `T+${arrival.arrivalTimeMin}m` : 'Safe'}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${riskColor}`}>
                            {geoRisk}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-6 text-center text-on-surface-variant text-xs">
                        Reference infrastructure dataset unavailable for this study area.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transport Network (Roads & Bridges) Table */}
          <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden flex flex-col max-h-96">
            <div className="p-4 border-b border-outline-variant bg-surface-container-highest flex justify-between items-center">
              <h3 className="text-[10px] font-bold tracking-widest text-primary uppercase flex items-center gap-2">
                <Activity className="w-4 h-4" /> Transport Routes & Evacuation Corridors
              </h3>
              <span className="text-xs font-mono text-on-surface-variant">{roads?.features?.length || 0} Road Segments</span>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-highest border-b border-outline-variant text-[10px] font-bold tracking-widest text-on-surface-variant uppercase sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5">Road / Corridor</th>
                    <th className="px-4 py-2.5">Class</th>
                    <th className="px-4 py-2.5">T+{timeMin} Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {roads?.features ? (
                    roads.features
                      .map((road, idx) => {
                        const riskLevel = assessRoadRisk(road, currentExtent);
                        return { road, riskLevel, id: road.id || `road-${idx}` };
                      })
                      .sort((a, b) => {
                        const weight: Record<string, number> = { 'CRITICAL': 3, 'MODERATE': 2, 'SHALLOW': 1, 'SAFE': 0 };
                        return (weight[b.riskLevel] || 0) - (weight[a.riskLevel] || 0);
                      })
                      .slice(0, 50)
                      .map(({ road, riskLevel, id }) => {
                        let riskColor = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
                        if (riskLevel === 'CRITICAL') riskColor = 'text-error bg-error/10 border-error/20';
                        else if (riskLevel === 'MODERATE') riskColor = 'text-orange-400 bg-orange-400/10 border-orange-400/20';
                        else if (riskLevel === 'SHALLOW') riskColor = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';

                        const name = road.properties?.name || 'Unnamed Road Segment';
                        const type = road.properties?.bridge === 'yes' ? 'Bridge' : road.properties?.highway || 'Road';

                        return (
                          <tr key={id} className="hover:bg-surface-container-highest/50 transition-colors">
                            <td className="px-4 py-2.5 font-medium truncate max-w-[200px]" title={name}>{name}</td>
                            <td className="px-4 py-2.5 capitalize text-xs text-on-surface-variant">{type}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${riskColor}`}>
                                {riskLevel}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-6 text-center text-on-surface-variant text-xs">
                        Transport network dataset unavailable for this study area.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
        
        {/* Scientific Disclaimer Footer */}
        <div className="flex items-start gap-3 bg-surface-container-highest p-4 rounded-lg text-on-surface-variant text-xs border border-outline-variant">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-warning" />
          <p>
            <strong>HADR Analytical Framework Disclaimer:</strong> Inundation arrival times and risk scores are derived from prototype geometric ray-casting and empirical regression calculations. This system serves as a decision-support prototype and does not replace statutory 2D hydrodynamic safety validations.
          </p>
        </div>

      </div>
    </div>
  );
}
