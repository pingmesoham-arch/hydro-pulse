# Hydro_Pulse Frontend Implementation Plan (MVP)

This document outlines the practical implementation plan for the React frontend prototype of Hydro_Pulse, targeting the SIH MVP requirements (V0.1 - V0.4).

## 1. Existing Repository Structure
Currently, the repository is essentially empty except for the `docs/` directory which contains the problem statement, research notes, MVP version plan, design system definitions, UI specifications, and reference files (HTML template and images). There is no existing React application codebase.

## 2. Recommended Frontend Architecture
*   **Core Framework:** React 18+ (or latest) with TypeScript.
*   **Build Tool:** Vite for fast, optimized building and hot module replacement.
*   **Mapping Engine:** `react-leaflet` with Leaflet.js. It's lightweight, open-source, and easier for sophomores to implement rapidly compared to Mapbox/DeckGL.
*   **Styling:** Tailwind CSS combined with `lucide-react` for icons.
*   **Data Handling:** Local JSON/GeoJSON imports for the MVP phase.

## 3. React + TypeScript Structure
The project will follow a standard feature-based React structure:
```text
src/
├── assets/          # Static files (images, icons)
├── components/      # Reusable UI elements (Buttons, Cards, Inputs)
├── features/        # Feature-specific logic (Map, Simulation, Scenarios)
├── layouts/         # Global layouts (Sidebar, Topbar)
├── pages/           # Route-level components (Dashboard, Results)
├── store/           # Global state management
├── types/           # TypeScript interfaces and types
├── data/            # Mock JSON/GeoJSON files for scenarios
├── App.tsx
└── main.tsx
```

## 4. Routing/Navigation Approach
*   **Router:** `react-router-dom`.
*   **Routes:**
    *   `/` -> Dashboard (Global Overview)
    *   `/scenario` -> Scenario Builder
    *   `/simulation` -> Flood Simulation (Timeline)
    *   `/results` -> Impact Results & Dashboard
    *   `/emergency` -> Emergency Decision Support
*   **Navigation:** A fixed `SideNavBar` will handle routing between these primary views, while `TopNavBar` provides context.

## 5. Component Architecture
*   **Atoms:** `Button`, `Card`, `Badge`, `Icon`, `Input` (styled with Tailwind to match `DESIGN.md`).
*   **Molecules:** `MetricCard`, `TimelineSlider`, `ScenarioForm`.
*   **Organisms:** `GisMap` (Leaflet wrapper), `SideNavBar`, `TopNavBar`, `ResultsTable`.
*   **Templates:** `MainLayout` wrapping the side/top bars and an `<Outlet />`.

## 6. Map Architecture
*   **Library:** `react-leaflet`.
*   **Base Layer:** A dark-themed tile layer (e.g., CartoDB Dark Matter) to align with the `surface` colors defined in `DESIGN.md` (`#051424`).
*   **Layers Control:** Implement custom toggles for GeoJSON overlays (infrastructure, roads, flood extent).
*   **Polygons:** Load precomputed flood extents using `<GeoJSON />` components. Apply styling dynamically based on depth (using the Risk Indicators: Blue, Yellow, Orange, Red).

## 7. Data Architecture
Given the constraint of NO real backend, data will be strictly static files in `src/data/`.
*   **Dams:** `dams.json` (List of available dams with lat/lng, crest height, capacity).
*   **Infrastructure:** `infrastructure.json` (Point data for hospitals, schools in the demo area).
*   **Roads:** `roads.geojson` (Line strings).

## 8. Mock/Precomputed Scenario Architecture
To simulate the flood without a solver, scenarios will be structured as arrays of states:
```json
// scenario_A_catastrophic.json
{
  "scenarioId": "catastrophic",
  "damId": "demo_dam_1",
  "timeSteps": [
    {
      "timeLabel": "T+1 hr",
      "floodExtent": "geojson_t1.json",
      "metrics": { "maxDepth": 2.5, "velocity": 4.1, "affectedPop": 1200 }
    },
    {
      "timeLabel": "T+2 hr",
      "floodExtent": "geojson_t2.json",
      "metrics": { "maxDepth": 4.0, "velocity": 3.8, "affectedPop": 5400 }
    }
  ]
}
```
> **Note on Data Scaling:** For this MVP, the frontend logic currently overrides or scales these static `impactMetrics` (like `maxDepth` and `velocity`) based exclusively on the dynamic **Manning's Roughness (n)** input from the UI.

