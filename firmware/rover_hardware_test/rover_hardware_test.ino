/*
 * =====================================================================================
 *  AgriSense - Rover Sensor & Actuator Testbench (Dual Serial Port Fix)
 *  Microcontroller : ESP32-S3 N16R8
 * =====================================================================================
 *  Outputs to BOTH Serial and Serial0 so logs appear regardless of which USB port is used!
 * =====================================================================================
 */

#include <Arduino.h>

#define PIN_SOIL_ADC     1   // Soil Moisture Analog (ADC1)
#define PIN_PUMP_MOSFET  4   // IRF520 MOSFET Gate SIG
#define PIN_BUZZER       6   // Buzzer (+)
#define PIN_DHT          7   // DHT11 Signal
#define RGB_LED_PIN      48  // Onboard RGB Status LED

const int RAW_DRY = 200;
const int RAW_WET = 3200;

float temperature = NAN;
float humidity = NAN;
int rawSoil = 0;
int soilPercent = 0;
bool isSpraying = false;
unsigned long lastReadTime = 0;

void setRGB(uint8_t r, uint8_t g, uint8_t b) {
  #ifdef RGB_BUILTIN
    neopixelWrite(RGB_BUILTIN, r, g, b);
  #else
    neopixelWrite(RGB_LED_PIN, r, g, b);
  #endif
}

// Universal print to BOTH Serial (Native USB) and Serial0 (UART Chip)
void dualPrint(const String &msg) {
  Serial.print(msg);
  Serial0.print(msg);
}

void dualPrintln(const String &msg) {
  Serial.println(msg);
  Serial0.println(msg);
}

void beepBuzzer(int durationMs = 120, int freqHz = 2400) {
  tone(PIN_BUZZER, freqHz, durationMs);

  unsigned long periodUs = 1000000 / freqHz;
  unsigned long halfPeriod = periodUs / 2;
  unsigned long cycles = ((unsigned long)durationMs * 1000) / periodUs;

  for (unsigned long i = 0; i < cycles; i++) {
    digitalWrite(PIN_BUZZER, HIGH);
    delayMicroseconds(halfPeriod);
    digitalWrite(PIN_BUZZER, LOW);
    delayMicroseconds(halfPeriod);
  }
  noTone(PIN_BUZZER);

  digitalWrite(PIN_BUZZER, HIGH);
  delay(durationMs / 3);
  digitalWrite(PIN_BUZZER, LOW);
}

void triggerPump(int durationMs = 500) {
  dualPrintln(F("\n>>> [PUMP] Firing IRF520 MOSFET (GPIO 4)..."));

  setRGB(60, 0, 60); // Purple
  beepBuzzer(60, 2000);

  digitalWrite(PIN_PUMP_MOSFET, HIGH);
  isSpraying = true;

  delay(durationMs);

  digitalWrite(PIN_PUMP_MOSFET, LOW);
  isSpraying = false;

  beepBuzzer(40, 2800);
  setRGB(0, 50, 0); // Green
  dualPrintln(F(">>> [PUMP] Completed."));
}

int readSoilADC() {
  long sum = 0;
  for (int i = 0; i < 16; i++) {
    sum += analogRead(PIN_SOIL_ADC);
    delay(2);
  }
  return sum / 16;
}

bool readDHT(uint8_t pin, float &outT, float &outH) {
  uint8_t d[5] = {0, 0, 0, 0, 0};

  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
  delay(20);

  digitalWrite(pin, HIGH);
  delayMicroseconds(30);
  pinMode(pin, INPUT_PULLUP);

  unsigned long t = micros();
  while (digitalRead(pin) == HIGH) {
    if (micros() - t > 150) return false;
  }
  t = micros();
  while (digitalRead(pin) == LOW) {
    if (micros() - t > 150) return false;
  }
  t = micros();
  while (digitalRead(pin) == HIGH) {
    if (micros() - t > 150) return false;
  }

  for (int i = 0; i < 40; i++) {
    t = micros();
    while (digitalRead(pin) == LOW) {
      if (micros() - t > 120) return false;
    }
    unsigned long hStart = micros();
    while (digitalRead(pin) == HIGH) {
      if (micros() - hStart > 150) return false;
    }
    if ((micros() - hStart) > 45) {
      d[i / 8] |= (1 << (7 - (i % 8)));
    }
  }

  uint8_t chk = (d[0] + d[1] + d[2] + d[3]) & 0xFF;
  if (d[4] != chk) return false;

  outH = (float)d[0] + ((float)d[1] * 0.1f);
  outT = (float)d[2] + ((float)d[3] * 0.1f);
  return true;
}

void setup() {
  // Start BOTH serial interfaces at 115200 baud
  Serial.begin(115200);
  Serial0.begin(115200);
  delay(1000);

  setRGB(0, 50, 0); // Green = Running

  dualPrintln(F("\n\n======================================================="));
  dualPrintln(F("  AGRISENSE - ROVER HARDWARE TESTBENCH (LIVE LOGS)     "));
  dualPrintln(F("======================================================="));

  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_PUMP_MOSFET, OUTPUT);
  pinMode(PIN_SOIL_ADC, INPUT);
  pinMode(PIN_DHT, INPUT_PULLUP);

  digitalWrite(PIN_BUZZER, LOW);
  digitalWrite(PIN_PUMP_MOSFET, LOW);

  // Play double chirp
  dualPrintln(F("[BOOT] Buzzer test: Playing 2 beeps on GPIO 6..."));
  beepBuzzer(100, 2200);
  delay(80);
  beepBuzzer(120, 2800);
  dualPrintln(F("  -> Buzzer is WORKING!"));

  dualPrintln(F("\nCommands:"));
  dualPrintln(F("  Type 'B' + Enter -> Chirp Buzzer"));
  dualPrintln(F("  Type 'P' + Enter -> Fire Pump (GPIO 4)\n"));
}

void loop() {
  // Check for commands on BOTH Serial and Serial0
  char c = 0;
  if (Serial.available() > 0) c = Serial.read();
  if (Serial0.available() > 0) c = Serial0.read();

  if (c == 'B' || c == 'b') {
    dualPrintln(F("\n>>> [BUZZER] Beeping..."));
    beepBuzzer(120, 2000);
    delay(80);
    beepBuzzer(150, 2600);
    delay(80);
    beepBuzzer(200, 3200);
  } else if (c == 'P' || c == 'p') {
    triggerPump(500);
  }

  // Stream Sensor Readings Every 1.2 Seconds
  unsigned long now = millis();
  if (now - lastReadTime >= 1200) {
    lastReadTime = now;

    // Read Soil
    rawSoil = readSoilADC();
    float pct = ((float)(rawSoil - RAW_DRY) / (float)(RAW_WET - RAW_DRY)) * 100.0f;
    soilPercent = (int)constrain(pct, 0.0f, 100.0f);

    // Read DHT11
    float t, h;
    if (readDHT(PIN_DHT, t, h)) {
      temperature = t;
      humidity = h;
    }

    // Build JSON packet
    String json = "{\"soilRaw\":";
    json += rawSoil;
    json += ",\"soilPct\":";
    json += soilPercent;
    json += ",\"temp\":";
    if (!isnan(temperature)) json += String(temperature, 1); else json += "\"--\"";
    json += ",\"humidity\":";
    if (!isnan(humidity)) json += String(humidity, 1); else json += "\"--\"";
    json += ",\"pump\":";
    json += (isSpraying ? "\"ON\"" : "\"OFF\"");
    json += "}";

    dualPrintln(json);
  }
}
