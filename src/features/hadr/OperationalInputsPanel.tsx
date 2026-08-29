import { useState } from 'react';
import { 
  Users, 
  Home, 
  Clock, 
  Truck, 
  HeartHandshake, 
  RefreshCw, 
  Sliders
} from 'lucide-react';
import clsx from 'clsx';

interface OperationalInputsPanelProps {
  earliestArrivalMin: number | null;
}

export interface HADROperationalState {
  populationAtRisk: number;
  shelterCapacity: number;
  warningTimeMin: number;
  rescueTeams: number;
  ambulances: number;
}

export function OperationalInputsPanel({ earliestArrivalMin }: OperationalInputsPanelProps) {
  // Operator-provided local form inputs
  const [formInputs, setFormInputs] = useState<HADROperationalState>({
    populationAtRisk: 12500,
    shelterCapacity: 8000,
    warningTimeMin: 30,
    rescueTeams: 5,
    ambulances: 8,
  });

  // Committed state used for calculations
  const [appliedInputs, setAppliedInputs] = useState<HADROperationalState>({
    populationAtRisk: 12500,
    shelterCapacity: 8000,
    warningTimeMin: 30,
    rescueTeams: 5,
    ambulances: 8,
  });

  const [isUpdated, setIsUpdated] = useState(false);

  const handleUpdate = () => {
    setAppliedInputs({ ...formInputs });
    setIsUpdated(true);
    setTimeout(() => setIsUpdated(false), 2000);
  };

  // Derived Calculations
  const { populationAtRisk, shelterCapacity, warningTimeMin, rescueTeams, ambulances } = appliedInputs;
  const shelterGap = populationAtRisk - shelterCapacity;
  const isShelterDeficit = shelterGap > 0;
  
  // Warning buffer comparison against earliest arrival time
  const arrival = earliestArrivalMin ?? 15; // default 15m if at T+0 before arrival step
  const timeMarginMin = arrival - warningTimeMin;
  const isTimeCritical = warningTimeMin >= arrival;

  // Operational Readiness Status
  let readinessStatus: 'CRITICAL' | 'ATTENTION' | 'ADEQUATE' = 'ADEQUATE';
  if (shelterGap > 3000 || isTimeCritical) {
    readinessStatus = 'CRITICAL';
  } else if (shelterGap > 0 || rescueTeams < 4) {
    readinessStatus = 'ATTENTION';
  }

  let statusBadgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (readinessStatus === 'CRITICAL') statusBadgeStyle = 'bg-error/10 text-error border-error/30';
  else if (readinessStatus === 'ATTENTION') statusBadgeStyle = 'bg-orange-500/10 text-orange-400 border-orange-500/30';

  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden shadow-lg">
      
      {/* Header */}
      <div className="p-5 border-b border-outline-variant bg-surface-container-highest flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-on-surface uppercase">
                HADR Operational Planning Inputs
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                Optional
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Operator-provided emergency logistics and civil defence parameters for disaster-response planning.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-on-surface-variant uppercase font-semibold">Logistical Readiness</div>
            <span className={clsx("px-2.5 py-0.5 rounded text-xs font-bold border inline-block mt-0.5", statusBadgeStyle)}>
              {readinessStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Form Inputs Grid */}
        <div className="grid grid-cols-5 gap-3">
          
          <div className="bg-surface-container-highest/60 p-3 rounded-lg border border-outline-variant">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">
              <Users className="w-3.5 h-3.5 text-primary" /> Pop. at Risk
            </label>
            <input 
              type="number" 
              value={formInputs.populationAtRisk}
              onChange={(e) => setFormInputs({ ...formInputs, populationAtRisk: Number(e.target.value) || 0 })}
              className="w-full bg-surface-container border border-outline-variant rounded px-2.5 py-1.5 text-sm font-mono font-bold text-on-surface focus:outline-none focus:border-primary"
            />
            <span className="text-[9px] text-on-surface-variant mt-1 block">Est. vulnerable souls</span>
          </div>

          <div className="bg-surface-container-highest/60 p-3 rounded-lg border border-outline-variant">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">
              <Home className="w-3.5 h-3.5 text-cyan-400" /> Shelter Cap.
            </label>
            <input 
              type="number" 
              value={formInputs.shelterCapacity}
              onChange={(e) => setFormInputs({ ...formInputs, shelterCapacity: Number(e.target.value) || 0 })}
              className="w-full bg-surface-container border border-outline-variant rounded px-2.5 py-1.5 text-sm font-mono font-bold text-on-surface focus:outline-none focus:border-primary"
            />
            <span className="text-[9px] text-on-surface-variant mt-1 block">Available bed spaces</span>
          </div>

          <div className="bg-surface-container-highest/60 p-3 rounded-lg border border-outline-variant">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">
              <Clock className="w-3.5 h-3.5 text-yellow-400" /> Warning (min)
            </label>
            <input 
              type="number" 
              value={formInputs.warningTimeMin}
              onChange={(e) => setFormInputs({ ...formInputs, warningTimeMin: Number(e.target.value) || 0 })}
              className="w-full bg-surface-container border border-outline-variant rounded px-2.5 py-1.5 text-sm font-mono font-bold text-on-surface focus:outline-none focus:border-primary"
            />
            <span className="text-[9px] text-on-surface-variant mt-1 block">Broadcast lead time</span>
          </div>

          <div className="bg-surface-container-highest/60 p-3 rounded-lg border border-outline-variant">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-purple-400" /> Rescue Teams
            </label>
            <input 
              type="number" 
              value={formInputs.rescueTeams}
              onChange={(e) => setFormInputs({ ...formInputs, rescueTeams: Number(e.target.value) || 0 })}
              className="w-full bg-surface-container border border-outline-variant rounded px-2.5 py-1.5 text-sm font-mono font-bold text-on-surface focus:outline-none focus:border-primary"
            />
            <span className="text-[9px] text-on-surface-variant mt-1 block">NDRF / SDRF Units</span>
          </div>

          <div className="bg-surface-container-highest/60 p-3 rounded-lg border border-outline-variant">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">
              <Truck className="w-3.5 h-3.5 text-error" /> Ambulances
            </label>
            <input 
              type="number" 
              value={formInputs.ambulances}
              onChange={(e) => setFormInputs({ ...formInputs, ambulances: Number(e.target.value) || 0 })}
              className="w-full bg-surface-container border border-outline-variant rounded px-2.5 py-1.5 text-sm font-mono font-bold text-on-surface focus:outline-none focus:border-primary"
            />
            <span className="text-[9px] text-on-surface-variant mt-1 block">Medical transit units</span>
          </div>

        </div>

        {/* Action Button & Derived Intelligence Banner */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
          
          <button
            onClick={handleUpdate}
            className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", isUpdated && "animate-spin")} />
            {isUpdated ? 'ASSESSMENT UPDATED ✓' : 'UPDATE HADR ASSESSMENT'}
          </button>

          <span className="text-[10px] text-on-surface-variant italic">
            *Inputs are operator-defined logistical constraints, decoupled from empirical hydraulic calculations.
          </span>
        </div>

        {/* Derived Operational Outcomes Grid */}
        <div className="grid grid-cols-3 gap-4 pt-1">
          
          {/* Shelter Capacity Analysis */}
          <div className="bg-surface-container-highest/40 p-4 rounded-lg border border-outline-variant">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Shelter Capacity Status</span>
              <span className={clsx("text-xs font-bold font-mono", isShelterDeficit ? "text-error" : "text-emerald-400")}>
                {isShelterDeficit ? `-${shelterGap.toLocaleString()} Deficit` : `+${Math.abs(shelterGap).toLocaleString()} Surplus`}
              </span>
            </div>
            <div className="text-sm font-bold text-on-surface">
              {shelterCapacity.toLocaleString()} <span className="text-xs font-normal text-on-surface-variant">/ {populationAtRisk.toLocaleString()} required</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1.5 leading-snug">
              {isShelterDeficit
                ? `Immediate mutual-aid shelters or school halls required for ${shelterGap.toLocaleString()} individuals.`
                : `Existing designated shelters are sufficient to accommodate the estimated population.`}
            </p>
          </div>

          {/* Warning Buffer Analysis */}
          <div className="bg-surface-container-highest/40 p-4 rounded-lg border border-outline-variant">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Early Warning Lead-Time</span>
              <span className={clsx("text-xs font-bold font-mono", isTimeCritical ? "text-error" : "text-emerald-400")}>
                {isTimeCritical ? `Deficit (${Math.abs(timeMarginMin)}m)` : `+${timeMarginMin}m Buffer`}
              </span>
            </div>
            <div className="text-sm font-bold text-on-surface">
              {warningTimeMin}m warning <span className="text-xs font-normal text-on-surface-variant">vs T+{arrival}m arrival</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1.5 leading-snug">
              {isTimeCritical
                ? `Warning dissemination (${warningTimeMin}m) exceeds earliest flood arrival (T+${arrival}m). Emergency sirens must fire immediately!`
                : `Warning lead-time provides a positive response buffer prior to flood peak arrival.`}
            </p>
          </div>

          {/* First-Responder Density */}
          <div className="bg-surface-container-highest/40 p-4 rounded-lg border border-outline-variant">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Responder Density</span>
              <span className="text-xs font-bold font-mono text-primary">
                {rescueTeams} Teams • {ambulances} Amb
              </span>
            </div>
            <div className="text-sm font-bold text-on-surface">
              ~{Math.round(populationAtRisk / (rescueTeams || 1)).toLocaleString()} <span className="text-xs font-normal text-on-surface-variant">people per rescue unit</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1.5 leading-snug">
              {rescueTeams < 4
                ? `Low responder density. Pre-position state disaster reserves along unflooded arterial roads.`
                : `Adequate rescue team coverage for sector-based rapid deployment.`}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