## 9. State Management
*   **Library:** `Zustand`. It's lightweight, avoids provider hell, and is perfect for a prototype.
*   **Store (`useSimulationStore`):**
    *   `selectedDam`: Dam object | null
    *   `selectedScenario`: Scenario configuration object | null
    *   `currentTimelineIndex`: number (controls which timestep to display)
    *   `isPlaying`: boolean (for timeline animation)

## 10. Type Definitions
Critical interfaces required:
*   `Dam` (id, name, coordinates, specs)
*   `Scenario` (id, type, breachParams)
*   `TimeStep` (index, label, geoJsonUrl, impactMetrics)
*   `ImpactMetrics` (population, criticalInfrastructureCount, maxDepth)

## 11. Styling Approach
*   **Tailwind CSS:** Configured strictly to match `DESIGN.md`. Custom colors (e.g., `surface: '#051424'`) will be added to `tailwind.config.ts`.
*   **Component Classes:** Use `clsx` and `tailwind-merge` to handle dynamic class string building.
*   **Glassmorphism:** Apply `backdrop-blur-md` and semi-transparent backgrounds to panels overlaying the map.

## 12. Asset/Reference Usage
*   **Visual Truth:** The references in `docs/design/references/` are the final source of truth.
*   **Icons:** `lucide-react` will be used for all line icons as per the design spec.
*   **HTML Template:** The `hydro_pulse_template.html` structure will be referenced for translating the layout into React components, but the fake JS math will be discarded.

## 13. V0.1 Implementation Plan (Application Shell)
*   Initialize Vite React + TS project.
*   Configure Tailwind CSS with `DESIGN.md` tokens.
*   Build `SideNavBar` and `TopNavBar`.
*   Build `MainLayout` and setup React Router.
*   Implement `GisMap` component with a dark base map.
*   Create empty placeholder pages for Dashboard, Scenario, Simulation, Results.
*   **Goal:** A navigable app shell with a map, matching the visual identity.

## 14. V0.2 Implementation Plan (Scenario Builder)
*   Create `src/data/dams.json`.
*   Build the `ScenarioBuilder` panel on the left side of the screen.
*   Implement form dropdowns (NOT free text inputs) to select Dam and Precomputed Scenario (e.g., Partial vs Catastrophic).
*   Add a "Load Scenario" button that updates the global state.

## 15. V0.3 Implementation Plan (Flood Simulation)
*   Create mock GeoJSON files for a 3-step timeline.
*   Build the `TimelineSlider` and Play/Pause controls.
*   Connect the slider to global state (`currentTimelineIndex`).
*   Update `GisMap` to conditionally render the GeoJSON layer corresponding to the current index.
*   Add the depth legend.

## 16. V0.4 Implementation Plan (Flood Results)
*   Create `infrastructure.json`.
*   Update `GisMap` to plot critical infrastructure markers.
*   Build the `ResultsDashboard` showing dynamic impact metrics tied to the active scenario and timeline.
*   Implement the risk matrix table listing affected settlements.
*   **Developer Reminder:** When wiring up the simulation state, ensure the mathematical output is scaled    strictly by the **Manning's Roughness (n)** variable. Other UI parameters are currently bypassed.

## 17. Testing Strategy
Given the hackathon timeframe and MVP scope:
*   **E2E/Unit:** Skip heavy unit testing (Jest/Cypress). 
*   **Manual QA:** Focus heavily on visual regression, ensuring the UI matches the design references across 1080p screens. Ensure map layer toggles and timeline slider function without crashing.

## 18. Development Workflow
*   Develop sequentially from V0.1 to V0.4.
*   Do not move to the next version until the current version is visually complete and bug-free.
*   Use local mock data from day 1 to avoid backend dependencies.

## 19. Dependencies Required
*   `react`, `react-dom`
*   `react-router-dom` (Routing)
*   `tailwindcss`, `postcss`, `autoprefixer` (Styling)
*   `lucide-react` (Icons)
*   `leaflet`, `react-leaflet`, `@types/leaflet` (Mapping)
*   `zustand` (State Management)
*   `clsx`, `tailwind-merge` (Class utility)

## 20. Risks and Technical Limitations
*   **GeoJSON Size:** High-resolution precomputed flood polygons can be large (MBs) and may cause browser lag. We will need to simplify the geometries using tools like Mapshaper before loading them into the MVP.
*   **Screen Size:** The design is highly information-dense. It may break on small laptops or mobile screens. The MVP will strictly target standard desktop dimensions (1920x1080).
*   **False Impressions:** Judges must be explicitly informed that the data is mocked. The UI must avoid scientific claims (like "Solver Converged") to prevent misrepresentation.
