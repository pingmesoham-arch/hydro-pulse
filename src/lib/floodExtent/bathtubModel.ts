import type * as GeoJSON from 'geojson';
import type { PredefinedScenario } from '../../data/scenarios';

import { partial_t0 } from '../../data/studyAreas/gangapur/flood/partial/t0';
import { partial_t15 } from '../../data/studyAreas/gangapur/flood/partial/t15';
import { partial_t30 } from '../../data/studyAreas/gangapur/flood/partial/t30';
import { partial_t60 } from '../../data/studyAreas/gangapur/flood/partial/t60';
import { partial_t120 } from '../../data/studyAreas/gangapur/flood/partial/t120';

import { catastrophic_t0 } from '../../data/studyAreas/gangapur/flood/catastrophic/t0';
import { catastrophic_t15 } from '../../data/studyAreas/gangapur/flood/catastrophic/t15';
import { catastrophic_t30 } from '../../data/studyAreas/gangapur/flood/catastrophic/t30';
import { catastrophic_t60 } from '../../data/studyAreas/gangapur/flood/catastrophic/t60';
import { catastrophic_t120 } from '../../data/studyAreas/gangapur/flood/catastrophic/t120';

/**
 * Loads the PRECOMPUTED PROTOTYPE FLOOD EXTENT geometries for the specified scenario.
 * 
 * In a real implementation, this module would fetch HEC-RAS 2D model outputs.
 */
export function generateMockBathtubExtents(
  _hydrograph: { timeMin: number; discharge: number }[],
  _damLat: number,
  _damLon: number,
  scenario: PredefinedScenario
): GeoJSON.FeatureCollection[] {
  
  if (scenario.id === 'catastrophic') {
    return [
      catastrophic_t0,
      catastrophic_t15,
      catastrophic_t30,
      catastrophic_t60,
      catastrophic_t120
    ];
  }

  // Default to partial
  return [
    partial_t0,
    partial_t15,
    partial_t30,
    partial_t60,
    partial_t120
  ];
}
