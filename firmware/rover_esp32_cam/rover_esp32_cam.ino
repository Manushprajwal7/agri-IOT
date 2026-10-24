/*
 * =====================================================================================
 *  AgriSense & AgriMarket AI - Autonomous Rover ESP32-CAM Wi-Fi Streaming Node (GC2145 Fix)
 *  Hardware: AI-Thinker ESP32-CAM + GC2145 Camera Sensor + ESP32-CAM-MB Base Plate
 * =====================================================================================
 *  GC2145 Support:
 *   - Uses PIXFORMAT_RGB565 (GC2145 does not have on-chip JPEG hardware).
 *   - Auto-converts RGB565 to JPEG in software for high-speed Wi-Fi MJPEG streaming!
 * =====================================================================================
 */

#include "esp_camera.h"
#include <WiFi.h>
#include "esp_timer.h"
#include "img_converters.h"
#include "fb_gfx.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include "esp_http_server.h"

// ================= USER WI-FI SETTINGS =================
// Put your Wi-Fi name and password here:
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// Rover Field Hotspot Fallback
const char* ap_ssid = "Agrisense-Rover-Cam";
const char* ap_password = "agrisense123";

// AI-Thinker Pin Definitions
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define FLASH_LED_PIN      4
#define STATUS_LED_PIN    33

#define PART_BOUNDARY "123456789000000000000987654321"
static const char* _STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char* _STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
static const char* _STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

httpd_handle_t camera_httpd = NULL;
bool flashState = false;
bool cameraInitialized = false;

// ---------------- STREAM HANDLER (WITH ON-THE-FLY JPEG ENCODER) ----------------
static esp_err_t stream_handler(httpd_req_t *req) {
  if (!cameraInitialized) {
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }

  camera_fb_t * fb = NULL;
  esp_err_t res = ESP_OK;
  size_t _jpg_buf_len = 0;
  uint8_t * _jpg_buf = NULL;
  char * part_buf[64];

  res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
  if (res != ESP_OK) return res;

  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  while (true) {
    fb = esp_camera_fb_get();
    if (!fb) {
      res = ESP_FAIL;
    } else {
      // If sensor output is RGB565 / YUV422 (like GC2145), convert to JPEG
      if (fb->format != PIXFORMAT_JPEG) {
        bool jpeg_converted = frame2jpg(fb, 80, &_jpg_buf, &_jpg_buf_len);
        esp_camera_fb_return(fb);
        fb = NULL;
        if (!jpeg_converted) {
          res = ESP_FAIL;
        }
      } else {
        _jpg_buf_len = fb->len;
        _jpg_buf = fb->buf;
      }
    }

    if (res == ESP_OK) {
      size_t hlen = snprintf((char *)part_buf, 64, _STREAM_PART, _jpg_buf_len);
      res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
    }
    if (res == ESP_OK) {
      res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
    }
    if (res == ESP_OK) {
      res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));
    }

    if (fb) {
      esp_camera_fb_return(fb);
      fb = NULL;
      _jpg_buf = NULL;
    } else if (_jpg_buf) {
      free(_jpg_buf);
      _jpg_buf = NULL;
    }

    if (res != ESP_OK) break;
  }

  return res;
}

// ---------------- SNAPSHOT HANDLER ----------------
static esp_err_t capture_handler(httpd_req_t *req) {
  if (!cameraInitialized) {
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }

  size_t jpg_len = 0;
  uint8_t * jpg_buf = NULL;
  bool converted = false;

  if (fb->format != PIXFORMAT_JPEG) {
    converted = frame2jpg(fb, 80, &jpg_buf, &jpg_len);
    esp_camera_fb_return(fb);
    if (!converted) {
      httpd_resp_send_500(req);
      return ESP_FAIL;
    }
  } else {
    jpg_buf = fb->buf;
    jpg_len = fb->len;
  }

  httpd_resp_set_type(req, "image/jpeg");
  httpd_resp_set_hdr(req, "Content-Disposition", "inline; filename=capture.jpg");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  esp_err_t res = httpd_resp_send(req, (const char *)jpg_buf, jpg_len);

  if (converted && jpg_buf) {
    free(jpg_buf);
  } else if (!converted && fb) {
    esp_camera_fb_return(fb);
  }
  return res;
}

// ---------------- FLASHLIGHT HANDLER ----------------
static esp_err_t flash_handler(httpd_req_t *req) {
  flashState = !flashState;
  digitalWrite(FLASH_LED_PIN, flashState ? HIGH : LOW);
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  return httpd_resp_send(req, flashState ? "{\"flash\":true}" : "{\"flash\":false}", 14);
}

