# AgriSense & AgriMarket AI

### Integrated Smart Agriculture, Satellite Crop Intelligence & AI-Powered Agricultural Supply Chain Platform

> **Hackathon Prototype MVP** built in complete accordance with all 100 sections of [`PRD.md`](./PRD.md).

---

## 🌟 Overview & Product Vision

AgriSense & AgriMarket AI connects **physical farm sensing, satellite crop analytics, and farmer-to-farmer commerce** into a single cohesive platform:

```text
    PHYSICAL FARM
         │
         ├── ESP32 Microcontroller Node
         │     ├── Capacitive Soil Moisture Sensor (ADC GPIO 34)
         │     ├── DHT22 Temperature & Humidity Sensor (GPIO 15)
         │     ├── 2.3" ST7789 Color TFT LCD (320x240 SPI)
         │     └── 2.4kHz Active Piezo Buzzer (PWM GPIO 25)
         │
         ▼
    AGRISENSE TELEMETRY & DASHBOARD
         │
         ├── Real-Time Telemetry & Alert Engine
         ├── ST7789 2.3" LCD Canvas Hardware Emulator
         ├── Web Audio API Piezo Buzzer Audio Synthesizer
         └── Dynamic SVG Trend Charts (1H, 6H, 24H, 7D, 30D)
         │
         ▼
    SATELLITE CROP INTELLIGENCE
         │
         ├── 12.4 Ha Orbital Agricultural Parcel Viewer
         ├── Spectral NDVI (Normalized Difference Vegetation Index)
         ├── MobileNetV2 (Edge Quantized) & Agronomic CNN Models
         └── 6-Stage Crop Phenology Timeline (Seeding → Harvest)
         │
         ▼
    AGRIMARKET (Voice-First Multilingual Commerce)
         │
         ├── Community Social Marketplace (Seeds, Fertilizers, Tractors)
         ├── Rental Equipment & Purchase Workflows
         ├── Sarvam AI Indic NLU Voice Assistant (KN, HI, EN, TA, TE)
         ├── Multi-Agent Orchestrator (Market, Product, Order Agents)
         ├── Human-in-the-Loop Safe Order Confirmation
         └── 5-Stage Supply Chain Logistics Stepper
```

---

## 🚀 Quick Start (Running Locally)

You can run the platform instantly using Node.js or Python without any bundlers or build steps:

### Option 1: Node.js (Recommended)
```bash
node server.js
```
The server will automatically bind to an open port (e.g. **`http://localhost:3000`** or **`http://localhost:3001`**).

### Option 2: Python
```bash
python -m http.server 8080
```
Then open your browser at **`http://localhost:8080`**.

### Option 3: Direct Browser Launch
Open `index.html` directly in any modern web browser.

---

## 📁 Complete Suite of Standalone Pages

Every section is available as both an instant SPA tab and a standalone `.html` page:

| Page | URL File | Description |
|---|---|---|
| **Platform Hub** | [`index.html`](./index.html) | Homepage with Hero, 3 Core Pillars, Architecture Flow, and Demo Tour |
| **Farm Dashboard** | [`dashboard.html`](./dashboard.html) | Real-time KPI gauges, 2.3" ST7789 LCD color display emulator, dynamic SVG charts |
| **Crop Intelligence** | [`crop-intelligence.html`](./crop-intelligence.html) | 6-stage phenology cycle (Rice, Tomato, Sugarcane) with AI foliar health prediction |
| **Satellite Analysis** | [`satellite.html`](./satellite.html) | Orbital parcel viewer with Pan, Zoom, Reset, Optical RGB, NDVI, and MobileNetV2 |
| **Alerts Center** | [`alerts.html`](./alerts.html) | Environmental warning center with recommended agronomic actions |
| **AgriMarket** | [`marketplace.html`](./marketplace.html) | Social community marketplace for seeds, fertilizers, tractor rentals, cart, and post listing |
| **AI Voice Assistant** | [`assistant.html`](./assistant.html) | Full-screen multilingual assistant with Sarvam AI Indic NLU and multi-agent trace |
| **Orders & Logistics** | [`orders.html`](./orders.html) | 5-stage real-time supply chain tracking stepper and immutable cryptographic verification hash |
| **IoT Hardware** | [`devices.html`](./devices.html) | ESP32 telemetry packet inspector, buzzer threshold tuning, and complete C++ Arduino firmware |
| **Settings & Profile** | [`settings.html`](./settings.html) | Farmer identity profile, Sarvam AI API config, MQTT broker settings, and Demo Role Switcher |

---

## 🏆 2-Minute Hackathon Demo Script (PRD §47 & §91)

The platform includes a built-in **Demo Tour Bar** at the top of the interface:

1. **Show Hardware Sensing Node**: Displays the ESP32-WROOM-32 specifications, pin mappings, and C++ Arduino firmware.
2. **Live Farm Sensor Monitoring**: View real-time soil moisture (68%), temperature (28.4°C), and humidity (74%) synced to the 2.3" color LCD canvas emulator.
3. **Trigger Moisture Alert & Buzzer**: Click *"Trigger Moisture Spike"* — soil moisture surges to 89%, the ST7789 display transitions to red warning mode, and the buzzer beeps via the Web Audio API.
4. **Crop Intelligence**: View the 6-stage phenology cycle for Paddy/Tomato with vegetative stage recommendations.
5. **Satellite Analysis**: Switch layers between optical RGB, false-color NDVI, and click *"Analyze Satellite Parcel"* to execute MobileNetV2 segmentation.
6. **AgriMarket Feed**: Browse seeds, vermicompost manure, and tractor rentals.
7. **Voice Assistant**: Click the floating mic 🎙 and say (or select) *"I need tomato seeds"*.
8. **Product Agent & Explainability**: The assistant compares prices and presents Arka Rakshak F1 with clear rationale.
9. **Safe Order Confirmation**: Review the order modal before any purchase is confirmed.
10. **Track Supply Chain**: View order `AGRI-10245` advancing through Placed → Confirmed → Processing → Dispatched → Delivered.

---

## 🛠️ Hardware Integration Details

The prototype includes the complete C++ Arduino source code inside the **ESP32 Hardware** tab (`devices.html` / `#devices`) ready to be flashed directly using the Arduino IDE or PlatformIO to an **ESP32-WROOM-32** board wired to:
- **ST7789 2.3" SPI TFT Display** (MOSI: GPIO 23, SCLK: GPIO 18, CS: GPIO 5, DC: GPIO 2, RST: GPIO 4)
- **Capacitive Soil Moisture Sensor v1.2** (Analog: GPIO 34)
- **DHT22 / SHT31 Temp & Humidity** (Data: GPIO 15)
- **Active Piezo Buzzer** (PWM: GPIO 25)
