#include <Arduino.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <DHT.h>

// ================= PIN DEFINITIONS =================
#define DHT_PIN         15
#define DHT_TYPE        DHT11

#define SOIL_ADC_PIN    34  // Analog Input (ADC1_CH6)

#define BUZZER_PIN      5   // Buzzer Output pin

// 2.3" / 2.4" SPI TFT Display Pins (Hardware VSPI)
#define TFT_CS          14
#define TFT_RST         4
#define TFT_DC          27
#define TFT_MOSI        23
#define TFT_SCK         18
#define TFT_MISO        19

// ================= COLOR DEFINITIONS (RGB565) =================
#define COLOR_BG          0x0862  // Very dark rich slate #0B1115
#define COLOR_HEADER      0x0185  // Deep forest green #023020
#define COLOR_CARD        0x10C4  // Sleek dark container #141A20
#define COLOR_CARD_BORDER 0x21E8  // Subtle border #223038
#define COLOR_ACCENT      0x55CB  // Neon mint #52B788
#define COLOR_GOLD        0xDD48  // Harvest gold #DDA15E
#define COLOR_CYAN        0x2D7F  // Cool sky cyan #2EC4B6
#define COLOR_WHITE       0xFFFF
#define COLOR_MUTED       0x8410  // Mid-grey #828282
#define COLOR_RED_ALERT   0xF986  // High-visibility red #FF3333
#define COLOR_WARN_ORANGE 0xFD04  // Alert orange #FFA500

Adafruit_ILI9341 tft = Adafruit_ILI9341(TFT_CS, TFT_DC, TFT_RST);
DHT dht(DHT_PIN, DHT_TYPE);

// ================= CALIBRATION & FILTER SETTINGS =================
// 2-pin resistive probe + 10kΩ pull-down on ESP32 ADC:
// In dry air: ADC reads ~50-200. In saturated water: ADC reads ~3200-3800.
const int ADC_DRY = 180;    // 0% Moisture baseline
const int ADC_WET = 3300;   // 100% Moisture saturation

// Thresholds for AgriSense Smart Farming
const int SOIL_MIN_THRESHOLD = 30;
const int SOIL_MAX_THRESHOLD = 85;
const float TEMP_MAX_THRESHOLD = 38.0;
const float HUMIDITY_MAX_THRESHOLD = 85.0;

// Filter State Variables
float filteredSoilADC = -1.0;
int displayedSoilPercent = -1;
int displayedSoilRaw = -1;

float lastTemp = -999.0;
float lastHum = -999.0;
bool lastAlarm = false;

int alertPersistenceCount = 0;  // Debounce for buzzer alarms

unsigned long lastSensorRead = 0;
unsigned long lastHeartbeat = 0;
bool heartbeatState = false;

// Multi-sample Trimmed Mean Filter (eliminates AC hum and random glitches)
float sampleFilteredSoilADC() {
  const int SAMPLES = 36;
  int buf[SAMPLES];

  // 36 samples spaced 2ms apart = 72ms sample window (covers multiple 50Hz/60Hz AC cycles)
  for (int i = 0; i < SAMPLES; i++) {
    buf[i] = analogRead(SOIL_ADC_PIN);
    delay(2);
  }

  // Sort array (Insertion Sort)
  for (int i = 1; i < SAMPLES; i++) {
    int key = buf[i];
    int j = i - 1;
    while (j >= 0 && buf[j] > key) {
      buf[j + 1] = buf[j];
      j--;
    }
    buf[j + 1] = key;
  }

  // Discard lowest 8 and highest 8 outliers, average the 20 middle samples
  long sum = 0;
  for (int i = 8; i < SAMPLES - 8; i++) {
    sum += buf[i];
  }
  return (float)sum / (SAMPLES - 16);
}

