# Hydro_Pulse — Optional HADR Operational Planning Inputs

**Date:** August 29, 2026  
**Audience:** SIH Internal Evaluation & Hackathon Reviewers  
**Project:** Hydro_Pulse (SIH PS 26161 / NTRO)

---

## 1. What Was Added

An **Optional "HADR Operational Inputs"** planning section was added to the **Emergency / HADR Decision Support Page (`/emergency`)**. 

This feature allows emergency operations center (EOC) directors to configure civil defence logistics parameters and evaluate resource adequacy against the simulated flood arrival time and downstream inundation footprint.

---

## 2. Files Changed & Created

- **`src/features/hadr/OperationalInputsPanel.tsx`** *(New)*: Lightweight, reusable command-center input & assessment card.
- **`src/pages/EmergencyPage.tsx`** *(Modified)*: Embedded `OperationalInputsPanel` above the prioritized evacuation queue; upgraded summary telemetry card text contrast for light/dark themes.

---

## 3. Meaning of Each Operator-Provided Input

| Input Field | Default Value | Description |
| :--- | :--- | :--- |
| **1. Estimated Population at Risk** | `12,500` | Total vulnerable individuals in downstream municipal / rural exposure zones. |
| **2. Available Shelter Capacity** | `8,000` | Aggregate designated bed/hall spaces across elevated community centres. |
| **3. Available Warning Time** | `30 min` | Target duration required for broadcast alerts and siren dissemination. |
| **4. Rescue Teams Available** | `5` | Mobilized National/State Disaster Response Force (NDRF/SDRF) boat units. |
| **5. Ambulances Available** | `8` | Available medical transport vehicles allocated to the flood sector. |

> **Important Distinction:** These 5 parameters are **operator-provided logistical inputs**, decoupled from the empirical hydraulic solver.

---

## 4. Derived Operational Calculations & Rules

When the user clicks **"UPDATE HADR ASSESSMENT"**, the system evaluates three operational dimensions:

### A. Shelter Capacity Gap Analysis
$$\text{Shelter Gap} = \text{Population at Risk} - \text{Shelter Capacity}$$
- **If $\text{Gap} > 0$ (Deficit)**: Flags a deficit (e.g., `-4,500 Deficit`) advising immediate mobilization of secondary school halls or mutual-aid shelters.
- **If $\text{Gap} \le 0$ (Surplus)**: Flags designated shelters as sufficient.

### B. Early Warning Lead-Time Buffer
$$\text{Lead-Time Margin} = t_{\text{earliest\_arrival}} - t_{\text{warning}}$$
- **If $t_{\text{warning}} \ge t_{\text{earliest\_arrival}}$ (Deficit)**: Critical alarm! Flood reaches downstream points before or at the time alerts are disseminated.
- **If $t_{\text{warning}} < t_{\text{earliest\_arrival}}$ (Buffer)**: Confirms a positive safety margin prior to peak wave arrival.

### C. Responder Density
$$\text{Density} = \frac{\text{Population at Risk}}{\text{Rescue Teams}}$$
- Estimates population load per deployed NDRF/SDRF rescue team.

### D. Overall Logistical Readiness Status
- **`CRITICAL`**: If $\text{Shelter Gap} > 3,000$ OR $t_{\text{warning}} \ge t_{\text{earliest\_arrival}}$.
- **`ATTENTION`**: If $\text{Shelter Gap} > 0$ OR $\text{Rescue Teams} < 4$.
- **`ADEQUATE`**: If shelters, warning buffer, and rescue density satisfy demand.

---

## 5. What is Implemented vs. Optional / Future Scope

### Genuinely Implemented:
- Live, interactive operator form with instant calculation of shelter deficits and warning buffers.
- Direct comparison with the active scenario's earliest arrival lead time ($T+15\text{m}$).
- High-contrast visual styling matching the command-centre theme.

### Optional / Future Scope:
- Ingestion of live census GIS boundary shapefiles.
- Dynamic route dispatch algorithms for individual ambulance/boat units.
