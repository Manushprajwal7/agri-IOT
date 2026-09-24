/**
 * AgriSense & AgriMarket AI - IoT Hardware & Sensor Telemetry Engine
 * Implements ESP32 simulation, 2.3" LCD Canvas Display Emulator, and Web Audio Piezo Buzzer Synth.
 * Matches PRD Sections 9-14, 44-45.
 */

class SensorEngine {
  constructor() {
    this.deviceId = "AGRI-ESP32-001";
    this.firmware = "v2.4.1-release";
    this.isOnline = true;
    this.simulationRunning = true;
    this.buzzerAudioEnabled = true;
    this.audioCtx = null;

    // Thresholds
    this.thresholds = {
      soilMoistureMin: 30,
      soilMoistureMax: 85,
      tempMax: 38,
      humidityMax: 85
    };

    // Live readings
    this.reading = {
      soilMoisture: 68,
      temperature: 28.4,
      humidity: 74,
      moistureStatus: 'NORMAL',
      environmentStatus: 'Conditions Normal',
      buzzerActive: false,
      timestamp: new Date().toLocaleTimeString()
    };

    // History for live mini-charts
    this.liveHistory = [
      { time: '10:00', moisture: 65, temp: 28.1, humidity: 73 },
      { time: '10:05', moisture: 66, temp: 28.2, humidity: 73 },
      { time: '10:10', moisture: 67, temp: 28.3, humidity: 74 },
      { time: '10:15', moisture: 68, temp: 28.4, humidity: 74 }
    ];

    this.timer = null;
    this.init();
  }

  init() {
    this.startSimulation();
  }