void drawStaticDashboard() {
  tft.fillScreen(COLOR_BG);

  // --- Top Navigation / Header (0 to 32px) ---
  tft.fillRect(0, 0, 320, 32, COLOR_HEADER);
  tft.drawFastHLine(0, 32, 320, COLOR_ACCENT);

  // Logo / Title
  tft.setTextColor(COLOR_WHITE);
  tft.setTextSize(2);
  tft.setCursor(10, 8);
  tft.print("AGRISENSE");

  tft.setTextColor(COLOR_ACCENT);
  tft.setTextSize(1);
  tft.setCursor(125, 13);
  tft.print("AI FARM OS v2.4");

  // Node Badge
  tft.fillRoundRect(245, 6, 68, 20, 4, 0x0320);
  tft.drawRoundRect(245, 6, 68, 20, 4, COLOR_ACCENT);
  tft.setTextColor(COLOR_ACCENT);
  tft.setCursor(252, 11);
  tft.print("PLOT-4B");

  // --- Card 1: Soil Moisture (Left Column: 8, 40, 148, 150) ---
  tft.fillRoundRect(8, 40, 148, 150, 6, COLOR_CARD);
  tft.drawRoundRect(8, 40, 148, 150, 6, COLOR_CARD_BORDER);

  tft.setTextColor(COLOR_MUTED);
  tft.setTextSize(1);
  tft.setCursor(18, 50);
  tft.print("SOIL MOISTURE");

  // Percentage unit marker
  tft.setTextColor(COLOR_MUTED);
  tft.setTextSize(2);
  tft.setCursor(118, 76);
  tft.print("%");

  // Gauge bar track
  tft.fillRoundRect(18, 120, 128, 8, 4, 0x18E3);
  tft.drawRoundRect(18, 120, 128, 8, 4, COLOR_CARD_BORDER);

  // Target indicator labels
  tft.setTextColor(0x52AA);
  tft.setTextSize(1);
  tft.setCursor(18, 132);
  tft.print("DRY");
  tft.setCursor(68, 132);
  tft.print("OPTIMAL");
  tft.setCursor(124, 132);
  tft.print("WET");

  // --- Card 2: Temperature (Right Column Top: 164, 40, 148, 70) ---
  tft.fillRoundRect(164, 40, 148, 70, 6, COLOR_CARD);
  tft.drawRoundRect(164, 40, 148, 70, 6, COLOR_CARD_BORDER);

  tft.setTextColor(COLOR_MUTED);
  tft.setTextSize(1);
  tft.setCursor(174, 48);
  tft.print("TEMPERATURE");

  tft.setTextColor(COLOR_MUTED);
  tft.setTextSize(1);
  tft.setCursor(272, 65);
  tft.print("o");
  tft.setTextSize(2);
  tft.setCursor(280, 68);
  tft.print("C");

  // --- Card 3: Air Humidity (Right Column Bottom: 164, 120, 148, 70) ---
  tft.fillRoundRect(164, 120, 148, 70, 6, COLOR_CARD);
  tft.drawRoundRect(164, 120, 148, 70, 6, COLOR_CARD_BORDER);

  tft.setTextColor(COLOR_MUTED);
  tft.setTextSize(1);
  tft.setCursor(174, 128);
  tft.print("AIR HUMIDITY");

  tft.setTextColor(COLOR_MUTED);
  tft.setTextSize(2);
  tft.setCursor(280, 148);
  tft.print("%");

  // --- Bottom Status Bar (200 to 240px) ---
  tft.fillRoundRect(8, 200, 304, 34, 6, COLOR_CARD);
  tft.drawRoundRect(8, 200, 304, 34, 6, COLOR_CARD_BORDER);

  tft.setTextColor(COLOR_MUTED);
  tft.setTextSize(1);
  tft.setCursor(18, 212);
  tft.print("STATUS:");
}

