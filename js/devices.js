/**
 * AgriSense & AgriMarket AI - Device Management & ESP32 Firmware Module
 * Displays physical hardware connection status, raw JSON packet inspector,
 * buzzer threshold tuning, and complete C++ Arduino firmware code for the ESP32 prototype.
 * Uses 100% Vector SVG Icons (Zero Emojis).
 * Matches PRD Sections 10, 11, 44, 45.
 */

class DeviceManager {
  constructor() {
    this.device = {
      id: "AGRI-ESP32-001",
      name: "Smart Farm Soil Node",
      mcu: "ESP32-WROOM-32 (Dual Core 240MHz)",
      firmware: "v2.4.1-release",
      mac: "24:6F:28:AB:D1:4E",
      display: "2.3-inch ST7789 SPI Color TFT (320x240)",
      sensors: ["Capacitive Soil Moisture v1.2", "DHT22 / SHT31 Temp & Humidity"],
      actuators: ["Active Piezo Buzzer (2.4kHz)", "Status Neopixel"],
      rssi: "-62 dBm (WiFi 4)",
      battery: "92% (Li-ion 18650 3.7V 3000mAh)"
    };
  }

  init(containerId = 'devicesContainer') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const I = window.AgriIcons || {};
    const isOnline = window.sensorEngine ? window.sensorEngine.isOnline : true;

    this.container.innerHTML = `
      <div class="devices-dashboard-grid">
        <!-- Device Overview Card -->
        <div class="card device-info-card">
          <div class="card-header-flex">
            <div>
              <h3>${this.device.id}</h3>
              <span class="device-sub text-muted small">${this.device.name} • Location: Mandya Plot 4B</span>
            </div>
            <div class="device-status-toggle-wrap">
              <span class="status-pill ${isOnline ? 'online' : 'offline'}" id="deviceStatusPill">
                ● ${isOnline ? 'Online (Live Telemetry)' : 'Offline (Last Known Data)'}
              </span>
              <button class="btn btn-sm ${isOnline ? 'btn-outline-danger' : 'btn-outline-success'}" id="btnToggleDeviceOnline">
                ${isOnline ? 'Simulate Disconnect' : 'Reconnect Hardware'}
              </button>
            </div>
          </div>

          <div class="hardware-specs-grid">
            <div class="spec-card">
              <span class="spec-label">Microcontroller</span>
              <span class="spec-value">${this.device.mcu}</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">Display Module</span>
              <span class="spec-value">${this.device.display}</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">Soil Sensor</span>
              <span class="spec-value">Capacitive Moisture v1.2 (ADC GPIO 34)</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">Temp & Humidity</span>
              <span class="spec-value">DHT22 / SHT31 (GPIO 15)</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">Buzzer Alert</span>
              <span class="spec-value">Piezo Buzzer (PWM GPIO 25)</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">Battery Level</span>
              <span class="spec-value text-success">${this.device.battery}</span>
            </div>
          </div>

          <!-- Alert Threshold Configuration (PRD Section 13) -->
          <div class="threshold-config-box">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="color: var(--primary-700);">${I.settings || ''}</span>
              <h4>Environmental Alert Threshold Configuration</h4>
            </div>
            <p class="text-muted small">Configure automated buzzer alarm triggers for low moisture, high moisture, and high humidity.</p>
            <div class="threshold-inputs-grid">
              <div class="form-group">
                <label>Low Soil Moisture Threshold (%)</label>
                <input type="number" id="threshMoistureMin" class="form-control" value="30" />
              </div>
              <div class="form-group">
                <label>High Soil Moisture Alert (%)</label>
                <input type="number" id="threshMoistureMax" class="form-control" value="85" />
              </div>
              <div class="form-group">
                <label>Max Humidity Threshold (%)</label>
                <input type="number" id="threshHumidityMax" class="form-control" value="85" />
              </div>
              <div class="form-group">
                <label>Buzzer Hardware Test</label>
                <button class="btn btn-outline" id="btnTestBuzzer">
                  ${I.volume || ''} Test Buzzer Beep
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Raw Telemetry Packet Inspector -->
        <div class="card telemetry-packet-card">
          <div class="card-header-flex">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--primary-700);">${I.satellite || ''}</span>
              <h4>Real-Time Telemetry JSON Stream (PRD Section 11)</h4>
            </div>
            <span class="badge badge-accent">MQTT / HTTP Payload</span>
          </div>
          <p class="text-muted small">Live payload received by the IoT gateway from ESP32:</p>
          <pre class="telemetry-json-code" id="rawTelemetryCode"></pre>
        </div>

        <!-- ESP32 Arduino C++ Firmware Code Card -->
        <div class="card firmware-code-card">
          <div class="card-header-flex">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--primary-700);">${I.cpu || ''}</span>
              <h4>ESP32 C++ Arduino Firmware Code</h4>
            </div>
            <button class="btn btn-sm btn-outline" id="btnCopyFirmware">Copy Firmware Code</button>
          </div>
          <p class="text-muted small">Production-ready Arduino/ESP32 sketch with Adafruit ST7789 TFT, Capacitive Soil Moisture, DHT22, and Buzzer logic.</p>
          <pre class="firmware-code-block" id="firmwareCodeDisplay"><code>${this.getArduinoCode()}</code></pre>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateTelemetryCode();
  }

  bindEvents() {
    const toggleBtn = document.getElementById('btnToggleDeviceOnline');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isOnline = !window.sensorEngine.isOnline;
        window.sensorEngine.setOnlineStatus(isOnline);
        const pill = document.getElementById('deviceStatusPill');
        if (pill) {
          pill.className = `status-pill ${isOnline ? 'online' : 'offline'}`;
          pill.textContent = isOnline ? '● Online (Live Telemetry)' : '● Offline (Last Known Data)';
        }
        toggleBtn.className = `btn btn-sm ${isOnline ? 'btn-outline-danger' : 'btn-outline-success'}`;
        toggleBtn.textContent = isOnline ? 'Simulate Disconnect' : 'Reconnect Hardware';
        this.updateTelemetryCode();
        if (window.showAgriToast) {
          window.showAgriToast(isOnline ? 'ESP32 Device Reconnected' : 'ESP32 Device Disconnected', isOnline ? 'success' : 'warning');
        }
      });
    }

    const testBuzzerBtn = document.getElementById('btnTestBuzzer');
    if (testBuzzerBtn) {
      testBuzzerBtn.addEventListener('click', () => {
        if (window.sensorEngine) {
          window.sensorEngine.playBuzzerBeep();
          if (window.showAgriToast) window.showAgriToast('Buzzer test beep triggered (2.4 kHz piezo)!', 'info');
        }
      });
    }

    const minMoist = document.getElementById('threshMoistureMin');
    const maxMoist = document.getElementById('threshMoistureMax');
    const maxHum = document.getElementById('threshHumidityMax');

    const updateThresh = () => {
      if (window.sensorEngine) {
        window.sensorEngine.thresholds.soilMoistureMin = parseFloat(minMoist.value) || 30;
        window.sensorEngine.thresholds.soilMoistureMax = parseFloat(maxMoist.value) || 85;
        window.sensorEngine.thresholds.humidityMax = parseFloat(maxHum.value) || 85;
        if (window.showAgriToast) window.showAgriToast('ESP32 thresholds updated successfully', 'success');
      }
    };

    if (minMoist) minMoist.addEventListener('change', updateThresh);
    if (maxMoist) maxMoist.addEventListener('change', updateThresh);
    if (maxHum) maxHum.addEventListener('change', updateThresh);

    const copyBtn = document.getElementById('btnCopyFirmware');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(this.getArduinoCode());
        if (window.showAgriToast) window.showAgriToast('Firmware sketch copied to clipboard!', 'success');
      });
    }

    window.addEventListener('agri:sensor-update', () => {
      this.updateTelemetryCode();
    });
  }

  updateTelemetryCode() {
    const el = document.getElementById('rawTelemetryCode');
    if (el && window.sensorEngine) {
      el.textContent = window.sensorEngine.getRawTelemetryJson();
    }
  }

  getArduinoCode() {
    return `// ========================================================
// AgriSense & AgriMarket AI - ESP32 Hardware Firmware
// Microcontroller: ESP32-WROOM-32
// Display: 2.3" ST7789 Color TFT (320x240 SPI)
// Sensors: Capacitive Soil Moisture v1.2, DHT22
// Actuator: Active Piezo Buzzer (2.4kHz)
// ========================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7789.h>
#include <DHT.h>

// PIN ASSIGNMENTS
#define TFT_CS        5
#define TFT_RST       4
#define TFT_DC        2
#define SOIL_ADC_PIN  34
#define DHT_PIN       15
#define BUZZER_PIN    25

#define DHTTYPE DHT22
DHT dht(DHT_PIN, DHTTYPE);
Adafruit_ST7789 tft = Adafruit_ST7789(TFT_CS, TFT_DC, TFT_RST);

const char* ssid = "Demo_Agri_WiFi";
const char* password = "AgriPassword123";
const char* serverEndpoint = "https://agrisense.farm/api/v1/sensors/telemetry";

// THRESHOLDS
const int SOIL_MIN_THRESHOLD = 30;
const int SOIL_MAX_THRESHOLD = 85;
const float HUMIDITY_MAX_THRESHOLD = 85.0;

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  
  dht.begin();
  tft.init(240, 320);
  tft.setRotation(1);
  tft.fillScreen(ST77XX_BLACK);
  
