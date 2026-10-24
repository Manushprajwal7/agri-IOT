---
name: AgriSense & AgriMarket
description: Fresh light theme precision agronomy and autonomous farm-to-market trade platform
colors:
  primary: "#047857"
  primary-hover: "#065f46"
  primary-dark: "#064e3b"
  primary-light: "#f0fdf4"
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  neutral-subtle: "#f1f5f9"
  text-primary: "#0f172a"
  text-secondary: "#334155"
  text-muted: "#64748b"
  border-subtle: "#e2e8f0"
  border-strong: "#cbd5e1"
  status-success: "#047857"
  status-success-bg: "#f0fdf4"
  status-warning: "#b45309"
  status-warning-bg: "#fffbeb"
  status-danger: "#b91c1c"
  status-danger-bg: "#fef2f2"
  status-info: "#0369a1"
  status-info-bg: "#f0f9ff"
typography:
  display:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.25
  headline:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.03em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: AgriSense & AgriMarket

## Overview

**Creative North Star: "The Grounded Agronomist"**

AgriSense & AgriMarket pairs the organic reliability of cultivated soil with the crisp analytical precision of satellite remote sensing and autonomous AI trade. Built for high-sunlight outdoor fieldwork, agricultural trade floors, and desktop research consoles, the interface prioritizes immediate legibility, human craftsmanship, and functional calm over decorative tech tropes.

The aesthetic establishes an open, luminous white canvas (`#ffffff`, `#f8fafc`) structured by deliberate typography in **Outfit** (providing warm, confident geometry) and **JetBrains Mono** (for verifiable sensor telemetry and contract hash strings). Deep agronomic emerald green (`#047857`, `#064e3b`) serves as the core brand anchor, meeting strict WCAG AA contrast standards across all light backgrounds.

**Key Characteristics:**
- **Luminous White & Emerald Foundations**: Fresh, daylight-optimized light theme rejecting artificial dark modes and neon glow filters.
- **Strict Legibility Floor**: Zero functional or interactive text under 12px; guaranteed 4.5:1 minimum contrast across all states.
- **Calibrated Multi-Layer Elevation**: Organic, neutral slate drop-shadows replacing colored or blurred chromatic halos.
- **Purposeful Deceleration Motion**: Smooth exponential easing (`cubic-bezier(0.16, 1, 0.3, 1)`) without springy or cartoonish bouncing.

## Colors

The palette derives its tonal depth from thriving crop canopies, rich river-valley soil, and clean morning skies.

### Primary
- **Forest Emerald** (`#047857`): Primary interactive brand color used for action buttons, active navigation indicators, and verified credibility badges. Delivers a 4.6:1 contrast ratio against pure white and 5.6:1 against white text.
- **Deep Canopy** (`#064e3b`): High-authority display color for prominent headers, brand hero headings, and hovered primary buttons (8.5:1 contrast against white).
- **Sprout Mist** (`#f0fdf4`): Subtle tint background for selected card containers, table highlights, and positive status pill backgrounds.

### Neutral
- **Paper Canvas** (`#ffffff`): Card surfaces, modal bodies, topbar header, and input fields.
- **Soft Meadow Wash** (`#f8fafc`): App background page canvas providing comfortable optical separation behind pure white cards.
- **Charcoal Ink** (`#0f172a`): High-contrast primary typography ensuring crisp reading even under severe glare.
- **Slate Foliage** (`#334155` / `#475569`): Secondary body text, table data labels, and descriptive paragraphs.
- **Muted Stone** (`#64748b`): Metadata, timestamps, and secondary icon outlines.
- **Wire Border** (`#e2e8f0`): Structural card boundaries and divider rules.

### Named Rules
**The Rarity Rule.** Forest Emerald accent color is reserved for primary actions, active navigation items, and verified trust markers. It covers ≤12% of screen area; its restraint is what communicates authority.

**The Contrast Floor Rule.** Never render green text lighter than `#047857` on white or light backgrounds. Neon green (`#10b981`) is prohibited as text on light surfaces.

## Typography

**Display & Body Font:** Outfit (Google Fonts) with fallbacks to system-ui, -apple-system, sans-serif.  
**Telemetry & Data Font:** JetBrains Mono (Google Fonts) for sensor readings, coordinates, and pricing.  

**Character:** Outfit delivers rounded, human geometric curves that feel organic yet engineered, eliminating the generic tech-dashboard look of Inter.

