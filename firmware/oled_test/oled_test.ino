/*
 * =====================================================================================
 *  AgriSense - OLED Universal Auto-Pin Finder & Electrical Probe
 *  Microcontroller : ESP32-S3 N16R8
 * =====================================================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define RGB_LED_PIN 48
Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setRGB(uint8_t r, uint8_t g, uint8_t b) {
  #ifdef RGB_BUILTIN
    neopixelWrite(RGB_BUILTIN, r, g, b);
  #else
    neopixelWrite(RGB_LED_PIN, r, g, b);
  #endif
}

// Check if a specific address responds on a given SDA/SCL pin pair
bool probeI2C(int sda, int scl, uint8_t &foundAddr) {
  Wire.end();
  delay(10);
  Wire.begin(sda, scl);
  Wire.setClock(100000);

  uint8_t addrs[] = {0x3C, 0x3D};
  for (int i = 0; i < 2; i++) {
    Wire.beginTransmission(addrs[i]);
    if (Wire.endTransmission() == 0) {
      foundAddr = addrs[i];
      return true;
    }
  }
  return false;
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  setRGB(0, 0, 80); // Blue

  Serial.println("\n\n=========================================================");
  Serial.println("  AGRISENSE - OLED AUTOMATIC PIN & ELECTRICAL DETECTOR   ");
  Serial.println("=========================================================");

  // 1. Electrical Pin State Check on GPIO 8 and 9
  pinMode(8, INPUT_PULLUP);
  pinMode(9, INPUT_PULLUP);
  delay(20);

  int state8 = digitalRead(8);
  int state9 = digitalRead(9);

  Serial.println("\n[CHECK 1] ELECTRICAL VOLTAGE TEST ON PINS 8 & 9:");
  Serial.print("  GPIO 8 (Blue Wire)  : ");
  Serial.println(state8 == HIGH ? "HIGH (3.3V - Normal)" : "LOW (0V - Stuck to GND / Disconnected!)");

  Serial.print("  GPIO 9 (White Wire) : ");
  Serial.println(state9 == HIGH ? "HIGH (3.3V - Normal)" : "LOW (0V - Stuck to GND / Disconnected!)");

  if (state8 == LOW || state9 == LOW) {
    Serial.println("  --> WARNING: One of your wires is reading 0V (LOW).");
    Serial.println("      Make sure the wires are not touching GND, or try different jumper wires.");
  }

  // 2. Test Swapped (SDA=9, SCL=8) and Standard (SDA=8, SCL=9)
  Serial.println("\n[CHECK 2] TESTING PIN ORIENTATION ON PINS 8 & 9...");
  uint8_t addr = 0;

  // Test Standard: SDA=8, SCL=9
  if (probeI2C(8, 9, addr)) {
    Serial.print(">>> [SUCCESS!] Found OLED on SDA=8, SCL=9 at address 0x");
    Serial.println(addr, HEX);
    launchDisplay(8, 9, addr);
    return;
  }

  // Test Swapped: SDA=9, SCL=8
  if (probeI2C(9, 8, addr)) {
    Serial.print(">>> [SUCCESS!] Found OLED with SWAPPED wires: SDA=9, SCL=8 at address 0x");
    Serial.println(addr, HEX);
    launchDisplay(9, 8, addr);
    return;
  }

  // 3. UNIVERSAL AUTO-SCANNER ACROSS ALL PINS
  Serial.println("\n[CHECK 3] Scanning other common ESP32-S3 pin pairs...");

  // List of possible pin pairs on ESP32-S3
  const int pairs[][2] = {
    {8, 9}, {9, 8},
    {17, 18}, {18, 17},
    {46, 3}, {3, 46},
    {3, 8}, {8, 3},
    {9, 46}, {46, 9},
    {10, 11}, {11, 10},
    {1, 2}, {2, 1},
    {4, 5}, {5, 4},
    {6, 7}, {7, 6},
    {15, 16}, {16, 15},
    {19, 20}, {20, 19},
    {21, 47}, {47, 21}
  };

  int totalPairs = sizeof(pairs) / sizeof(pairs[0]);

  for (int i = 0; i < totalPairs; i++) {
    int testSDA = pairs[i][0];
    int testSCL = pairs[i][1];

    if (probeI2C(testSDA, testSCL, addr)) {
      Serial.println("\n*********************************************************");
      Serial.print(">>> [FOUND!] OLED is plugged into: SDA = GPIO ");
      Serial.print(testSDA);
      Serial.print(", SCK = GPIO ");
      Serial.print(testSCL);
      Serial.print(" (Addr: 0x");
      Serial.print(addr, HEX);
      Serial.println(") <<<");
      Serial.println("*********************************************************");
      launchDisplay(testSDA, testSCL, addr);
      return;
    }
  }

  // If still not found anywhere
  setRGB(100, 0, 0); // Solid RED
  Serial.println("\n[DIAGNOSIS] The OLED is not responding on any pins.");
  Serial.println("This means one of three physical issues:");
  Serial.println(" 1. The OLED has NO POWER:");
  Serial.println("    - Move the Yellow wire (VDD) from 5V to the '3V3' pin (top row, far right).");
  Serial.println(" 2. Loose jumper cable:");
  Serial.println("    - Swap your 4 jumper wires with fresh wires from your kit.");
  Serial.println(" 3. OLED module issue:");
  Serial.println("    - Push the female jumper headers firmly into the OLED pins.");
}

void launchDisplay(int sda, int scl, uint8_t addr) {
  setRGB(0, 80, 0); // Solid GREEN

  Wire.end();
  delay(20);
  Wire.begin(sda, scl);

  // Force hardware pixels ON
  Wire.beginTransmission(addr);
  Wire.write(0x00);
  Wire.write(0x8D);
  Wire.write(0x14);
  Wire.write(0xAF);
  Wire.write(0xA5); // All pixels ON
  Wire.endTransmission();
  delay(1000);

  // Return to normal
  Wire.beginTransmission(addr);
  Wire.write(0x00);
  Wire.write(0xA4);
  Wire.endTransmission();

  if (display.begin(SSD1306_SWITCHCAPVCC, addr)) {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(2);
    display.setCursor(8, 10);
    display.println("AGRISENSE");
    display.setTextSize(1);
    display.setCursor(8, 38);
    display.println("OLED IS WORKING!");
    display.setCursor(8, 50);
    display.print("Pins: SDA:");
    display.print(sda);
    display.print(" SCK:");
    display.println(scl);
    display.display();
  }
}

void loop() {
  delay(1000);
}
