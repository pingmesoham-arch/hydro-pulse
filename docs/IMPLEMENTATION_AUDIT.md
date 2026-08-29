# Hydro_Pulse — Phase 0 Implementation Audit

**Document Date:** August 29, 2026  
**Auditor:** Senior Full-Stack GIS & Hydrodynamic Modelling Engineer  
**Project:** Hydro_Pulse (SIH PS 26161 / NTRO)

---

## 1. Executive Overview & Repository Structure

An exhaustive audit of the existing Hydro_Pulse codebase was performed to identify all available entry points, routes, state management stores, GIS layers, simulation models, and geospatial datasets.

### Repository Architecture Summary

```text
c:\Users\Soham Banerjee\Downloads\hydro-pulse\
├── index.html                   # HTML entry point (Leaflet stylesheet, metadata)
├── package.json                 # React 19.2, Leaflet 1.9, React-Leaflet 5.0, Zustand 5.0, Vite 8.2
├── src/
│   ├── main.tsx                 # React DOM mount point
│   ├── App.tsx                  # BrowserRouter, Route tree, Dashboard, SimulationPage
│   ├── index.css                # Tailwind base & custom color tokens (Material Design surface tiers)
│   ├── layouts/
│   │   └── MainLayout.tsx       # TopNavBar, SideNavBar, LayersPanel, SettingsModal
│   ├── store/
│   │   └── useSimulationStore.ts # Zustand global store (dam, scenario, status, timeline, theme, layers)
│   ├── features/
│   │   ├── map/
│   │   │   ├── GisMap.tsx       # Leaflet MapContainer, TileLayer, CircleMarkers, Layer mounts
│   │   │   └── layers/
│   │   │       ├── FloodExtentLayer.tsx     # Timestep-indexed polygon renderer with depth styling
│   │   │       ├── InfrastructureLayer.tsx  # Point marker renderer for OSM critical assets
│   │   │       └── RoadsLayer.tsx           # LineString/MultiLineString highway renderer
│   │   ├── scenarios/
│   │   │   └── ScenarioBuilder.tsx          # Study area selection, breach parameter forms, execution steps
│   │   └── simulation/
│   │       └── prototypeEstimator.ts        # Hydraulic dam-break regression & open-channel calculations
│   ├── pages/
│   │   ├── ResultsPage.tsx      # Hydraulic output cards, hydrograph metrics, critical asset count
│   │   └── EmergencyPage.tsx    # HADR risk overview, infrastructure & transport network risk tables
│   ├── lib/
│   │   ├── floodExtent/
│   │   │   └── bathtubModel.ts  # Precomputed GeoJSON scenario resolver (Gangapur partial/catastrophic)
│   │   ├── impact/
│   │   │   ├── infrastructure.ts      # Point-in-polygon ray-casting (isPointInPolygon, assessInfrastructureRisk)
│   │   │   └── populationExposure.ts  # Scenario-scaled population exposure estimation
│   │   └── breachRegressions.ts       # Standalone Froehlich (2008) reference equations
│   └── data/
│       ├── dams.ts              # Catalog of 3 dams (Gangapur, Bhakra, Hirakud) with height, storage, coords
│       ├── scenarios.ts         # Predefined failure modes (Partial Breach vs. Catastrophic Breach)
│       ├── geostatial/gangapur/ # Real OpenStreetMap Overpass datasets (infrastructure.geojson, roads.geojson)
│       └── studyAreas/          # Resolvers and precomputed flood GeoJSON polygons for Gangapur (t0-t120)
```

---

## 2. Detailed Technical Audit

### A. What is Genuinely Implemented & Present

| Layer / Component | Implementation Status | Evidence / Source File |
| :--- | :--- | :--- |
| **Dam Metadata** | Implemented (Real parameters) | `src/data/dams.ts` (Gangapur: 36.59m height, 215.88 MCM storage; Bhakra; Hirakud) |
| **Breach Formulation** | Implemented (Empirical Regression) | `src/features/simulation/prototypeEstimator.ts` (Weir opening $Q = 1.7 B H^{1.5}$, Froehlich volume regression $Q \propto V^{0.295} H^{1.24}$) |
| **Channel Hydraulics** | Implemented (Manning Equation) | `src/features/simulation/prototypeEstimator.ts` (Depth $y \propto (Q \cdot n)^{0.6}$, Velocity $v \propto \frac{1}{n} y^{2/3}$) |
| **Time-Series Hydrograph** | Implemented ($T+00 \to T+120\text{ min}$) | `src/features/simulation/prototypeEstimator.ts` (Calculates $Q, y, v$ at 0, 15, 30, 60, 120 min) |
| **Inundation Geometries** | Implemented (Precomputed GeoJSON) | `src/data/studyAreas/gangapur/flood/` (5 timesteps $\times$ 2 failure modes = 10 GeoJSON files) |
| **Spatial Ray-Casting** | Implemented (Pure TypeScript) | `src/lib/impact/infrastructure.ts` (`isPointInPolygon` exterior ring algorithm) |
| **OSM Infrastructure Data** | Implemented (Real OSM data) | `src/data/geostatial/gangapur/infrastructure.geojson` (7,131 lines, hospitals, schools, bridges) |
| **OSM Transport Network** | Implemented (Real OSM data) | `src/data/geostatial/gangapur/roads.geojson` (6,419 lines, primary, secondary, trunk highways) |
| **Global State Store** | Implemented (Zustand) | `src/store/useSimulationStore.ts` (Full simulation lifecycle and layer controls) |
| **Interactive Map** | Implemented (Leaflet) | `src/features/map/GisMap.tsx` (OpenStreetMap tiles, keepBuffer, smooth panning) |

