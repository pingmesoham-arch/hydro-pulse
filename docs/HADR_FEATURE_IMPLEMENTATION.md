# Hydro_Pulse — HADR Impact & Risk Feature Implementation

**Document Date:** August 29, 2026  
**Audience:** SIH Internal Evaluation & Hackathon Judges  
**Project:** Hydro_Pulse (SIH PS 26161 / NTRO)

---

## 1. What Was Added

An interactive, multi-factor **HADR Impact & Risk Intelligence Layer** was integrated directly into Hydro_Pulse without altering existing routes or map foundations:

1. **Interactive Map Location Inspector HUD**:
   - Allows operators to click anywhere on the Leaflet map.
   - Instantly determines point inundation status, flood arrival time ($T+\text{XX min}$), peak water depth ($m$), peak velocity ($m/s$), and distance to nearest critical facility.
   - Displays a breakdown of normalized hazard factors with actionable evacuation directives.
2. **HADR Command & Situational Summary Panel**:
   - Inundated surface area calculation in $\text{km}^2$.
   - Earliest flood arrival lead time.
   - Disrupted transport corridors and compromised road length in kilometers.
   - Count of affected hospitals, schools, and bridges.
3. **Prioritized Evacuation & HADR Rescue Queue**:
   - Real-time triage table on `/emergency` ranking downstream facilities and settlements by composite risk and arrival urgency.
   - Filterable by priority tier: `CRITICAL`, `HIGH`, `MODERATE`, `LOW`.

---

## 2. Files Changed & Created

- **`src/lib/hadr/types.ts`** *(New)*: Type-safe interfaces for risk scores, arrival analyses, inspection results, and situational summaries.
- **`src/lib/hadr/hadrEngine.ts`** *(New)*: Core analytical engine implementing geodesic polygon area, point-in-polygon multi-timestep arrival detection, and 4-factor risk scoring.
- **`src/features/map/LocationInspector.tsx`** *(New)*: Floating Leaflet-integrated analytical HUD and beacon marker.
- **`src/features/map/GisMap.tsx`** *(Modified)*: Mounted `LocationInspector` inside `MapContainer`.
- **`src/pages/EmergencyPage.tsx`** *(Modified)*: Upgraded to a full HADR Command Dashboard with situational metrics and prioritized rescue queue.
- **`src/pages/ResultsPage.tsx`** *(Modified)*: Added quick HADR summary badge and navigation.

---

## 3. How the Risk Calculation Works

The system calculates a transparent, deterministic **HADR Risk Score** ($0 - 100$):

$$\text{Risk Score} = 0.30 \cdot D_{\text{norm}} + 0.20 \cdot V_{\text{norm}} + 0.25 \cdot T_{\text{norm}} + 0.25 \cdot C_{\text{norm}}$$

- **Depth Hazard ($D_{\text{norm}}$)**: Scaled against structural failure threshold ($3.5\text{m}$).
- **Velocity Hazard ($V_{\text{norm}}$)**: Scaled against high-momentum wash-away threshold ($6.0\text{m/s}$).
- **Arrival Urgency ($T_{\text{norm}}$)**: $100$ if $t_{\text{arrival}} \le 15\text{m}$, $85$ if $\le 30\text{m}$, $60$ if $\le 60\text{m}$, $35$ if $\le 120\text{m}$, $0$ if unflooded.
- **Facility Criticality ($C_{\text{norm}}$)**: Hospitals/Emergency Services ($95$), Bridges/Trunk Roads ($85$), Schools/Settlements ($75$), General ($40$).

### Risk & Priority Triage Thresholds:
- **$\ge 75 \implies \text{CRITICAL}$**: Immediate vertical evacuation to elevated concrete structures.
- **$50 - 74 \implies \text{HIGH}$**: Rapid perimeter evacuation; secure transport corridors.
- **$25 - 49 \implies \text{MODERATE}$**: Standby & prepare; restrict low-lying crossings.
- **$< 25 \implies \text{LOW / SAFE}$**: Area outside direct flood path; monitor secondary runoff.

---

## 4. What Data is Actually Used

- **Dam Attributes**: Real height and gross storage capacity (`src/data/dams.ts`).
- **Geospatial Features**: Real OpenStreetMap Overpass datasets for downstream Nashik / Godavari corridor (`infrastructure.geojson` and `roads.geojson`).
- **Hydraulic Outputs**: Dynamic weir/Froehlich breach peak discharge and Manning open-channel calculations across timesteps ($T+00 \to T+120\text{ min}$).

---

## 5. What is Genuinely Implemented vs. Limitations

### Genuinely Implemented:
- Client-side spatial ray-casting (`isPointInPolygon`) across 5 temporal flood polygons.
- Geodesic surface area calculation ($\text{km}^2$) and road segment intersection.
- Interactive map inspection with live coordinates, arrival times, and nearest asset distance.
- Sortable evacuation triage queue based on explainable multi-factor scoring.

### Current Limitations:
- Prototype spatial flood extents are currently bundled for Gangapur Dam; non-Gangapur study areas report scalar hydraulic estimates while awaiting spatial polygon ingestion.
- Does not run a live 2D shallow water PDE solver in the browser; uses precomputed DEM-derived polygon series coupled with live empirical discharge calculations.