  tft.setTextColor(ST77XX_GREEN);
  tft.setTextSize(2);
  tft.setCursor(40, 100);
  tft.println("AGRISENSE IOT v2.4");
  delay(1500);

  WiFi.begin(ssid, password);
}

void loop() {
  int rawSoil = analogRead(SOIL_ADC_PIN);
  int soilMoisture = map(rawSoil, 3200, 1200, 0, 100);
  soilMoisture = constrain(soilMoisture, 0, 100);

  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();

  bool alert = (soilMoisture > SOIL_MAX_THRESHOLD || soilMoisture < SOIL_MIN_THRESHOLD || humidity > HUMIDITY_MAX_THRESHOLD);

  if (alert) {
    tone(BUZZER_PIN, 2400, 200);
  } else {
    noTone(BUZZER_PIN);
  }

  tft.fillScreen(alert ? ST77XX_RED : ST77XX_BLACK);
  tft.setTextColor(ST77XX_WHITE);
  tft.setTextSize(2);
  tft.setCursor(20, 20);
  tft.println(alert ? "WARNING: MOISTURE SPIKE" : "AGRISENSE MONITOR");
  
  tft.setTextSize(3);
  tft.setCursor(20, 70);
  tft.printf("Soil: %d %%\n", soilMoisture);
  tft.setCursor(20, 120);
  tft.printf("Temp: %.1f C\n", temp);
  tft.setCursor(20, 170);
  tft.printf("Hum:  %.1f %%\n", humidity);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverEndpoint);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["deviceId"] = "AGRI-ESP32-001";
    doc["soilMoisture"] = soilMoisture;
    doc["temperature"] = temp;
    doc["humidity"] = humidity;
    doc["buzzerActive"] = alert;

    String requestBody;
    serializeJson(doc, requestBody);
    http.POST(requestBody);
    http.end();
  }

  delay(3000);
}`;
  }
}

window.deviceManager = new DeviceManager();
