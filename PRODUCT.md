# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- Static HTML5 SPA with dynamic view routing (`index.html` + view mirrors)
- Modern CSS with custom property design tokens and responsive breakpoints
- Vanilla ES6+ JavaScript modules (`sensors.js`, `marketplace.js`, `crop-intelligence.js`, `satellite.js`, `ai-assistant.js`, `orders.js`, `devices.js`)
- Node.js & Express API backend with real-time SSE (Server-Sent Events) telemetry streaming (`server.js`)
- Hardware IoT: ESP32 microcontrollers with capacitive soil moisture sensors, DHT22 ambient sensors, LCD display, piezo buzzer alert system

## Users

1. **Indian Smallholder & Commercial Farmers**: Primary producers requiring real-time, zero-delay field moisture, temperature, and phenology telemetry in high-sunlight, field conditions, with intuitive local-language voice assistance (Kannada, Hindi, English).
2. **Agricultural Cooperative & FPO Managers**: Aggregators coordinating harvested yields, bulk supply logistics, and mandi price hedging.
3. **Institutional Commodity Buyers & Retail Wholesalers**: Buyers seeking verified crop lots with transparent moisture provenance and instant settlement contracts.
4. **Agronomists & Field Officers**: Technical specialists monitoring satellite spectral indices (NDVI, SpaceNet segmentation) and scheduling precision irrigation cycles.

## Product Purpose

AgriSense & AgriMarket bridges the deep gap between physical in-field agricultural reality and transparent, equitable agricultural trade. It solves the critical double crisis in Indian agriculture:
1. **Inefficient Precision Agronomy**: Over-irrigation, root rot, and pest damage caused by guesswork rather than real-time soil and ambient sensor telemetry.
2. **Exploitative Supply Chain Intermediaries**: Multi-layered mandi cartels and delayed logistics that strip 40-60% of crop value away from farmers.

Success means providing farmers with instant, high-contrast, actionable sensor data coupled with autonomous AI agentic voice negotiation (Call-E) that directly secures buyers at fair MSP-aligned rates without friction.

## Positioning

Unlike disconnected hobbyist IoT dashboards or speculative agri-commodity apps that operate in silos, AgriSense creates a unified, closed-loop precision agronomy and commerce ecosystem:
- **Real-Time Physical Hardware Ground Truth**: Live ESP32 telemetry with audible hardware alarms when soil moisture crosses critical thresholds (>85%).
- **Orbital Spectral Intelligence**: High-resolution Sentinel-2 / SpaceNet satellite imagery and Deep Learning classification (MobileNetV2 / CNN) for vegetative phenotyping.
- **Autonomous Agentic Voice Commerce**: The Call-E multi-agent system conducts real-time bilingual voice negotiations, logistics matching, and supply chain contract execution.

## Operating Context

- **Environment**: Outdoor daylight and direct sunlight in rural farm fields, bustling mandi trading floors, and desk-based logistics offices.
- **Connectivity**: Variable 2G/3G/4G bandwidth in rural regions requiring fast, lightweight bundle sizes (<150KB JS/CSS), resilient client-side caching, and graceful offline fallback states.
- **Interaction Modalities**: Touch-first mobile devices, large desktop monitors, and hands-free voice commands via microphone in Kannada, Hindi, and English.

## Capabilities and Constraints

- **Live Hardware Telemetry**: SSE stream from `/api/sensors/stream` with real-time temperature, humidity, capacitive moisture, NPK values, and buzzer alarms.
- **Audible Alert Rules**: ESP32 buzzer triggers continuous high-frequency alert pattern only when soil moisture exceeds 85%.
- **Crop Intelligence**: Phenological growth staging, pest susceptibility profiles, and precision irrigation calculators for Rice, Tomato, Cotton, Sugarcane, Maize, and Chilli.
- **Satellite Spectral Analysis**: NDVI health maps, multispectral band inspection, and Deep Learning crop segmentation.
- **AgriMarketplace**: Real-time mandi price feeds, verified farmer badges, cart management, instant checkout, and autonomous Call-E voice broker modal.
- **Multilingual Support**: Real-time UI internationalization via `data-i18n` (English, Kannada, Hindi).

## Brand Commitments

- **Tone**: Trustworthy, scientific, grounded, and empowering.
- **Color Philosophy**: Fresh light theme with agronomic emerald greens (`#047857`, `#064e3b`), clean paper white canvas (`#ffffff`, `#f8fafc`), and deep slate typography (`#0f172a`).
- **Prohibitions**: No dark neon-glow halos, no low-contrast green text on white, no bouncy spring animations, no decorative pulsing dots without live data backing.

## Accessibility & Inclusion

- Strict adherence to **WCAG AA** standards: minimum 4.5:1 contrast for all normal text and 3:1 for large graphical elements.
- Absolute **12px minimum floor** for all content and interactive text.
- High-visibility focus indicators and 44x44px minimum touch targets on mobile viewports.
- Screen-reader friendly semantic markup and bilingual voice interaction.
