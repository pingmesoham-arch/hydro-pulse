# MVP Version Plan: Dam-Break Inundation Modelling

This document outlines the version-based development plan for the Smart India Hackathon (SIH) prototype. The objective is to build a convincing Minimum Viable Product (MVP) that demonstrates the complete user workflow and disaster-management value without attempting to build a real hydrodynamic solver.

---

## V0.1 — Application Shell
1. **Objective:** Set up the basic web application structure and mapping interface.
2. **User-visible features:** A full-screen interactive map, a sidebar/navbar for navigation, and base map layers (e.g., satellite imagery vs. streets).
3. **Screens/components required:** Main Layout, Map Component, Sidebar/Navigation Component.
4. **Data required:** Base map tiles (e.g., OpenStreetMap, Mapbox, or Leaflet providers).
5. **What can be mocked:** N/A (using real base map providers).
6. **What should NOT be implemented yet:** Dam-specific logic, scenario forms, or flood data.
7. **Definition of Done:** Application runs locally, the map renders correctly, and the user can pan/zoom seamlessly.
8. **What the judges should be able to understand after seeing it:** The team possesses the technical foundation to build an interactive GIS web application.

## V0.2 — Dam-Break Scenario Builder
1. **Objective:** Allow users to select a dam and configure a failure scenario.
2. **User-visible features:** A UI panel to select a dam (from a predefined list), view basic dam statistics, and a form to configure breach parameters (e.g., "Partial Breach" vs. "Catastrophic Failure").
3. **Screens/components required:** Scenario Builder Panel, Dam Details Card, Dam Marker on the Map.
4. **Data required:** Basic metadata for 1-2 real-world dams (name, location, capacity, height).
5. **What can be mocked:** The list of dams and the configuration options (these should be hardcoded to match the precomputed data you plan to show).
6. **What should NOT be implemented yet:** The actual flood visualization or results panel.
7. **Definition of Done:** User can click a dam on the map, open the scenario builder, select parameters, and click a "Run Simulation" button.
8. **What the judges should be able to understand after seeing it:** The initial workflow for setting up a simulation and the inputs the system will eventually expect.

## V0.3 — Interactive Flood Simulation Prototype
1. **Objective:** Visualize the propagation of the flood wave over time on the map.
2. **User-visible features:** A time-slider controlling the flood extent, colored polygons representing the inundated area, and visual indicators of water depth (e.g., color-coded heatmaps).
3. **Screens/components required:** Map Overlays (GeoJSON or raster layers), Time/Playback Controller Component, Map Legend.
4. **Data required:** Precomputed flood extents and depths for the selected scenarios (e.g., GeoJSON polygons representing the flood at T+1hr, T+2hr, etc.).
5. **What can be mocked:** The spatial flood geometries. Use pre-generated GeoJSON polygons for the selected study area. Hydraulic discharge curves, flow velocities, and flood depths are dynamically derived via empirical weir and regression formulas across the timeline.

6. **What should NOT be implemented yet:** Detailed disaster impact statistics or critical infrastructure overlays.
7. **Definition of Done:** User clicks "Run Simulation", the map updates with a time slider, and the user can animate the flood wave moving downstream.
8. **What the judges should be able to understand after seeing it:** How the system will represent the physical flood event spatially and temporally, answering "Where does the water go?".

## V0.4 — Flood Results and Disaster Decision Support
1. **Objective:** Provide actionable intelligence based on the flood simulation for HADR (Humanitarian Assistance and Disaster Relief) use cases.
2. **User-visible features:** Overlays of critical infrastructure (hospitals, schools) and roads. A results dashboard showing estimated impacted population and compromised infrastructure.
3. **Screens/components required:** Infrastructure Map Layers (Points/Lines), Results Dashboard / Impact Summary Panel.
4. **Data required:** Point data for infrastructure and line data for roads (can be pulled from OpenStreetMap/Overpass API for the mock area).
5. **What can be mocked:** The impact calculations. If "Catastrophic Failure" is selected, load a hardcoded JSON response detailing "X people and Y hospitals affected" rather than running dynamic spatial intersection queries in the browser.
6. **What should NOT be implemented yet:** Dynamic geospatial intersection calculations (calculating exact impacts on the fly based on dynamic flood polygons).
7. **Definition of Done:** After the simulation runs, the user can toggle infrastructure layers, visually see which fall inside the flood zone, and read a summary report of the impact.
8. **What the judges should be able to understand after seeing it:** The true value of the tool for disaster management—translating raw scientific flood data into actionable insights for first responders.

