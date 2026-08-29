import { useState, useEffect, useMemo } from 'react';
import { useMapEvents, CircleMarker, Popup } from 'react-leaflet';
import { useSimulationStore } from '../../store/useSimulationStore';
import { fetchInfrastructure } from '../../data/studyAreas/resolver';
import type { InfrastructureAsset } from '../../data/studyAreas/types';
import { inspectLocation } from '../../lib/hadr/hadrEngine';
import { 
  Crosshair, 
  X, 
  ShieldAlert, 
  Clock, 
  Waves, 
  Wind, 
  Building2, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';
import clsx from 'clsx';

interface LocationInspectorProps {
  isLightMap: boolean;
}

export function LocationInspector({ isLightMap }: LocationInspectorProps) {
  const { simulationResults, currentTimelineIndex, selectedDam } = useSimulationStore();
  const [inspectedCoords, setInspectedCoords] = useState<[number, number] | null>(null);
  const [infrastructure, setInfrastructure] = useState<InfrastructureAsset[] | null>(null);

  useEffect(() => {
    if (selectedDam) {
      fetchInfrastructure(selectedDam.id).then(setInfrastructure);
    }
  }, [selectedDam]);

  // Derived inspection calculation
  const inspectionResult = useMemo(() => {
    if (!inspectedCoords) return null;
    return inspectLocation(
      inspectedCoords,
      simulationResults,
      currentTimelineIndex,
      infrastructure
    );
  }, [inspectedCoords, simulationResults, currentTimelineIndex, infrastructure]);

  // Listen for map click events
  useMapEvents({
    click(e) {
      const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
      setInspectedCoords(coords);
    }
  });

  if (!inspectedCoords || !inspectionResult) {
    return null;
  }

  const { riskScore, nearestAsset } = inspectionResult;
  const isFlooded = inspectionResult.isFlooded;
  const arrivalTime = inspectionResult.arrivalTimeMin;

  let categoryBadgeColor = 'bg-green-500/10 text-green-400 border-green-500/20';
  if (riskScore.category === 'CRITICAL') categoryBadgeColor = 'bg-error/10 text-error border-error/30';
  else if (riskScore.category === 'HIGH') categoryBadgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
  else if (riskScore.category === 'MODERATE') categoryBadgeColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';

  return (
    <>
      {/* Visual Beacon on Map */}
      <CircleMarker
        center={inspectedCoords}
        radius={9}
        pathOptions={{
          color: isLightMap ? '#0284c7' : '#00f0ff',
          fillColor: isFlooded ? '#ef4444' : '#10b981',
          fillOpacity: 0.85,
          weight: 3
        }}
      >
        <Popup className="text-xs">
          <div className="font-bold">{inspectedCoords[0].toFixed(4)}, {inspectedCoords[1].toFixed(4)}</div>
          <div>Status: {isFlooded ? `Inundated (T+${arrivalTime}m)` : 'Safe (Not Flooded)'}</div>
          <div>Risk: {riskScore.category} ({riskScore.score}/100)</div>
        </Popup>
      </CircleMarker>

      {/* Floating HUD Inspection Drawer */}
      <div className="absolute top-6 right-6 z-[1000] w-96 bg-surface-container/95 backdrop-blur-md border border-outline-variant rounded-xl shadow-2xl overflow-hidden pointer-events-auto transition-all animate-in fade-in slide-in-from-right-4 duration-200">
        
        {/* HUD Header */}
        <div className="p-4 bg-surface-container-highest border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-primary uppercase">HADR Location Inspector</div>
              <div className="text-xs font-mono font-bold text-on-surface">
                {inspectedCoords[0].toFixed(5)}°N, {inspectedCoords[1].toFixed(5)}°E
              </div>
            </div>
          </div>
          <button 
            onClick={() => setInspectedCoords(null)}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Inundation Status Banner */}
          <div className={clsx(
            "p-3.5 rounded-lg border flex items-start gap-3",
            isFlooded 
              ? "bg-error/10 border-error/30 text-on-surface" 
              : "bg-emerald-500/10 border-emerald-500/30 text-on-surface"
          )}>
            {isFlooded ? (
              <ShieldAlert className="w-5 h-5 text-error shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isFlooded ? `Flood Inundation Detected` : `Safe / Uninundated Zone`}
                </span>
                <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border", categoryBadgeColor)}>
                  {riskScore.category}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                {isFlooded
                  ? `Estimated floodwater arrival at T+${arrivalTime} min. Currently ${inspectionResult.isFloodedAtCurrentTime ? 'active inundated state' : 'awaiting flood arrival'}.`
                  : `This location is outside the 120-minute simulated flood extent for ${selectedDam?.name || 'this study area'}.`}
              </p>
            </div>
          </div>

          {/* Key Hydraulic Metrics */}
          {isFlooded && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-surface-container-highest p-2.5 rounded border border-outline-variant text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-on-surface-variant uppercase mb-1">
                  <Clock className="w-3 h-3 text-primary" /> Arrival
                </div>
                <div className="text-sm font-mono font-bold text-primary">T+{arrivalTime}m</div>
              </div>
              <div className="bg-surface-container-highest p-2.5 rounded border border-outline-variant text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-on-surface-variant uppercase mb-1">
                  <Waves className="w-3 h-3 text-cyan-400" /> Max Depth
                </div>
                <div className="text-sm font-mono font-bold text-on-surface">{inspectionResult.maxDepthM}m</div>
              </div>
              <div className="bg-surface-container-highest p-2.5 rounded border border-outline-variant text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-on-surface-variant uppercase mb-1">
                  <Wind className="w-3 h-3 text-yellow-400" /> Max Vel
                </div>
                <div className="text-sm font-mono font-bold text-on-surface">{inspectionResult.maxVelocityMs}m/s</div>
              </div>
            </div>
          )}

          {/* HADR Risk Score Breakdown */}
          {isFlooded && (
            <div className="bg-surface-container-highest/60 p-3.5 rounded-lg border border-outline-variant space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest text-primary uppercase">HADR Risk Score</span>
                <span className="text-sm font-mono font-bold text-on-surface">{riskScore.score} / 100</span>
              </div>
              
              {/* Factor Progress Bars */}
              <div className="space-y-2 text-[10px]">
                <div>
                  <div className="flex justify-between text-on-surface-variant mb-1">
                    <span>Water Depth Hazard (30%)</span>
                    <span className="font-mono">{riskScore.factors.depthFactor}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${riskScore.factors.depthFactor}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-on-surface-variant mb-1">
                    <span>Flow Velocity Hazard (20%)</span>
                    <span className="font-mono">{riskScore.factors.velocityFactor}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${riskScore.factors.velocityFactor}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-on-surface-variant mb-1">
                    <span>Arrival Lead Urgency (25%)</span>
                    <span className="font-mono">{riskScore.factors.arrivalUrgencyFactor}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-error transition-all duration-300" style={{ width: `${riskScore.factors.arrivalUrgencyFactor}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-on-surface-variant mb-1">
                    <span>Criticality Exposure (25%)</span>
                    <span className="font-mono">{riskScore.factors.criticalityFactor}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 transition-all duration-300" style={{ width: `${riskScore.factors.criticalityFactor}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nearest Critical Infrastructure */}
          {nearestAsset && (
            <div className="bg-surface-container-highest/40 p-3 rounded-lg border border-outline-variant">
              <div className="flex items-center justify-between text-[10px] font-semibold text-on-surface-variant uppercase mb-1.5">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-primary" /> Nearest Infrastructure</span>
                <span className="font-mono text-primary font-bold">{nearestAsset.distanceM}m away</span>
              </div>
              <div className="text-xs font-bold text-on-surface">{nearestAsset.name}</div>
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant mt-1">
                <span className="capitalize">{nearestAsset.type}</span>
                <span className={clsx(
                  "font-semibold",
                  nearestAsset.riskCategory === 'CRITICAL' ? 'text-error' :
                  nearestAsset.riskCategory === 'MODERATE' ? 'text-orange-400' :
                  nearestAsset.riskCategory === 'SHALLOW' ? 'text-yellow-400' : 'text-emerald-400'
                )}>
                  Impact: {nearestAsset.riskCategory}
                </span>
              </div>
            </div>
          )}

          {/* Action Directive */}
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-start gap-2 text-xs">
            <ArrowUpRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">HADR Operational Directive</div>
              <p className="text-[11px] text-on-surface leading-relaxed">
                {inspectionResult.evacuationDirective}
              </p>
            </div>
          </div>

          <div className="text-[9px] text-on-surface-variant/70 italic text-center pt-1">
            Click anywhere on the map to re-inspect point arrival & risk.
          </div>

        </div>
      </div>
    </>
  );
}