### B. What is Static, Approximate, or Not Present

1. **2D Hydrodynamic PDE Solver (HEC-RAS / Telemac / Shallow Water Equations)**:
   - *Status*: **Not present in client runtime**.
   - *Honesty Note*: The browser calculates empirical peak outflow and Manning 1D channel depth/velocity, and binds them to precomputed spatial flood polygons for the prototype demo area. It does NOT solve the 2D Saint-Venant shallow water PDEs live on a GPU mesh.
2. **Backend Server / Database APIs**:
   - *Status*: **100% Client-Side Single Page Application**.
   - *Honesty Note*: No REST/GraphQL/WebSocket server is running. All computations and spatial queries run client-side in the browser.
3. **Flood Inundation Data for Non-Gangapur Dams**:
   - *Status*: **Pending hydraulic dataset**.
   - *Honesty Note*: Bhakra Dam and Hirakud Dam contain dam metadata, but spatial flood extents and OSM datasets are only bundled for Gangapur Dam. The UI accurately displays "Hydraulic Dataset Pending" when selecting those study areas.

---

## 3. Gap Analysis for the Requested HADR Intelligence Layer

To achieve the primary goal:
$$\text{DAM BREAK} \to \text{PROPAGATION} \to \text{DEPTH/VELOCITY/TIME} \to \text{ARRIVAL TIME} \to \text{IMPACT} \to \text{RISK} \to \text{EVACUATION PRIORITY} \to \text{DECISION SUPPORT}$$

The following specific functional capabilities must be built on top of the active simulation data:

| Target Capability | Existing Foundation | What Needs to be Implemented |
| :--- | :--- | :--- |
| **1. Flood Arrival Time** | Timestep polygons exist ($T+0, 15, 30, 60, 120$) | A multi-timestep temporal arrival-time engine that detects the earliest timestep at which any given point $(x,y)$ or infrastructure asset is intersected. |
| **2. Infrastructure Impact** | Single-timestep polygon intersection | Multi-asset classifier categorizing assets (hospitals, schools, bridges, roads) with specific flood arrival, peak depth, and damage vulnerability. |
| **3. HADR Risk Scoring** | Discrete severity categories (`CRITICAL` vs `MODERATE`) | Multi-factor normalized scoring formula ($0-100$) combining Depth Risk, Velocity Risk, Arrival Time Urgency, and Facility Criticality. |
| **4. Evacuation Priority** | None | Transparent evacuation queue sorting affected settlements and high-occupancy facilities by composite risk and lead time. |
| **5. Location Inspector** | None | Map click listener in `GisMap.tsx` and a floating analytical HUD displaying real-time coordinates, arrival time, depth, velocity, risk score, and nearest asset. |
| **6. Flood Replay Controller** | Basic slider on `/simulation` | Interactive timeline integration accessible across the map, with synchronous layer updates and arrival tracking. |
| **7. HADR Summary Dashboard** | Basic count cards on `/emergency` | Comprehensive command-centre situational dashboard with inundated surface area ($\text{km}^2$), transport disruption stats, priority queues, and actionable directives. |

---

## 4. Recommended Implementation Strategy

1. **Create Unified Types Module (`src/lib/hadr/types.ts`)**:
   - Define type-safe interfaces for `FloodArrivalAnalysis`, `AssetImpactAssessment`, `HADRRiskScore`, `EvacuationPriorityItem`, `LocationInspectionResult`, and `HADRSituationalSummary`.
2. **Implement HADR Analytical Engine (`src/lib/hadr/hadrEngine.ts`)**:
   - Compute polygon surface area in $\text{km}^2$.
   - Calculate point/polygon arrival times across timesteps.
   - Implement the transparent, deterministic 4-factor HADR Risk Scoring equation.
   - Generate prioritized evacuation queues.
3. **Implement Interactive Map Inspector (`src/features/map/LocationInspector.tsx`)**:
   - Add Leaflet `useMapEvents({ click })` hook.
   - Query the active simulation hydrograph and flood layers for the clicked coordinate.
   - Render a command-centre HUD with inspection results.
4. **Upgrade Emergency & Results Pages**:
   - Embed real-time evacuation priority tables, asset inspection drawers, arrival time indicators, and situational summary metrics.
5. **Unit Testing & Verification**:
   - Write comprehensive unit tests in `src/lib/hadr/__tests__/hadrEngine.test.ts` to verify arrival time, risk score bounds, ray-casting accuracy, and priority sorting.
6. **Documentation**:
   - Author `docs/ULTIMATE_IMPLEMENTATION.md` detailing every formula, data flow, limitation, and presentation script.
