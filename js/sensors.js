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

    this.isHardwareLive = false;
    this.hardwareSource = 'INITIALIZING';
    this.timer = null;

    // High Water Alert & Alternating Buzzer State
    this.isAlternatingBuzzerPlaying = false;
    this.alternatingBuzzerInterval = null;
    this.highWaterTriggered = false;

    this.init();
  }

  init() {
    this.startSimulation();
    this.startHardwareStreaming();
  }

  startHardwareStreaming() {
    const handlePacket = (data) => {
      if (!data) return;
      if (data.isLive) {
        this.isHardwareLive = true;
        this.hardwareSource = data.source || 'ESP32-HARDWARE';
        this.simulationRunning = false; // Turn off synthetic random simulation

        this.reading.soilMoisture = Number(data.soilMoisture);
        this.reading.soilRaw = data.soilRaw || 0;
        this.reading.temperature = Number(data.temperature);
        this.reading.humidity = Number(data.humidity);
        this.reading.buzzerActive = Boolean(data.buzzerActive);
        this.reading.timestamp = data.timestamp || new Date().toLocaleTimeString();

        this.evaluateStatus();

        this.liveHistory.push({
          time: this.reading.timestamp,
          moisture: this.reading.soilMoisture,
          temp: this.reading.temperature,
          humidity: this.reading.humidity
        });
        if (this.liveHistory.length > 25) this.liveHistory.shift();

        this.updateHardwareUiBadges();
        window.dispatchEvent(new CustomEvent('agri:sensor-update', { detail: this.reading }));
        this.renderLcdDisplay();
      }
    };

    // 1. SSE Stream for zero-latency real-time updates
    if (window.EventSource) {
      try {
        const sse = new EventSource('/api/v1/sensors/stream');
        sse.onmessage = (evt) => {
          try {
            const parsed = JSON.parse(evt.data);
            handlePacket(parsed);
          } catch (e) {}
        };
      } catch (e) {}
    }

    // 2. Continuous 1-second fallback poll
    const poll = async () => {
      try {
        const res = await fetch('/api/v1/sensors/telemetry?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          handlePacket(data);
        } else {
          // Direct fallback to data/live_telemetry.json
          const res2 = await fetch('/data/live_telemetry.json?t=' + Date.now());
          if (res2.ok) {
            const data2 = await res2.json();
            handlePacket(data2);
          }
        }
      } catch (err) {}
    };

    setInterval(poll, 1000);
    poll();
  }

  updateHardwareUiBadges() {
    const badges = document.querySelectorAll('.device-telemetry-badge span.badge, #deviceStatusPill, .badge-telemetry-live');
    badges.forEach(b => {
      if (this.isHardwareLive) {
        b.className = 'badge badge-success';
        b.innerHTML = '● ESP32: LIVE HARDWARE (COM3)';
        b.style.boxShadow = '0 0 10px rgba(46, 204, 113, 0.5)';
      }
    });
  }

  startSimulation() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.simulationRunning && this.isOnline && !this.isHardwareLive) {
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
        title: 'ALERT: HIGH SOIL MOISTURE (>85%)',
        value: `${value}%`,
        message: 'High water content at the field, consider turning off the water supply.',
        buzzer: true
      }
    }));
    this.renderLcdDisplay();
  }

  resetToNormal() {
    this.highWaterTriggered = false;
    this.stopAlternatingBuzzer();
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
    const isHighWater = this.reading.soilMoisture > this.thresholds.soilMoistureMax;

    if (isHighWater) {
      statusText = 'HIGH';
      envStatus = 'High water content at the field, consider turning off the water supply';
      alertActive = true;
    } else if (this.reading.soilMoisture < this.thresholds.soilMoistureMin) {
      statusText = 'LOW';
      envStatus = 'Low Moisture Alert';
      alertActive = true;
    } else if (this.reading.humidity > this.thresholds.humidityMax) {
      envStatus = 'High Humidity Alert';
      alertActive = true;
    }

    this.reading.moistureStatus = statusText;
    this.reading.environmentStatus = envStatus;
    this.reading.buzzerActive = alertActive;
    this.reading.highWaterAlert = isHighWater;

    // 10-Second Alternating Buzzer on High Water condition
    if (isHighWater) {
      if (!this.highWaterTriggered) {
        this.highWaterTriggered = true;
        if (this.buzzerAudioEnabled && this.isOnline) {
          this.startAlternatingBuzzer(10000);
        }
      }
    } else {
      this.highWaterTriggered = false;
      this.stopAlternatingBuzzer();
      if (alertActive && this.buzzerAudioEnabled && this.isOnline) {
        this.playBuzzerBeep();
      }
    }
  }

  // 10-Second Alternating Piezo Buzzer Sound for High Water Alert
  startAlternatingBuzzer(durationMs = 10000) {
    if (!this.buzzerAudioEnabled) return;
    this.stopAlternatingBuzzer();

    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtxClass();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      this.isAlternatingBuzzerPlaying = true;
      const startMs = Date.now();

      const pulseBeep = () => {
        const elapsed = Date.now() - startMs;
        if (elapsed >= durationMs || !this.isAlternatingBuzzerPlaying) {
          this.stopAlternatingBuzzer();
          this.renderLcdDisplay();
          return;
        }

        try {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          const isHighTone = Math.floor(elapsed / 250) % 2 === 0;

          osc.type = 'square';
          // Alternating frequencies: 2400 Hz and 1600 Hz
          osc.frequency.setValueAtTime(isHighTone ? 2400 : 1600, this.audioCtx.currentTime);

          gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.20);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start();
          osc.stop(this.audioCtx.currentTime + 0.22);
        } catch (e) {}
      };

      pulseBeep();
      this.alternatingBuzzerInterval = setInterval(pulseBeep, 250);
      this.renderLcdDisplay();
    } catch (err) {
      console.warn('Buzzer Web Audio API warning:', err);
    }
  }

  stopAlternatingBuzzer() {
    this.isAlternatingBuzzerPlaying = false;
    if (this.alternatingBuzzerInterval) {
      clearInterval(this.alternatingBuzzerInterval);
      this.alternatingBuzzerInterval = null;
    }
  }

  // Web Audio API Standard Piezo Buzzer Beep
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
  renderLcdDisplay(canvasId) {
    const ids = canvasId ? [canvasId] : ['esp32LcdCanvas', 'farmMonitorLcdCanvas'];
    ids.forEach(id => {
      const canvas = document.getElementById(id);
      if (canvas) this._drawLcdOnCanvas(canvas);
    });
  }

  _drawLcdOnCanvas(canvas) {
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

    const isHighWater = this.reading.soilMoisture > this.thresholds.soilMoistureMax;
    const isHighAlert = this.reading.buzzerActive || isHighWater;

    // Header Bar
    ctx.fillStyle = isHighWater ? '#b91c1c' : (isHighAlert ? '#dc2626' : '#15803d');
    ctx.fillRect(0, 0, w, 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isHighWater ? '[!] HIGH WATER ALERT [!]' : (isHighAlert ? '[!] WARNING [!]' : 'AGRISENSE IOT v2.4'), w / 2, 21);

    // Grid divider lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, 85); ctx.lineTo(w - 10, 85);
    ctx.moveTo(10, 140); ctx.lineTo(w - 10, 140);
    ctx.stroke();

    if (isHighWater) {
      // High Water Content Alert Screen Mode
      ctx.textAlign = 'center';

      // Warning subheader
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText('HIGH WATER CONTENT AT THE FIELD', w / 2, 54);

      // Value
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px "Courier New", monospace';
      ctx.fillText(`${this.reading.soilMoisture}%`, w / 2, 84);

      // Warning and advice text
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText('CONSIDER TURNING OFF', w / 2, 114);
      ctx.fillText('THE WATER SUPPLY', w / 2, 130);

      // Buzzer indicator
      const isBuzzing = this.isAlternatingBuzzerPlaying;
      ctx.fillStyle = isBuzzing ? '#ef4444' : '#94a3b8';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText(isBuzzing ? '● BUZZER: ALTERNATING (10s)' : 'BUZZER: 10s SOUND COMPLETED', w / 2, 172);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText('STATUS: WATER SUPPLY SHUTOFF NEEDED', w / 2, 202);
    } else if (isHighAlert) {
      // Alert Screen Mode
      ctx.textAlign = 'center';
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
      source: this.isHardwareLive ? 'ESP32 (COM3 / Hardware)' : 'SIMULATOR',
      timestamp: new Date().toISOString(),
      soilMoisture: this.reading.soilMoisture,
      soilRawADC: this.reading.soilRaw || 0,
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
