# Hydro_Pulse Frontend Implementation Specification (MVP)

## 1. Project Overview
Hydro_Pulse is a GIS-based disaster-management prototype for dam-break inundation modeling. This specification details the frontend implementation for an MVP using React, TypeScript, Tailwind CSS, and a mapping library (e.g., Leaflet or Mapbox).

**Visual Direction:** Dark slate/navy GIS aesthetic with cyan accents.
**Status:** MVP / Frontend Prototype (Precomputed Data).

---

## 2. Global Application Layout
- **Container:** 100vw/100vh overflow-hidden shell.
- **Sidebar (Fixed):** 80px width, left-aligned.
- **Top Bar (Fixed):** 64px height, docked top, offset by sidebar.
- **Main Content:** Flex-grow area for maps and analysis panels.
- **Z-Index Strategy:** Map (0), Overlays (10), Top Bar (40), Sidebar (50).

---

## 3. Component Specifications

### 3.1 Sidebar Navigation (`SideNavBar`)
- **Tabs:** Dashboard, Scenario, Simulation, Results, Emergency, Data/Layers.
- **Style:** Dark surface, border-r, vertical icons with small text labels.
- **Active State:** Cyan left-border (2px) and matching icon/text color.
- **Interaction:** Click to route between main view components.

### 3.2 Top Navigation (`TopNavBar`)
- **Left:** App Branding ("Hydro_Pulse" + Logo).
- **Center:** Breadcrumbs/Context (Current Project > Selected Dam).
- **Right:** Status Indicators (Simulation Status: Idle/Running, System Health) + User Settings.
- **Style:** Translucent dark background (`backdrop-blur-md`).

### 3.3 Map Framework (`GisMap`)
- **Base Layer:** Dark-themed satellite or topographical tiles.
- **Overlays:** 
    - **Vector Layers:** Dam marker, river path, study area boundary, critical infrastructure points.
    - **Heatmap/Raster:** Flood depth inundation overlay (precomputed states).
- **Controls:** Floating zoom (+/-), center-to-dam, layer toggle.
- **Interactions:** Hover markers for tooltips; click for detailed impact data.

---

## 4. Screen-Specific Implementation

### 4.1 Overview Dashboard (`{{DATA:SCREEN:SCREEN_6}}`)
- **Main View:** Global map showing the demo river catchment.
- **Overlays:** 
    - **Metric Cards:** 4x small cards (Max Depth, Velocity, Inundated Area, Max Discharge).
    - **Status Panel (Right):** Current scenario summary and last simulation timestamp.
- **Data:** Static mock metrics based on "Demo Dam" baseline.

### 4.2 Scenario Builder (`{{DATA:SCREEN:SCREEN_5}}`)
- **Layout:** 400px side panel (left) over a contextual map (right).
- **Forms:**
    - Dam Parameters (Name, Lat/Long).
    - Reservoir Conditions (Water Level, Capacity).
    - Breach Mechanics (Failure Mode dropdown, Width, Depth, Formation Time).
- **Interaction:** "Run Simulation" triggers transition to processing state.
- **Data:** User-entered form values; pre-filled with "Demo Dam" defaults.

### 4.3 Flood Simulation (`{{DATA:SCREEN:SCREEN_2}}`)
- **Hero Element:** Simulation timeline/playback controller (bottom center).
- **Controls:** Play/Pause, Step Rate (1x, 5x, 10x), Timeline Slider (T+0 to T+120).
- **Map Behavior:** Switch inundation layers based on timeline index (T+15, T+30, etc.).
- **Overlays:**
    - **Depth Legend:** Gradient (Low to Critical).
    - **Real-time Metrics:** Impact counters that update as the slider moves.
- **Data:** Precomputed GeoJSON/Raster frames for 5-8 time steps.

### 4.4 Flood Results (`{{DATA:SCREEN:SCREEN_4}}`)
- **Layout:** Analysis panel (left), Map (right), Detailed Table (bottom).
- **Charts:** Depth over time (Hydrograph) and Area by Depth Class (Bar/Progress bars).
- **Data Table:** List of settlements with Arrival Time, Max Depth, and Risk Level.
- **Data:** Mock JSON results generated from the "Demo River" scenario.

### 4.5 Emergency Decision Support (`{{DATA:SCREEN:SCREEN_3}}`)
- **Objective:** Answer "What is at risk?"
- **Impact Summary:** Affected Pop, Est. Damages, Critical Infrastructure count.
- **Risk Matrix:** Sorted list of locations (Village A, B, C) with color-coded risk badges.
- **Action:** Primary button "Generate Response Summary" (PDF export mock).
- **Data:** Static analysis data correlating settlement locations with peak flood extent.

---

## 5. Design Tokens & UI Elements

### 5.1 Risk Indicators
- **Critical (Red):** #EF4444 (Arrival < 30min / Depth > 3.0m).
- **High (Orange):** #F97316 (Arrival < 60min / Depth 1.5m - 3.0m).
- **Moderate (Yellow):** #EAB308 (Depth 0.5m - 1.5m).
- **Low (Blue/Teal):** #00B4D8 (Depth < 0.5m).

### 5.2 Loading & States
- **Simulation Processing:** Spinner with sequential text updates ("Loading Terrain...", "Processing Inundation...").
- **Empty States:** "Select a Dam to begin configuration."
- **Error States:** "Unable to load precomputed scenario for this location."

---

## 6. Implementation Notes for Developer
- **Mapping:** Use `react-leaflet` for simplicity or `react-map-gl` for performance.
- **State Management:** Use `Context API` or `Zustand` to track selected Dam and Simulation Timeline index globally.
- **Simulation Logic:** The "Solver" is a frontend timer that cycles through pre-set array indices containing different map layer URLs and metric objects.
- **Responsive:** Primary target 1920x1080. Panels should collapse or stack on tablet/mobile frames.
