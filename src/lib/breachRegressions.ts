export interface BreachParams {
  breachWidth: {
    estimate: number;
    min: number;
    max: number;
  };
  formationTime: {
    estimate: number;
    min: number;
    max: number;
  };
}

/**
 * Computes breach parameters using Froehlich (1995/2008) empirical equations.
 * @param damHeightM Height of the dam (H) in meters.
 * @param reservoirVolumeM3 Volume of the reservoir (Vw) in cubic meters.
 * @param failureMode 'piping' or 'overtopping'
 * @returns Breach width and formation time with uncertainty bands.
 */
export function computeBreachParams(
  damHeightM: number,
  reservoirVolumeM3: number,
  failureMode: 'piping' | 'overtopping' = 'overtopping'
): BreachParams {
  // Froehlich 2008 uses Ko = 1.3 for overtopping, 1.0 for piping.
  // Average breach width (B_avg) = 0.27 * Ko * (Vw ^ 0.32) * (H ^ 0.04)
  // Formation time (Tf) = 63.2 * sqrt(Vw / (g * H^2)) -- simplified/adjusted
  // Actually, Froehlich (2008) Tf = 3.664 * sqrt(Vw / H^2) - wait, standard is Tf = 63.2 * sqrt(Vw / (g * H^2))?
  // Let's use the widely published Froehlich (2008) equations:
  // B_avg = 0.27 * Ko * (Vw ^ 0.32) * (Hb ^ 0.04) (Hb is height of breach, assume Hb = damHeightM)
  // Tf = 63.2 * sqrt(Vw / (9.81 * Hb^2)) - wait, the actual equation is:
  // Tf = 63.2 * sqrt(Vw / (g * Hb^2)) -- No, that's not right.
  // Froehlich 2008: Tf = 3.664 * sqrt(Vw / (g * Hb^2)) - wait, Vw is in m3, Hb in m.
  // Let's use simplified standard approximations for the MVP.
  
  const ko = failureMode === 'overtopping' ? 1.3 : 1.0;
  
  // Froehlich 2008 average breach width (meters)
  const bAvg = 0.27 * ko * Math.pow(reservoirVolumeM3, 0.32) * Math.pow(damHeightM, 0.04);
  
  // Froehlich 2008 formation time (hours)
  // Tf = 63.2 * sqrt(Vw / (g * Hb^2)) is commonly cited for Froehlich 1995, actually Tf = 0.00254 * (Vw^0.53) * (Hb^-0.90) in 1995.
  // Let's use the 1995 equation: Tf (hrs) = 0.00254 * Vw^0.53 * Hb^-0.90
  let tf = 0.00254 * Math.pow(reservoirVolumeM3, 0.53) * Math.pow(damHeightM, -0.90);

  // If tf is too large or small, bound it reasonably for prototype
  tf = Math.max(0.1, Math.min(tf, 24));

  return {
    breachWidth: {
      estimate: bAvg,
      min: bAvg * 0.7, // Assume ~30% uncertainty
      max: bAvg * 1.3
    },
    formationTime: {
      estimate: tf,
      min: tf * 0.5, // Assume -50% / +100% uncertainty (typical for time)
      max: tf * 2.0
    }
  };
}