  startSimulation() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.simulationRunning && this.isOnline) {
        this.tick();
      }
    }, 3000);
  }

  stopSimulation() {
    this.simulationRunning = false;
  }

  toggleSimulation() {
    this.simulationRunning = !this.simulationRunning;
    window.dispatchEvent(new CustomEvent('agri:sensor-sim-toggled', { detail: this.simulationRunning }));
    return this.simulationRunning;
  }

  setOnlineStatus(online) {
    this.isOnline = online;
    window.dispatchEvent(new CustomEvent('agri:device-status-changed', {
      detail: { isOnline: this.isOnline, reading: this.reading }
    }));
    this.renderLcdDisplay();
  }

  tick() {
    // Subtle realistic drift
    const mDelta = (Math.random() - 0.48) * 1.5;
    const tDelta = (Math.random() - 0.49) * 0.3;
    const hDelta = (Math.random() - 0.49) * 0.8;

    this.reading.soilMoisture = Math.min(96, Math.max(20, Math.round((this.reading.soilMoisture + mDelta) * 10) / 10));
    this.reading.temperature = Math.min(45, Math.max(15, Math.round((this.reading.temperature + tDelta) * 10) / 10));
    this.reading.humidity = Math.min(99, Math.max(30, Math.round((this.reading.humidity + hDelta) * 10) / 10));
    this.reading.timestamp = new Date().toLocaleTimeString();

    this.evaluateStatus();

    this.liveHistory.push({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      moisture: this.reading.soilMoisture,
      temp: this.reading.temperature,
      humidity: this.reading.humidity
    });
    if (this.liveHistory.length > 20) this.liveHistory.shift();

    window.dispatchEvent(new CustomEvent('agri:sensor-update', { detail: this.reading }));
    this.renderLcdDisplay();
  }

  // Demo Trigger: Simulate an urgent moisture spike (PRD Section 47 Step 2)
  triggerMoistureSpike(value = 89) {
    this.reading.soilMoisture = value;
    this.reading.temperature = 27.5;
    this.reading.humidity = 88;
    this.reading.timestamp = new Date().toLocaleTimeString();
    this.evaluateStatus();
    window.dispatchEvent(new CustomEvent('agri:sensor-update', { detail: this.reading }));
    window.dispatchEvent(new CustomEvent('agri:sensor-alert', {
      detail: {
        type: 'HIGH_MOISTURE',
        title: 'ALERT: HIGH SOIL MOISTURE SPIKE',
        value: `${value}%`,
        message: 'Moisture exceeds 85% safety threshold. Soil saturation detected. Pause active irrigation immediately!',
        buzzer: true
      }
    }));
    this.renderLcdDisplay();
  }

  resetToNormal() {
    this.reading.soilMoisture = 68;
    this.reading.temperature = 28.4;
    this.reading.humidity = 74;
    this.evaluateStatus();
    window.dispatchEvent(new CustomEvent('agri:sensor-update', { detail: this.reading }));
    this.renderLcdDisplay();
  }

  evaluateStatus() {
    let alertActive = false;
    let statusText = 'NORMAL';
    let envStatus = 'Conditions Normal';

    if (this.reading.soilMoisture < this.thresholds.soilMoistureMin) {
      statusText = 'LOW';
      envStatus = 'Low Moisture Alert';
      alertActive = true;
    } else if (this.reading.soilMoisture > this.thresholds.soilMoistureMax) {
      statusText = 'HIGH';
      envStatus = 'HIGH MOISTURE SPIKE';
      alertActive = true;
    }

    if (this.reading.humidity > this.thresholds.humidityMax) {
      envStatus = 'High Humidity Alert';
      alertActive = true;
    }

    this.reading.moistureStatus = statusText;
    this.reading.environmentStatus = envStatus;
    this.reading.buzzerActive = alertActive;

    if (alertActive && this.buzzerAudioEnabled && this.isOnline) {
      this.playBuzzerBeep();
    }
  }

  // Web Audio API Piezo Buzzer Beep
  playBuzzerBeep() {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'square'; // Typical piezo buzz timbre
      osc.frequency.setValueAtTime(2400, this.audioCtx.currentTime); // 2.4 kHz piezo buzzer

      // Short dual beep pattern
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.16);
    } catch (e) {
      // Audio autoplay restriction before gesture
    }
  }

  // Render 2.3" ST7789 TFT Color Display Emulator on HTML Canvas (PRD Section 12)
  renderLcdDisplay(canvasId = 'esp32LcdCanvas') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Outer screen bezel & TFT glass
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    if (!this.isOnline) {
      // Offline Screen
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(0, 0, w, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Courier New, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DISCONNECTED', w / 2, 21);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 15px Courier New, monospace';
      ctx.fillText('[!] DEVICE OFFLINE', w / 2, h / 2 - 10);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Courier New, monospace';
      ctx.fillText('CHECK WIFI / POWER', w / 2, h / 2 + 15);
      return;
    }

    const isHighAlert = this.reading.buzzerActive;

    // Header Bar
    ctx.fillStyle = isHighAlert ? '#dc2626' : '#15803d';
    ctx.fillRect(0, 0, w, 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isHighAlert ? '[!] WARNING [!]' : 'AGRISENSE IOT', w / 2, 22);

    // Grid divider lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, 85); ctx.lineTo(w - 10, 85);
    ctx.moveTo(10, 140); ctx.lineTo(w - 10, 140);
    ctx.stroke();

    if (isHighAlert) {
      // Alert Screen Mode
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.fillText('HIGH MOISTURE', w / 2, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px "Courier New", monospace';
      ctx.fillText(`${this.reading.soilMoisture}%`, w / 2, 115);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText('CHECK FIELD DRAINAGE', w / 2, 165);

      ctx.fillStyle = '#fca5a5';
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText('BUZZER: ACTIVE (ON)', w / 2, 195);
    } else {
      // Normal Live Telemetry Screen Mode
      ctx.textAlign = 'left';

      // Soil Moisture
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText('SOIL MOISTURE', 16, 52);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.fillText(`${this.reading.soilMoisture}%`, 16, 76);
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(this.reading.moistureStatus, w - 16, 74);

      // Temperature & Humidity row
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fb923c';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText('TEMP', 16, 105);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText(`${this.reading.temperature}°C`, 16, 128);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText('HUMIDITY', w - 16, 105);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText(`${this.reading.humidity}%`, w - 16, 128);

      // Status Bar
      ctx.textAlign = 'center';
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText('● SYSTEM NORMAL', w / 2, 168);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText(`BAT: 92% | RSSI: -62dBm`, w / 2, 195);
    }

    // LCD Scanline subtle effect
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }
  }

  getRawTelemetryJson() {
    return JSON.stringify({
      deviceId: this.deviceId,
      timestamp: new Date().toISOString(),
      soilMoisture: this.reading.soilMoisture,
      temperature: this.reading.temperature,
      humidity: this.reading.humidity,
      moistureStatus: this.reading.moistureStatus.toLowerCase(),
      environmentStatus: this.reading.environmentStatus.toLowerCase().replace(/\s+/g, '_'),
      buzzerActive: this.reading.buzzerActive,
      battery: 92,
      firmware: this.firmware
    }, null, 2);
  }
}

window.sensorEngine = new SensorEngine();
