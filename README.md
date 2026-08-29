# Hydro_Pulse — Dam-Break Inundation Modelling & Decision Support

Hydro_Pulse is an interactive GIS web platform engineered for dam-break inundation estimation and disaster management decision support, developed for the Smart India Hackathon (SIH PS 26161 / NTRO).

The system models hydraulic outflow from potential dam failure scenarios and performs real-time spatial impact assessments on downstream population centres, transport networks, and critical infrastructure.

---

## Key Features

- **Dam-Break Scenario Builder**: Configure failure modes (Partial Breach vs. Catastrophic Breach), Manning's surface roughness ($n$), breach dimensions, and crest failure ratios across study areas (e.g., Gangapur Dam).
- **Interactive Temporal Hydrograph & Timeline**: Step through and animate inundation progression across a 5-step timeline ($T+00 \to T+120\text{ min}$) with dynamic discharge ($m^3/s$), velocity ($m/s$), and depth ($m$) tracking.
- **GIS Map Interface**: High-performance Leaflet-based map with asynchronous layer loading, keep-buffer tile caching, and toggleable OpenStreetMap geospatial reference layers (roads, hospitals, schools, bridges).
- **Automated HADR Impact Assessment**: Real-time client-side spatial ray-casting to identify inundated infrastructure assets, compromised road networks, and population exposure zones.
- **Multi-Theme Display**: Multiple visual presets tailored for field operations and operations-center presentations (Dark GIS, Light, High-Contrast Swiss Minimal, Enterprise).

---

## Architecture & Engineering

Hydro_Pulse operates as a client-side single-page application (SPA) with modular separation of concerns:

```text
src/
├── assets/                  # Logos and static visual assets
├── components/              # Shared UI components (DemoWalkthrough)
├── data/                    # Dam metadata, scenario presets, and geospatial reference data
│   ├── dams.ts              # Dam catalog and physical specifications
│   ├── scenarios.ts         # Predefined failure mode parameters
│   └── studyAreas/          # Study-area resolver, flood extents, and OSM infrastructure
├── features/
│   ├── map/                 # GisMap container and lazy-loaded layer components
│   ├── scenarios/           # Scenario builder panel and input validation
│   └── simulation/          # Hydraulic estimator and hydrograph calculations
├── layouts/                 # Main application layout, navigation bars, and settings
├── lib/
│   ├── floodExtent/         # Flood extent models and geometry resolvers
│   └── impact/              # Spatial ray-casting and population exposure estimators
├── pages/                   # Results dashboard and Emergency decision support
└── store/                   # Zustand global simulation state store
```

### Hydraulic Estimation Pipeline

1. **Breach Peak Outflow**: Integrates broad-crested weir opening capacity ($Q = 1.7 \cdot B \cdot H^{1.5}$) with Froehlich volume-constrained empirical regressions ($Q \propto V^{0.295} \cdot H^{1.24}$) modulated by channel roughness ($n$).
2. **Open-Channel Hydraulics**: Derives representative inundation depth ($y = \left[\frac{Q \cdot n}{W \sqrt{S}}\right]^{3/5}$) and flow velocity ($v = \frac{1}{n} y^{2/3} \sqrt{S}$) via Manning's formula.
3. **Spatial Ray-Casting**: In-browser geometric intersection (`isPointInPolygon`) classifies assets into risk categories (`CRITICAL`, `MODERATE`, `SHALLOW`, `SAFE`).

---

## Tech Stack

- **Framework**: React 19, TypeScript
- **Build Tooling**: Vite 8, Oxlint
- **Mapping & GIS**: Leaflet, React-Leaflet, GeoJSON
- **State Management**: Zustand
- **Styling**: Tailwind CSS, PostCSS, Lucide React

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/pingmesoham-arch/hydro-pulse.git

# Install dependencies
npm install

# Start local development server
npm run dev

# Run type check and production build
npm run build

# Run linter
npm run lint
```

---

## Scientific Disclaimer

Hydro_Pulse is a prototype decision-support framework designed for interactive exploration and disaster relief workflow demonstration. While hydraulic formulas are grounded in empirical regression and open-channel principles, they do not replace fully validated 2D hydrodynamic simulations (such as HEC-RAS 2D or TELEMAC-2D) for statutory engineering safety sign-offs.