## V0.5 — Demo Polish
1. **Objective:** Enhance the visual appeal and UX to impress judges.
2. **User-visible features:** Smooth animations, polished UI components (glassmorphism, modern typography), loading states (simulating calculation time), responsive design, and clear branding.
3. **Screens/components required:** Global UI polish, Loading Spinners, Welcome/Landing Modal explaining the project context.
4. **Data required:** N/A.
5. **What can be mocked:** The "simulation computing time" (e.g., inserting an artificial 3-second delay with a "Computing Hydrodynamics on Backend..." spinner to simulate real-world usage).
6. **What should NOT be implemented yet:** New functional features.
7. **Definition of Done:** The application feels like a premium, professional tool with no jarring transitions or broken layouts.
8. **What the judges should be able to understand after seeing it:** The team's capability to deliver a high-quality, production-ready user experience.

## V1.0 — Future Full System
1. **Objective:** Transform the frontend prototype into a real scientific tool.
2. **User-visible features:** Ability to select *any* dam globally, upload custom DEMs, and run physics-based simulations on the fly.
3. **Screens/components required:** DEM/Data Upload UI, Advanced Simulation Settings, Real-time Job Status Monitor.
4. **Data required:** Global DEM API integrations, live satellite data streams, hydrodynamic solver binaries.
5. **What can be mocked:** Nothing.
6. **What should NOT be implemented yet:** N/A (this is the final vision).
7. **Definition of Done:** The frontend integrates with a robust backend (e.g., Python + external solver) that dynamically computes inundation based on actual physics, DEMs, and hydrology, returning real results to the UI.
8. **What the judges should be able to understand after seeing it:** The long-term roadmap, system architecture, and technical viability of scaling the prototype into a real-world enterprise solution.

---

## Recommended SIH MVP

To succeed in the internal SIH evaluation, the team must aggressively prioritize. 

**MUST BE COMPLETED (The Core MVP):**
*   **V0.1 through V0.4** must be fully functional. A map with no data is useless, and raw flood polygons without the impact dashboard (V0.4) fails to answer the HADR requirement. 

**CAN BE POSTPONED:**
*   **V0.5 (Demo Polish):** Only execute this if V0.4 is completely bug-free.
*   **V1.0 (Future Full System):** Strictly out of scope for the hackathon code, but **must** be discussed verbally during the pitch.

---

## Demo Flow

*This represents the ideal 3–5 minute demonstration a team should give to the judges.*

1. **Opening (0:00 - 0:30):** 
   * Briefly introduce the problem: Dam failures cause catastrophic downstream flooding, and disaster managers need rapid answers. 
   * Show the clean application shell (V0.1) to establish context.
2. **Scenario Setup (0:30 - 1:30):** 
   * Select the pre-configured dam on the map. 
   * Open the Scenario Builder (V0.2). Explain the parameters (e.g., "We are simulating a catastrophic failure at 100% reservoir capacity"). Point out that this is exactly what a disaster manager would configure.
3. **The "Simulation" (1:30 - 2:30):** 
   * Click "Run Simulation". (Let the artificial V0.5 loading spinner run for 3 seconds to build anticipation).
   * Show the time slider (V0.3). Drag the slider to animate the flood wave moving downstream. 
   * **Crucial Script Note:** Explicitly tell the judges: *"For this prototype, we are using precomputed data to ensure performance, representing the exact output our future backend hydrodynamic solver will generate."*
4. **Actionable Insights (2:30 - 4:00):** 
   * This is the "Aha!" moment. Toggle the critical infrastructure and road layers (V0.4). 
   * Show the impact dashboard: *"As you can see, the flood cuts off Highway 9 and inundates 3 hospitals within the first 2 hours. This tells first responders exactly where to direct evacuation efforts."*
5. **Conclusion & Future Vision (4:00 - 5:00):** 
   * Summarize the value proposition. 
   * Briefly explain the V1.0 architecture (how you will eventually ingest live ASTER/SRTM DEM data and run a real solver in the backend to support any dam in the world). 
   * End the pitch.
