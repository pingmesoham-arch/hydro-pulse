# Dam Break Inundation Modelling — Problem Understanding

## Problem Statement

We need to develop a software tool for simulating a dam-break scenario
and identifying the downstream area that may become inundated by the
released water.

The system should support disaster-management use cases, particularly
Humanitarian Assistance and Disaster Relief (HADR).

## Context

Dam failures and natural water-related disasters can result in flash
flooding in downstream river catchments.

The system should help answer questions such as:

- What happens if a dam breaks?
- How much water reaches the downstream river?
- Which areas become inundated?
- How deep does the water become?
- How quickly does flooding reach different locations?
- Which settlements or infrastructure are affected?

## Expected Data

The problem statement mentions:

- Open-source remote sensing data
- Sentinel
- Landsat
- Other open-source satellite imagery
- ASTER DEM
- SRTM DEM
- Other Digital Elevation Models

## Expected System

The proposed software should provide a modelling framework that can:

1. Accept geographic and terrain data.
2. Define a dam-break scenario.
3. Run or represent a hydrodynamic flood simulation.
4. Determine the downstream inundated area.
5. Visualize the results on a map.
6. Provide useful information for disaster management.

## Important Constraint

## Implementation Boundaries & Scientific Integrity

Hydro_Pulse provides an interactive prototype for decision support and HADR scenario evaluation.

To maintain scientific integrity:
- The system explicitly distinguishes between empirical regression estimates and full 2D hydrodynamic solvers (e.g., HEC-RAS 2D).
- Peak discharge is calculated from broad-crested weir opening hydraulics and Froehlich empirical regression formulas.
- Downstream depth and velocity are calculated via Manning's open-channel equations.
- Inundation extents for demonstrative study areas (e.g. Gangapur Dam) utilize precomputed geometric profiles for immediate, responsive client-side exploration.

## Roadmap & Extension Points

- High-performance computing (HPC) backend integration with 2D hydrodynamic solvers.
- Automated ingestion of real-time reservoir levels via CWC/WRIS telemetry.
- Dynamic mesh rasterization directly from high-resolution DEM tiles.
- PostGIS-backed spatial analytics for national-scale infrastructure databases.