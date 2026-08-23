---
name: Hydro_Pulse Design System
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#bcc9ce'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#869398'
  outline-variant: '#3d494d'
  surface-tint: '#4cd6fb'
  primary: '#4cd6fb'
  on-primary: '#003642'
  primary-container: '#00b4d8'
  on-primary-container: '#00414f'
  inverse-primary: '#00677d'
  secondary: '#94ccff'
  on-secondary: '#003352'
  secondary-container: '#0378b7'
  on-secondary-container: '#f5f8ff'
  tertiary: '#bcc7de'
  on-tertiary: '#263143'
  tertiary-container: '#9aa5bc'
  on-tertiary-container: '#303b4e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b3ebff'
  primary-fixed-dim: '#4cd6fb'
  on-primary-fixed: '#001f27'
  on-primary-fixed-variant: '#004e5f'
  secondary-fixed: '#cde5ff'
  secondary-fixed-dim: '#94ccff'
  on-secondary-fixed: '#001d32'
  on-secondary-fixed-variant: '#004b74'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  technical-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max-width: 1440px
---

## Brand & Style

The brand personality is **Precise, Authoritative, and Mission-Critical**. This design system serves as a professional GIS tool for disaster management, requiring an interface that conveys scientific accuracy and urgent reliability.

The design style is **Modern Corporate with a Geospatial Focus**. It prioritizes information density and utilitarian clarity over decorative flair. Key characteristics include:
- **Scientific Rigor:** High-density data displays and technical micro-copy.
- **Visual Calm:** A dark, low-fatigue environment suitable for long-term monitoring and emergency response operations.
- **Functional Transparency:** Subtle use of translucent layers to maintain context without sacrificing legibility.
- **Architectural Integrity:** Structural alignment and a strict grid system to organize complex geospatial parameters.

## Colors

The palette is anchored in a deep-space navy to provide maximum contrast for critical data overlays and map layers.

- **Primary & Secondary:** Used for active states, primary actions, and branding accents. The cyan and teal tones evoke water and hydrodynamic precision.
- **Risk Spectrum:** A standardized semantic scale for disaster severity. Use these strictly for status indicators, map heatmaps, and alert banners.
- **Neutral/Technical:** Use `#94A3B8` for secondary labels and non-essential technical metadata to prevent visual clutter.
- **Surface Strategy:** Use `#111827` for containers. Borders should use `#1E293B` to maintain a subtle, "ghosted" appearance that defines space without being heavy.

## Typography

The system utilizes **Inter** for its neutral, highly legible character, which is essential for reading coordinate data and numerical outputs.

- **Technical Data:** Use `label-caps` for all non-interactive metadata and section headers within widgets (e.g., "SIMULATION PARAMETERS").
- **Hierarchy:** Maintain high contrast between headlines (Semi-bold/Bold) and technical labels.
- **Numeric Display:** For real-time counters (e.g., flow rate), ensure tabular figures are used to prevent "jittering" during value updates.
- **Mobile Scaling:** On mobile devices, `headline-xl` should scale down to `headline-md` (24px) to accommodate smaller viewport widths in data-heavy views.

## Layout & Spacing

The layout philosophy is a **Structured Fluid Grid** optimized for multi-pane dashboards.

- **Grid Model:** A 12-column system for desktop, 8-column for tablet, and 4-column for mobile. 
- **Density:** High information density is required. Use a 4px baseline shift for tight vertical rhythm in technical lists.
- **Map Focus:** GIS views should be treated as "Infinite Canvas" layouts where sidebars and tool panels float with 16px margins from the screen edge.
- **Reflow:** On mobile, sidebars collapse into bottom sheets or full-screen overlays to maximize the visibility of the primary map simulation.

## Elevation & Depth

This design system uses **Tonal Layering and Low-Contrast Outlines** rather than traditional shadows to maintain a "scientific instrument" feel.

- **Base Layer:** The darkest tone (`#0A0F1E`) represents the lowest depth (application background).
- **Surface Layer:** Cards and panels use `#111827`.
- **Raised State:** Interactive elements or active tool panels use a subtle backdrop-blur (12px) with 85% opacity to distinguish themselves when overlapping map data.
- **Borders:** Use a 1px solid border (`#1E293B`) for all containers. Avoid drop shadows unless they are used to highlight a critical modal or alert, in which case use a soft, non-tinted `#000000` shadow with a 20% opacity.

## Shapes

The shape language is **Soft (0.25rem)**. This provides enough definition to distinguish elements without appearing overly consumer-focused or "playful."

- **Small Components:** Checkboxes, input fields, and small buttons use the base `0.25rem` radius.
- **Containers:** Large data cards and map containers use `rounded-lg` (0.5rem).
- **Interactive States:** Focus states should use a 2px offset ring in the Primary color to maintain clear accessibility in high-stakes environments.

## Components

### Buttons
- **Primary:** Solid `#00B4D8` with white or deep navy text. High contrast, sharp focus.
- **Secondary:** Ghost style with `#1E293B` borders and Primary-colored text.
- **Action Icons:** 20px Lucide-style icons (stroke width: 1.5px) centered in a 40px square container for map tools.

### Input Fields
- **Style:** Dark backgrounds (`#0A0F1E`) with thin borders. Labels must use `label-caps` positioned above the input.
- **Feedback:** Error states use the `risk_critical` red for both border and helper text.

### Data Cards
- **Structure:** 16px internal padding. Headers should be separated from content by a 1px divider.
- **Transparency:** Use `rgba(17, 24, 39, 0.8)` for panels that overlay the map simulation to maintain spatial context.

### Chips & Status
- **Risk Indicators:** Use small pills with a dot indicator using the Risk Spectrum colors. 
- **Text:** Technical data within chips should be semi-bold Inter.

### Lists & Tables
- **Density:** Compact rows (32px height) for technical data tables.
- **Zebra Striping:** Use a subtle tone shift on alternate rows to improve horizontal scanability.