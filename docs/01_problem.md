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

This project is initially a frontend prototype.

The frontend must not falsely claim that it performs real
hydrodynamic calculations unless a real simulation engine/backend
has been integrated.

The first prototype may use realistic mock/precomputed data.

**Prototype Simulation Constraints:**
* **Active Variable:** The hydrodynamic simulation calculation is currently driven exclusively by **Manning's Roughness (n)**.
* **Bypassed Variables:** All other scenario parameters (Breach Width, Formation Time, Crest Failure) are visually represented in the UI but are temporarily disabled in the calculation logic.
* **Expected Output:** Prototype simulation results currently reflect single-variable scaling based solely on the roughness coefficient.

## Questions We Still Need To Resolve

- Which river should be used for the prototype?
- Which dam should be used?
- Which DEM dataset should be used?
- Which hydrodynamic model will eventually be used?
- What parameters should the user be able to configure?
- What outputs are most useful for disaster-management decisions?
- What GIS layers should be displayed?