### Hierarchy
- **Display** (Bold 700, `clamp(1.75rem, 4vw, 2.25rem)`, line-height 1.25): Hero announcements and primary welcome headlines.
- **Headline** (Bold 700, `1.375rem`, line-height 1.3): Major workbench sections and analytics chart titles.
- **Title** (Semi-bold 600, `1.0625rem`, line-height 1.4): Sensor card headings, modal headers, and marketplace product names.
- **Body** (Regular 400 / Medium 500, `0.9375rem` / 15px, line-height 1.55): Descriptive explanations, advice summaries, and conversational AI transcripts. Max line length 72ch.
- **Label** (Semi-bold 600, `0.75rem` / 12px, letter-spacing 0.03em, uppercase): Status chips, category tags, table column headers, and telemetry metadata. Never below 12px.

### Named Rules
**The 12px Absolute Floor.** No functional, readable, or interactive text element anywhere in the user interface shall have a font-size below 12px.

## Layout

A responsive 12-column grid system built on an 8px base spacing unit (`8px`, `16px`, `24px`, `32px`).
- **Sidebar Navigation**: Fixed 260px left column on desktop (`≥1024px`), smoothly collapsing to an off-canvas drawer on tablet and a crisp 5-item bottom bar on mobile (`<768px`).
- **Content Area**: Fluid max-width container (`1440px`) centered with responsive gutter padding (`24px` on desktop, `16px` on mobile).
- **Hero & Card Scaffolding**: Flat, single-level card hierarchies without nested container boxes.

## Elevation & Depth

Surfaces rely on subtle tonal layering (`#ffffff` on `#f8fafc`) paired with multi-stop, neutral slate ambient drop-shadows.

### Shadow Vocabulary
- **Resting Card** (`0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)`): Subtle boundary definition for elevated cards on the soft meadow page background.
- **Elevated Hover** (`0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`): Interactive marketplace tiles and card hover states.
- **Modal Overlay** (`0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`): Voice Assistant modal and critical alert dialogs.

### Named Rules
**The Halo Prohibition.** Zero colored glow shadows (`box-shadow: 0 0 10px #10b981`). Elevation is communicated solely through neutral lighting and crisp 1px borders.

## Shapes

- **Base Radius**: `10px` for standard cards and form containers.
- **Pill Radius**: `9999px` (`full`) for status chips, filter buttons, and user badges.
- **Control Radius**: `8px` for buttons, inputs, and selects.
- **Border Treatment**: Clean 1px continuous hairline borders (`#e2e8f0`). Chunky colored side borders (`border-left: 4px` / `6px`) are eliminated in favor of semantic status chips and soft background washes.

## Components

### Buttons
- **Shape**: Rounded rectangle (`8px` radius).
- **Primary**: Deep Forest Emerald (`#047857`) gradient to (`#064e3b`), crisp white text (`#ffffff`), `10px 20px` padding, 13px font-weight 600.
- **Secondary**: Soft tint (`#f0fdf4`), emerald border (`#a7f3d0`), dark green text (`#047857`).
- **Outline**: Clean white surface, slate border (`#cbd5e1`), charcoal text (`#334155`).

### Status Badges & Chips
- **Shape**: Fully rounded pill (`9999px` radius).
- **Typography**: 12px font-size, font-weight 600, letter-spacing 0.03em.
- **Padding**: `4px 10px`.
- **States**:
  - Success: `#047857` on `#f0fdf4` with `#a7f3d0` border.
  - Warning: `#b45309` on `#fffbeb` with `#fde68a` border.
  - Critical: `#b91c1c` on `#fef2f2` with `#fecaca` border.
  - Info: `#0369a1` on `#f0f9ff` with `#bae6fd` border.

### Cards
- **Shape**: `12px` border radius with `1px solid #e2e8f0` border.
- **Background**: Pure white (`#ffffff`).
- **Nesting**: Zero card-inside-card designs. Secondary column groupings use clean hairline dividers (`border-top: 1px solid #e2e8f0`) rather than nested container boxes.

## Do's and Don'ts

### Do:
- **Do** maintain a strict 12px minimum floor on all functional UI text.
- **Do** use `#047857` or `#064e3b` for all primary emerald accents on light backgrounds.
- **Do** use `Outfit` as the primary typography family across all views.
- **Do** use exponential deceleration (`cubic-bezier(0.16, 1, 0.3, 1)`) for micro-interactions.
- **Do** use multi-layer neutral slate shadows for elevation.

### Don't:
- **Don't** use `#10b981` as text on white or light backgrounds (fails WCAG AA contrast).
- **Don't** use colored glow shadows (`rgba(16, 185, 129, ...)`).
- **Don't** use chunky `border-left: 4px` / `6px` colored side tabs.
- **Don't** nest cards inside other cards.
- **Don't** use infinite pulsing animations on static indicators.
- **Don't** use bouncy or springy animation easing.
