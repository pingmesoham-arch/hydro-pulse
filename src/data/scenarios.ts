export interface PredefinedScenario {
  id: string;
  name: string;
  description: string;
  breachWidthM: number;
  formationTimeHr: number;
  crestFailureRatio: number;
  severityFactor: number;
  propagationFactor: number;
}

export const predefinedScenarios: Record<string, PredefinedScenario> = {
  catastrophic: {
    id: 'catastrophic',
    name: 'Catastrophic Breach',
    description: 'Instantaneous massive failure of the primary dam structure. Worst-case scenario.',
    breachWidthM: 150, // meters
    formationTimeHr: 0.5, // hours
    crestFailureRatio: 1.0, // 100% of height
    severityFactor: 1.0,
    propagationFactor: 1.0
  },
  partial: {
    id: 'partial',
    name: 'Partial Breach',
    description: 'Gradual failure of a section of the spillway or crest over a prolonged period.',
    breachWidthM: 40, // meters
    formationTimeHr: 3.5, // hours
    crestFailureRatio: 0.4, // 40% of height
    severityFactor: 0.25,
    propagationFactor: 0.3
  }
};