// ---------------- WEB DASHBOARD ----------------
static esp_err_t index_handler(httpd_req_t *req) {
  httpd_resp_set_type(req, "text/html");
  String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AgriSense Rover Vision</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #081118; color: #fff; margin: 0; padding: 20px; text-align: center; }
    h1 { color: #52b788; font-size: 22px; margin-bottom: 4px; }
    .badge { background: #1b4332; color: #74c69d; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .card { max-width: 640px; margin: 20px auto; background: #141c24; border-radius: 12px; overflow: hidden; border: 1px solid #23303d; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
    img { width: 100%; height: auto; display: block; background: #000; min-height: 240px; }
    .btn-row { padding: 14px; display: flex; justify-content: center; gap: 10px; }
    button { background: #2d6a4f; border: none; color: #fff; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
    button:hover { background: #52b788; }
    .url { background: #0b1115; padding: 10px; font-family: monospace; color: #74c69d; font-size: 13px; margin: 0 16px 16px; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>🌾 AgriSense Rover Vision Node</h1>
  <span class="badge">GC2145 CAMERA LIVE STREAM</span>
  <div class="card">
    <img src="/stream" id="camStream" alt="Live Feed" />
    <div class="btn-row">
      <button onclick="fetch('/flash')">💡 Flashlight</button>
      <button onclick="window.open('/capture', '_blank')">📸 Snapshot</button>
      <button onclick="location.reload()">🔄 Refresh</button>
    </div>
    <div class="url" id="u">Stream: Loading...</div>
  </div>
  <script>document.getElementById('u').innerText = "Direct Stream URL: " + window.location.origin + "/stream";</script>
</body>
</html>
)rawliteral";
  return httpd_resp_send(req, html.c_str(), html.length());
}

void startCameraServer() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;

  httpd_uri_t index_uri = { .uri = "/", .method = HTTP_GET, .handler = index_handler, .user_ctx = NULL };
  httpd_uri_t stream_uri = { .uri = "/stream", .method = HTTP_GET, .handler = stream_handler, .user_ctx = NULL };
  httpd_uri_t capture_uri = { .uri = "/capture", .method = HTTP_GET, .handler = capture_handler, .user_ctx = NULL };
  httpd_uri_t flash_uri = { .uri = "/flash", .method = HTTP_GET, .handler = flash_handler, .user_ctx = NULL };

  if (httpd_start(&camera_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(camera_httpd, &index_uri);
    httpd_register_uri_handler(camera_httpd, &stream_uri);
    httpd_register_uri_handler(camera_httpd, &capture_uri);
    httpd_register_uri_handler(camera_httpd, &flash_uri);
  }
}

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // Disable brownout resets
  Serial.begin(115200);
  delay(1000);

  pinMode(FLASH_LED_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);
  digitalWrite(STATUS_LED_PIN, HIGH);

  Serial.println("\n\n=======================================================");
  Serial.println("  AGRISENSE - ESP32-CAM ROVER FIELD VISION (GC2145)    ");
  Serial.println("=======================================================");

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;

  // KEY FIX: GC2145 sensor requires RGB565 format (it does not have on-chip JPEG encoder)
  config.pixel_format = PIXFORMAT_RGB565;
  config.frame_size = FRAMESIZE_QVGA; // 320x240 (Fast conversion to JPEG)
  config.jpeg_quality = 12;
  config.fb_count = 2;

  // Initialize GC2145 Camera
  Serial.println("[STEP 1/3] Initializing GC2145 Camera Sensor (RGB565)...");
  esp_err_t err = esp_camera_init(&config);
  if (err == ESP_OK) {
    cameraInitialized = true;
    Serial.println("  -> [SUCCESS] GC2145 Camera Sensor Ready!");
    sensor_t * s = esp_camera_sensor_get();
    if (s) s->set_vflip(s, 1);
  } else {
    Serial.printf("  -> [ERROR] Camera init failed (0x%x). Retrying with YUV422...\n", err);
    config.pixel_format = PIXFORMAT_YUV422;
    err = esp_camera_init(&config);
    if (err == ESP_OK) {
      cameraInitialized = true;
      Serial.println("  -> [SUCCESS] GC2145 Camera Sensor Ready (YUV422 Mode)!");
    } else {
      Serial.printf("  -> [FATAL] Camera init failed: 0x%x\n", err);
    }
  }

  // Connect Wi-Fi
  Serial.println("[STEP 2/3] Connecting to Wi-Fi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(STATUS_LED_PIN, LOW);
    Serial.println("\n  -> [Wi-Fi Connected!]");
    Serial.print("  -> IP Address: http://");
    Serial.println(WiFi.localIP());
  } else {
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ap_ssid, ap_password);
    digitalWrite(STATUS_LED_PIN, LOW);
    Serial.println("\n  -> [Hotspot Mode Active]");
    Serial.print("  -> Connect Laptop to Wi-Fi 'Agrisense-Rover-Cam' then open: http://");
    Serial.println(WiFi.softAPIP());
  }

  // Start HTTP Server
  Serial.println("[STEP 3/3] Starting Live Stream Video Server...");
  startCameraServer();

  digitalWrite(FLASH_LED_PIN, HIGH);
  delay(100);
  digitalWrite(FLASH_LED_PIN, LOW);

  Serial.println("\n=======================================================");
  Serial.println("  ROVER VISION NODE IS LIVE!");
  Serial.print("  Open in your laptop browser: http://");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(WiFi.softAPIP());
  }
  Serial.println("=======================================================\n");
}

void loop() {
  delay(10000);
}
