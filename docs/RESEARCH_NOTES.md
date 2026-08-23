# Dam-Break Inundation Modelling: Research Notes

This document synthesizes the problem statement and domain knowledge for the dam-break inundation modelling project. 

## 1. Confirmed Requirements
Based strictly on the provided problem statement, the system must:
*   Simulate (or represent) a dam-break scenario and identify the downstream inundated area.
*   Support Humanitarian Assistance and Disaster Relief (HADR) use cases.
*   Address key disaster-management questions: downstream water volume, inundated areas, water depth, arrival time, and affected settlements/infrastructure.
*   Utilize open-source data: Sentinel/Landsat satellite imagery and ASTER/SRTM Digital Elevation Models (DEMs).
*   Provide a modelling framework that:
    1. Accepts geographic and terrain data.
    2. Defines a dam-break scenario.
    3. Runs or represents a hydrodynamic flood simulation.
    4. Determines downstream inundated area.
    5. Visualizes results on a map.
    6. Provides actionable disaster management information.
*   **Crucial Constraint:** The initial phase is a frontend prototype. It must not falsely claim to perform real hydrodynamic calculations. It is permitted to use realistic mock or precomputed data.

## 2. Domain Understanding
*   **Dam-Break Inundation Modelling:** The process of predicting the flood wave propagation (extent, depth, velocity, arrival time) downstream following a dam failure.
*   **Digital Elevation Model (DEM):** A 3D representation of bare-earth terrain. Water flow is driven by gravity across this topography. High-resolution DEMs (like SRTM or ASTER) are mandatory for accurate flood routing.
*   **Hydrodynamic Modelling:** Solving mathematical equations (e.g., 1D or 2D Saint-Venant equations) to simulate fluid motion across the terrain. 

## 3. Reasonable Assumptions
*   **Web-Based Interface:** Given the term "frontend prototype," the solution will likely be a web application accessible via a browser.
*   **User Persona:** The end-users are disaster management planners or first responders who need clear, visual, and rapid answers rather than raw scientific data grids.
*   **Precomputation Necessity:** Real-time 2D hydrodynamic modelling is computationally expensive. For a responsive user experience, relying on precomputed scenarios will likely be necessary even in the final product.

## 4. Frontend Requirements
*   **Interactive Web Map:** A GIS map interface (e.g., Leaflet, Mapbox, or OpenLayers) to display satellite imagery (Sentinel/Landsat) as base layers.
*   **Scenario Dashboard:** UI controls (dropdowns, sliders) for a user to select a dam and define breach parameters (even if they just load specific precomputed datasets).
*   **Visualization Overlays:** Ability to render flood extents (polygons), depths (heatmaps), and arrival times (isochrones).
*   **Infrastructure Context:** Toggleable layers showing downstream settlements, roads, and critical infrastructure to answer the "who/what is affected" requirement.
*   **Timeline Controls:** A slider or playback feature to demonstrate the progression of the flood wave over time.

## 5. Backend / Scientific Model Requirements
*(Note: Excluded from MVP)*
*   **Data Processing Pipeline:** Processes to ingest, format, and clip open-source DEMs and satellite imagery for the solver.
*   **Hydrodynamic Engine:** Integration with an existing scientific solver (e.g., HEC-RAS, LISFLOOD-FP) to compute the flood wave based on user inputs.
*   **Result Conversion:** Backend scripts to translate raw numerical outputs (like NetCDF or raw raster files) into web-optimized spatial formats (Cloud Optimized GeoTIFFs or Vector Tiles) for the frontend.

## 6. Unknowns Requiring Validation
*   Which specific river and dam will be used for the prototype demonstration?
*   Which specific DEM dataset (ASTER vs. SRTM) provides the best balance of resolution and performance for the chosen area?
*   Which hydrodynamic model will eventually be utilized in the backend phase?
*   What exact parameters should be exposed to the user (e.g., reservoir level, time-to-failure, breach width)?
*   Which outputs are deemed *most* useful by actual disaster-management personnel?
*   Which specific GIS layers (e.g., hospitals, population density) should be displayed alongside the flood data?

## 7. Recommended MVP Scope
The MVP should focus entirely on demonstrating the **user experience and value proposition** using precomputed data. It should **not** include a real-time physics solver.

*   **Fixed Geography:** Select a single, well-known dam and downstream river segment.
*   **Precomputed Scenarios:** Generate 2-3 static datasets using an external tool or simply mock the polygons and data grids for:
    *   Scenario A: Partial breach.
    *   Scenario B: Complete catastrophic failure.
*   **Core UI:** Build the web frontend featuring a map, a scenario selector, and a time slider.
*   **Visualization:** Display the mocked/precomputed flood extent polygons varying over time. Overlay this on open-source satellite imagery.
*   **Impact Summary:** Provide a mocked statistics panel (e.g., "Estimated 5,000 people and 3 hospitals in the inundated zone").

## 8. What a Sophomore Team Can Realistically Build
A team of undergraduate engineering students can realistically achieve a highly polished and functional **Frontend Prototype**:
*   **Mapping UI:** They can learn and implement modern web-mapping libraries (like Leaflet or Mapbox GL JS) with React, Vue, or Vanilla JS.
*   **Data Integration:** They can source SRTM/ASTER DEMs and Sentinel imagery as base maps or static assets.
*   **Scenario Mocking:** They can create realistic GeoJSON files representing flood extents at different time intervals (T+1hr, T+2hr, etc.) and build a UI to animate or step through them.
*   **Avoid:** They should **not** attempt to build a custom hydrodynamic numerical solver from scratch (this is graduate-level fluid dynamics and numerical methods). Mocking the data ensures they can deliver a compelling proof-of-concept for the HADR use case within their timeframe.