void updateDynamicMetrics(int soil, int rawSoil, float temp, float hum, bool alert) {
  // 1. Update Soil Moisture Readout with Hysteresis
  if (soil != displayedSoilPercent || abs(rawSoil - displayedSoilRaw) > 20 || alert != lastAlarm) {
    uint16_t soilColor = COLOR_ACCENT;
    const char* statusText = "OPTIMAL MOIST";
    if (soil < SOIL_MIN_THRESHOLD) {
      soilColor = COLOR_WARN_ORANGE;
      statusText = "PARCHED SOIL ";
    } else if (soil > SOIL_MAX_THRESHOLD) {
      soilColor = COLOR_RED_ALERT;
      statusText = "EXCESS WATER ";
    }

    // Number text
    tft.fillRect(18, 66, 96, 46, COLOR_CARD);
    tft.setTextColor(soilColor);
    tft.setTextSize(5);
    tft.setCursor(18, 70);
    if (soil < 10) tft.print(" ");
    tft.print(soil);

    // Progress bar fill
    int fillW = map(soil, 0, 100, 0, 124);
    fillW = constrain(fillW, 0, 124);
    tft.fillRect(20, 122, 124, 4, 0x18E3); // clear track
    tft.fillRect(20, 122, fillW, 4, soilColor);

    // Substatus tag & Raw ADC Readout
    tft.fillRect(18, 148, 128, 38, COLOR_CARD);
    
    tft.setTextColor(soilColor);
    tft.setTextSize(1);
    tft.setCursor(18, 150);
    tft.print(statusText);

    // Live ADC & Voltage debugger (shows raw sensor health)
    float volts = (rawSoil / 4095.0f) * 3.3f;
    tft.setTextColor(COLOR_MUTED);
    tft.setCursor(18, 168);
    tft.printf("ADC:%4d (%.2fV)", rawSoil, volts);

    displayedSoilPercent = soil;
    displayedSoilRaw = rawSoil;
  }

  // 2. Update Temperature
  if (abs(temp - lastTemp) >= 0.1 || alert != lastAlarm) {
    tft.fillRect(174, 64, 94, 36, COLOR_CARD);
    tft.setTextSize(4);
    tft.setTextColor(temp > TEMP_MAX_THRESHOLD ? COLOR_RED_ALERT : COLOR_GOLD);
    tft.setCursor(174, 66);
    if (!isnan(temp)) {
      tft.print(temp, 1);
    } else {
      tft.print("--.-");
    }

    // Subtext
    tft.fillRect(174, 98, 128, 10, COLOR_CARD);
    tft.setTextSize(1);
    tft.setTextColor(COLOR_MUTED);
    tft.setCursor(174, 98);
    tft.print(temp > 32.0 ? "Warm Canopy" : "Normal Field");

    lastTemp = temp;
  }

  // 3. Update Humidity
  if (abs(hum - lastHum) >= 0.1 || alert != lastAlarm) {
    tft.fillRect(174, 144, 94, 36, COLOR_CARD);
    tft.setTextSize(4);
    tft.setTextColor(hum > HUMIDITY_MAX_THRESHOLD ? COLOR_RED_ALERT : COLOR_CYAN);
    tft.setCursor(174, 146);
    if (!isnan(hum)) {
      tft.print((int)hum);
    } else {
      tft.print("--");
    }

    // Subtext
    tft.fillRect(174, 178, 128, 10, COLOR_CARD);
    tft.setTextSize(1);
    tft.setTextColor(COLOR_MUTED);
    tft.setCursor(174, 178);
    tft.print(hum > 80.0 ? "High Moisture" : "Comfort Range");

    lastHum = hum;
  }

  // 4. Update Bottom System Banner
  if (alert != lastAlarm) {
    tft.fillRect(68, 206, 236, 22, COLOR_CARD);
    tft.setTextSize(1);
    if (alert) {
      tft.fillRoundRect(68, 205, 155, 24, 4, COLOR_RED_ALERT);
      tft.setTextColor(COLOR_WHITE);
      tft.setCursor(76, 213);
      tft.print("! WARNING: SPIKE/DRY !");

      tft.setTextColor(COLOR_RED_ALERT);
      tft.setCursor(232, 213);
      tft.print("ALARM ON");
    } else {
      tft.fillRoundRect(68, 205, 140, 24, 4, 0x0320);
      tft.setTextColor(COLOR_ACCENT);
      tft.setCursor(76, 213);
      tft.print("* ALL SYSTEMS NORMAL");

      tft.setTextColor(0x52AA);
      tft.setCursor(218, 213);
      tft.print("STANDBY");
    }
    lastAlarm = alert;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Initialize Sensors
  dht.begin();
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // Initialize Display (ILI9341 320x240)
  tft.begin();
  tft.setRotation(1); // Landscape 320x240

  // Draw Initial Sleek Cockpit Dashboard
  drawStaticDashboard();

  // Startup beep
  digitalWrite(BUZZER_PIN, HIGH);
  delay(80);
  digitalWrite(BUZZER_PIN, LOW);
  delay(60);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(80);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("[AGRISENSE] Calibrated UI Ready.");
}

void loop() {
  unsigned long now = millis();

  // Heartbeat Indicator in top header (blinks every 1 second)
  if (now - lastHeartbeat >= 1000) {
    lastHeartbeat = now;
    heartbeatState = !heartbeatState;
    tft.fillCircle(232, 16, 4, heartbeatState ? COLOR_ACCENT : 0x0240);
  }

  // Sensor Sampling Loop every 1000ms
  if (now - lastSensorRead >= 1000) {
    lastSensorRead = now;

    // 1. Multi-sample Trimmed Mean ADC Sample
    float currentSample = sampleFilteredSoilADC();

    // 2. Exponential Moving Average (EMA) IIR Low-Pass Filter:
    // 82% previous weight + 18% current weight = smooth organic response
    if (filteredSoilADC < 0) {
      filteredSoilADC = currentSample;
    } else {
      filteredSoilADC = (filteredSoilADC * 0.82f) + (currentSample * 0.18f);
    }

    int rawSoil = (int)(filteredSoilADC + 0.5f);

    // 3. Calibrate raw ADC to 0-100% moisture:
    // Below ADC_DRY (180) is clamped to 0%
    // Above ADC_WET (3300) is clamped to 100%
    float soilFloat = ((filteredSoilADC - ADC_DRY) / (float)(ADC_WET - ADC_DRY)) * 100.0f;
    soilFloat = constrain(soilFloat, 0.0f, 100.0f);
    int soilPercent = (int)round(soilFloat);

    // 4. Temp & Humidity DHT11
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    // 5. Alert condition evaluation
    bool rawAlert = (soilPercent < SOIL_MIN_THRESHOLD || 
                     soilPercent > SOIL_MAX_THRESHOLD || 
                     hum > HUMIDITY_MAX_THRESHOLD);

    // Debounce / Persistence: Must be in alert condition for at least 3 consecutive cycles (3s)
    if (rawAlert) {
      if (alertPersistenceCount < 3) alertPersistenceCount++;
    } else {
      if (alertPersistenceCount > 0) alertPersistenceCount--;
    }
    bool sustainedAlert = (alertPersistenceCount >= 3);

    // Buzzer control
    if (sustainedAlert) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(40);
      digitalWrite(BUZZER_PIN, LOW);
    } else {
      digitalWrite(BUZZER_PIN, LOW);
    }

    // Refresh Display smoothly without flicker
    updateDynamicMetrics(soilPercent, rawSoil, temp, hum, sustainedAlert);

    // Transmit JSON packet over Serial for web dashboard
    Serial.print("{\"type\":\"telemetry\",\"soilRaw\":");
    Serial.print(rawSoil);
    Serial.print(",\"soilPercent\":");
    Serial.print(soilPercent);
    Serial.print(",\"temp\":");
    if (!isnan(temp)) Serial.print(temp, 1); else Serial.print("null");
    Serial.print(",\"humidity\":");
    if (!isnan(hum)) Serial.print(hum, 1); else Serial.print("null");
    Serial.print(",\"buzzer\":");
    Serial.print(sustainedAlert ? "true" : "false");
    Serial.println("}");
  }
}
