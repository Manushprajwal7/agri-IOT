/**
 * AgriSense & AgriMarket AI - Dashboard & Sensor Analytics Module
 * Renders real-time telemetry cards, interactive SVG charts, 2.3" LCD canvas, and active alerts.
 * Uses 100% vector SVG icons (Zero Emojis).
 * Matches PRD Sections 8, 9, 15, 16, 70, 72.
 */

class DashboardEngine {
  constructor() {
    this.selectedTimeFilter = '24H'; // 1H, 6H, 24H, 7D, 30D
    this.activeChartTab = 'moisture'; // 'moisture' | 'temp' | 'humidity'
  }

  async init(containerId = 'dashboardContainer') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const I = window.AgriIcons || {};

    this.container.innerHTML = `
      <!-- Welcome Header -->
      <div class="dashboard-header-banner">
        <div class="header-left">
          <h2 id="dashGreeting">Good Morning, Farmer</h2>
          <div class="header-meta-tags">
            <span class="meta-tag">${I.sprout || ''} Farm: <strong>Demo Plot 4B (Paddy & Horticulture)</strong></span>
            <span class="meta-tag">${I.mapPin || ''} Location: <strong>Mandya, Karnataka, India</strong></span>
            <span class="meta-tag meta-device">${I.cpu || ''} Device: <strong>AGRI-ESP32-001</strong></span>
          </div>
        </div>
        <div class="header-right">
          <div class="demo-controls-pill">
            <span class="pill-label">Demo Mode:</span>
            <button class="btn btn-sm btn-outline active" id="btnToggleSim">
              Simulation: <strong id="simStatusText">ON</strong>
            </button>
            <button class="btn btn-sm btn-warning" id="btnTriggerSpike" title="Trigger simulated high moisture alert for presentation">
              ${I.zap || ''} Trigger Moisture Spike
            </button>
            <button class="btn btn-sm btn-outline" id="btnResetNormal">${I.refresh || ''} Reset Normal</button>
          </div>
        </div>
      </div>

      <!-- KPI Sensor Cards Grid (PRD Section 9, 70) -->
      <div class="sensor-cards-grid">
        <!-- Soil Moisture Card -->
        <div class="card sensor-kpi-card" id="cardMoisture">
          <div class="kpi-header">
            <div class="kpi-title-wrap">
              <span class="kpi-icon icon-soil">${I.sprout || ''}</span>
              <span class="kpi-title">Soil Moisture</span>
            </div>
            <span class="badge badge-success" id="badgeMoisture">NORMAL</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-value-row">
              <span class="kpi-big-num" id="valMoisture">68</span>
              <span class="kpi-unit">%</span>
            </div>
            <div class="gauge-bar-bg">
              <div class="gauge-bar-fill fill-moisture" id="gaugeMoisture" style="width: 68%;"></div>
            </div>
            <div class="kpi-footer-meta">
              <span class="meta-sub">Optimal: 60 - 75%</span>
              <span class="meta-sub" id="timeMoisture">Updated: Just now</span>
            </div>
          </div>
        </div>

        <!-- Temperature Card -->
        <div class="card sensor-kpi-card" id="cardTemp">
          <div class="kpi-header">
            <div class="kpi-title-wrap">
              <span class="kpi-icon icon-temp">${I.thermometer || ''}</span>
              <span class="kpi-title">Ambient Temperature</span>
            </div>
            <span class="badge badge-success" id="badgeTemp">NORMAL</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-value-row">
              <span class="kpi-big-num" id="valTemp">28.4</span>
              <span class="kpi-unit">°C</span>
            </div>
            <div class="gauge-bar-bg">
              <div class="gauge-bar-fill fill-temp" id="gaugeTemp" style="width: 58%;"></div>
            </div>
            <div class="kpi-footer-meta">
              <span class="meta-sub">Safe Range: 18 - 35°C</span>
              <span class="meta-sub" id="timeTemp">Updated: Just now</span>
            </div>
          </div>
        </div>

        <!-- Humidity Card -->
        <div class="card sensor-kpi-card" id="cardHumidity">
          <div class="kpi-header">
            <div class="kpi-title-wrap">
              <span class="kpi-icon icon-hum">${I.wind || ''}</span>
              <span class="kpi-title">Air Humidity</span>
            </div>
            <span class="badge badge-success" id="badgeHumidity">NORMAL</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-value-row">
              <span class="kpi-big-num" id="valHumidity">74</span>
              <span class="kpi-unit">%</span>
            </div>
            <div class="gauge-bar-bg">
              <div class="gauge-bar-fill fill-humidity" id="gaugeHumidity" style="width: 74%;"></div>
            </div>
            <div class="kpi-footer-meta">
              <span class="meta-sub">Safety Limit: &lt;85%</span>
              <span class="meta-sub" id="timeHumidity">Updated: Just now</span>
            </div>
          </div>
        </div>

        <!-- Environmental & Buzzer Status Card -->
        <div class="card sensor-kpi-card" id="cardEnv">
          <div class="kpi-header">
            <div class="kpi-title-wrap">
              <span class="kpi-icon icon-buzzer">${I.volume || ''}</span>
              <span class="kpi-title">Buzzer & Hardware State</span>
            </div>
            <span class="badge badge-success" id="badgeBuzzer">BUZZER IDLE</span>
          </div>
          <div class="kpi-body">
            <div class="env-status-badge alert-normal" id="valEnvStatus">
              CONDITIONS NORMAL
            </div>
            <div class="hardware-status-row">
              <span class="hw-item">${I.cpu || ''} ESP32: <strong class="text-success">Connected</strong></span>
              <span class="hw-item">${I.dashboard || ''} 2.3" LCD: <strong class="text-success">Active</strong></span>
              <span class="hw-item">${I.volume || ''} Buzzer: <strong id="hwBuzzerText">Standby</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mid Section: Interactive Sensor History Chart + 2.3" LCD Canvas Display -->
      <div class="dashboard-mid-grid">
        <!-- Sensor History Charts (PRD Section 15) -->
        <div class="card chart-card-container">
          <div class="chart-header-row">
            <div class="chart-tabs">
              <button class="btn-chart-tab active" data-chart="moisture">Soil Moisture (%)</button>
              <button class="btn-chart-tab" data-chart="temp">Temperature (°C)</button>
              <button class="btn-chart-tab" data-chart="humidity">Humidity (%)</button>
            </div>
            <div class="chart-time-filters">
              <button class="btn-time-filter" data-time="1H">1H</button>
              <button class="btn-time-filter" data-time="6H">6H</button>
              <button class="btn-time-filter active" data-time="24H">24H</button>
              <button class="btn-time-filter" data-time="7D">7D</button>
              <button class="btn-time-filter" data-time="30D">30D</button>
            </div>
          </div>

          <div class="svg-chart-wrapper" id="svgChartWrapper">
            <!-- Dynamic SVG Chart Injected Here -->
          </div>
        </div>

        <!-- 2.3" Physical LCD Color Display Emulator (PRD Section 12) -->
        <div class="card lcd-emulator-card">
          <div class="lcd-header">
            <h4>ESP32 2.3" Color TFT Display</h4>
            <span class="badge badge-accent">ST7789 320x240</span>
          </div>
          <p class="text-muted small">Real-time pixel-by-pixel preview of the physical hardware screen on the farm.</p>
          <div class="lcd-canvas-wrapper">
            <canvas id="esp32LcdCanvas" width="320" height="240"></canvas>
          </div>
          <div class="lcd-controls-footer">
            <span class="text-muted small">Synchronized with hardware telemetry</span>
            <span class="badge badge-outline">2.4 GHz WiFi SPI</span>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Active Agronomic Alerts & Farm Overview Map -->
      <div class="dashboard-bottom-grid">
        <!-- Alerts Card (PRD Section 16) -->
        <div class="card alerts-list-card">
          <div class="card-header-flex">
            <h4>Environmental Alerts & Recommended Actions</h4>
            <span class="badge badge-warning" id="alertCountBadge">1 Active</span>
          </div>
          <div class="alerts-feed-items" id="dashboardAlertsFeed">
            <!-- Dynamic alerts -->
          </div>
        </div>

        <!-- Farm Overview Map & Crop Status (PRD Section 70, 72) -->
        <div class="card farm-map-card">
          <div class="card-header-flex">
            <h4>Farm Overview & IoT Sensor Node</h4>
            <span class="badge badge-primary">GPS: 12.5244°N, 76.8958°E</span>
          </div>
          <div class="farm-map-illustration">
            <div class="map-grid-bg">
              <div class="farm-parcel parcel-paddy">
                <span>Paddy Plot 4B (6.8 Ha)</span>
                <span class="node-blip" title="AGRI-ESP32-001 Hardware Node"></span>
              </div>
              <div class="farm-parcel parcel-tomato">
                <span>Tomato Field (3.2 Ha)</span>
              </div>
              <div class="farm-parcel parcel-canal">
                <span>Kaveri Irrigation Canal</span>
              </div>
            </div>
          </div>
          <div class="map-footer-metrics">
            <div class="map-stat">
              <span class="stat-label">Total Acreage</span>
              <span class="stat-val">12.4 Hectares</span>
            </div>
            <div class="map-stat">
              <span class="stat-label">Soil Type</span>
              <span class="stat-val">Red Loamy / Clay</span>
            </div>
            <div class="map-stat">
              <span class="stat-label">AI Crop Stage</span>
              <span class="stat-val text-success">Vegetative Tillering*</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderChart();
    this.renderAlerts();
    this.updateLiveUi(window.sensorEngine ? window.sensorEngine.reading : null);
    if (window.sensorEngine) {
      window.sensorEngine.renderLcdDisplay('esp32LcdCanvas');
    }
  }

  bindEvents() {
    window.addEventListener('agri:sensor-update', (e) => {
      this.updateLiveUi(e.detail);
      this.renderChart();
    });

    window.addEventListener('agri:sensor-alert', (e) => {
      this.addAlertItem(e.detail);
    });

    const simBtn = document.getElementById('btnToggleSim');
    const simStatusText = document.getElementById('simStatusText');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        if (window.sensorEngine) {
          const running = window.sensorEngine.toggleSimulation();
          simBtn.classList.toggle('active', running);
          if (simStatusText) simStatusText.textContent = running ? 'ON' : 'OFF';
        }
      });
    }

    const triggerSpikeBtn = document.getElementById('btnTriggerSpike');
    if (triggerSpikeBtn) {
      triggerSpikeBtn.addEventListener('click', () => {
        if (window.sensorEngine) {
          window.sensorEngine.triggerMoistureSpike(89);
        }
      });
    }

    const resetNormalBtn = document.getElementById('btnResetNormal');
    if (resetNormalBtn) {
      resetNormalBtn.addEventListener('click', () => {
        if (window.sensorEngine) {
          window.sensorEngine.resetToNormal();
          if (window.showAgriToast) window.showAgriToast('Telemetry reset to baseline normal (68% moisture)', 'success');
        }
      });
    }

    document.querySelectorAll('.btn-chart-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-chart-tab').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeChartTab = e.currentTarget.dataset.chart;
        this.renderChart();
      });
    });

    document.querySelectorAll('.btn-time-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-time-filter').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedTimeFilter = e.currentTarget.dataset.time;
        this.renderChart();
      });
    });
  }

  updateLiveUi(r) {
    if (!r) return;

    const valM = document.getElementById('valMoisture');
    const badgeM = document.getElementById('badgeMoisture');
    const gaugeM = document.getElementById('gaugeMoisture');
    if (valM) valM.textContent = r.soilMoisture;
    if (badgeM) {
      badgeM.textContent = r.moistureStatus;
      badgeM.className = `badge ${r.moistureStatus === 'NORMAL' ? 'badge-success' : 'badge-danger'}`;
    }
    if (gaugeM) gaugeM.style.width = `${Math.min(100, r.soilMoisture)}%`;

    const valT = document.getElementById('valTemp');
    const gaugeT = document.getElementById('gaugeTemp');
    if (valT) valT.textContent = r.temperature;
    if (gaugeT) gaugeT.style.width = `${Math.min(100, (r.temperature / 45) * 100)}%`;

    const valH = document.getElementById('valHumidity');
    const gaugeH = document.getElementById('gaugeHumidity');
    if (valH) valH.textContent = r.humidity;
    if (gaugeH) gaugeH.style.width = `${Math.min(100, r.humidity)}%`;

    const valEnv = document.getElementById('valEnvStatus');
    const badgeBuzzer = document.getElementById('badgeBuzzer');
    const hwBuzzerText = document.getElementById('hwBuzzerText');
    if (valEnv) {
      if (r.soilMoisture > 85) {
        valEnv.textContent = 'HIGH WATER CONTENT AT FIELD - CONSIDER TURNING OFF WATER SUPPLY';
        valEnv.className = 'env-status-badge alert-active';
      } else {
        valEnv.textContent = r.buzzerActive ? `WARNING: ${r.environmentStatus.toUpperCase()}` : `STATUS: ${r.environmentStatus.toUpperCase()}`;
        valEnv.className = `env-status-badge ${r.buzzerActive ? 'alert-active' : 'alert-normal'}`;
      }
    }
    if (badgeBuzzer) {
      if (r.soilMoisture > 85) {
        badgeBuzzer.textContent = window.sensorEngine?.isAlternatingBuzzerPlaying ? 'BUZZER ALTERNATING (10s)' : (r.buzzerActive ? 'HIGH WATER ALERT' : 'BUZZER IDLE');
        badgeBuzzer.className = 'badge badge-danger';
      } else {
        badgeBuzzer.textContent = r.buzzerActive ? 'BUZZER BEEPING' : 'BUZZER IDLE';
        badgeBuzzer.className = `badge ${r.buzzerActive ? 'badge-danger' : 'badge-success'}`;
      }
    }
    if (hwBuzzerText) {
      if (r.soilMoisture > 85) {
        hwBuzzerText.textContent = window.sensorEngine?.isAlternatingBuzzerPlaying ? 'Alternating Sound (10s)' : '10s Alarm Completed';
        hwBuzzerText.className = window.sensorEngine?.isAlternatingBuzzerPlaying ? 'text-danger' : 'text-muted';
      } else {
        hwBuzzerText.textContent = r.buzzerActive ? 'Active BEEP (2.4kHz)' : 'Standby';
        hwBuzzerText.className = r.buzzerActive ? 'text-danger' : '';
      }
    }
  }

  renderChart() {
    const wrapper = document.getElementById('svgChartWrapper');
    if (!wrapper) return;

    const dataPoints = this.getChartData();
    const w = 680;
    const h = 220;
    const pad = 40;

    const vals = dataPoints.map(d => d.val);
    const minVal = Math.floor(Math.min(...vals) * 0.9);
    const maxVal = Math.ceil(Math.max(...vals) * 1.1);

    const getX = (idx) => pad + (idx / (dataPoints.length - 1)) * (w - pad * 2);
    const getY = (v) => h - pad - ((v - minVal) / (maxVal - minVal || 1)) * (h - pad * 2);

    let pathD = `M ${getX(0)} ${getY(dataPoints[0].val)}`;
    for (let i = 1; i < dataPoints.length; i++) {
      const prevX = getX(i - 1);
      const prevY = getY(dataPoints[i - 1].val);
      const curX = getX(i);
      const curY = getY(dataPoints[i].val);
      const midX = (prevX + curX) / 2;
      pathD += ` C ${midX} ${prevY}, ${midX} ${curY}, ${curX} ${curY}`;
    }

    const areaD = `${pathD} L ${getX(dataPoints.length - 1)} ${h - pad} L ${getX(0)} ${h - pad} Z`;

    const colors = {
      moisture: { stroke: '#1e5c45', fill: 'rgba(30, 92, 69, 0.15)', unit: '%' },
      temp: { stroke: '#d97706', fill: 'rgba(217, 119, 6, 0.15)', unit: '°C' },
      humidity: { stroke: '#0284c7', fill: 'rgba(2, 132, 199, 0.15)', unit: '%' }
    };
    const c = colors[this.activeChartTab] || colors.moisture;

    wrapper.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${c.stroke}" stop-opacity="0.3" />
            <stop offset="100%" stop-color="${c.stroke}" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <line x1="${pad}" y1="${getY(minVal)}" x2="${w - pad}" y2="${getY(minVal)}" stroke="#e2e8f0" stroke-width="1" />
        <line x1="${pad}" y1="${getY((minVal + maxVal) / 2)}" x2="${w - pad}" y2="${getY((minVal + maxVal) / 2)}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />
        <line x1="${pad}" y1="${getY(maxVal)}" x2="${w - pad}" y2="${getY(maxVal)}" stroke="#e2e8f0" stroke-width="1" />

        <path d="${areaD}" fill="url(#chartGrad)" />
        <path d="${pathD}" fill="none" stroke="${c.stroke}" stroke-width="2.5" stroke-linecap="round" />

        ${dataPoints.map((d, i) => `
          <g>
            <circle cx="${getX(i)}" cy="${getY(d.val)}" r="3.5" fill="${c.stroke}" stroke="#ffffff" stroke-width="2" />
            <text x="${getX(i)}" y="${h - 15}" font-family="system-ui" font-size="10" fill="#64748b" text-anchor="middle">${d.label}</text>
          </g>
        `).join('')}

        <text x="${pad - 8}" y="${getY(maxVal) + 4}" font-family="monospace" font-size="10" fill="#64748b" text-anchor="end">${maxVal}${c.unit}</text>
        <text x="${pad - 8}" y="${getY((minVal + maxVal) / 2) + 4}" font-family="monospace" font-size="10" fill="#64748b" text-anchor="end">${Math.round((minVal + maxVal) / 2)}${c.unit}</text>
        <text x="${pad - 8}" y="${getY(minVal) + 4}" font-family="monospace" font-size="10" fill="#64748b" text-anchor="end">${minVal}${c.unit}</text>
      </svg>
    `;
  }

  getChartData() {
    const filter = this.selectedTimeFilter;
    const tab = this.activeChartTab;
    const cur = window.sensorEngine ? window.sensorEngine.reading : { soilMoisture: 68, temperature: 28.4, humidity: 74 };

    if (filter === '1H') {
      return [
        { label: '10:00', val: cur.soilMoisture - 3 },
        { label: '10:15', val: cur.soilMoisture - 2 },
        { label: '10:30', val: cur.soilMoisture - 1 },
        { label: '10:45', val: cur.soilMoisture },
        { label: 'Now', val: cur.soilMoisture }
      ];
    }

    if (filter === '6H') {
      return [
        { label: '05:00', val: tab === 'temp' ? 22 : (tab === 'humidity' ? 84 : 64) },
        { label: '06:30', val: tab === 'temp' ? 24 : (tab === 'humidity' ? 82 : 65) },
        { label: '08:00', val: tab === 'temp' ? 26 : (tab === 'humidity' ? 78 : 66) },
        { label: '09:30', val: tab === 'temp' ? 27.5 : (tab === 'humidity' ? 76 : 67) },
        { label: 'Now', val: tab === 'temp' ? cur.temperature : (tab === 'humidity' ? cur.humidity : cur.soilMoisture) }
      ];
    }

    return [
      { label: '00:00', val: tab === 'temp' ? 23.2 : (tab === 'humidity' ? 82 : 64) },
      { label: '04:00', val: tab === 'temp' ? 22.1 : (tab === 'humidity' ? 86 : 63) },
      { label: '08:00', val: tab === 'temp' ? 25.4 : (tab === 'humidity' ? 78 : 65) },
      { label: '12:00', val: tab === 'temp' ? 31.2 : (tab === 'humidity' ? 68 : 66) },
      { label: '16:00', val: tab === 'temp' ? 30.5 : (tab === 'humidity' ? 69 : 60) },
      { label: '20:00', val: tab === 'temp' ? 25.8 : (tab === 'humidity' ? 79 : 70) },
      { label: 'Now', val: tab === 'temp' ? cur.temperature : (tab === 'humidity' ? cur.humidity : cur.soilMoisture) }
    ];
  }

  async renderAlerts() {
    const feed = document.getElementById('dashboardAlertsFeed');
    if (!feed) return;
    const I = window.AgriIcons || {};

    feed.innerHTML = `
      <div class="alert-item alert-success">
        <span class="alert-item-icon">${I.check || ''}</span>
        <div class="alert-item-body">
          <div class="alert-item-header">
            <strong>System Operating Nominally</strong>
            <span class="alert-time">Just now</span>
          </div>
          <p>Sensor readings are within agronomical range for vegetative rice.</p>
        </div>
      </div>
      <div class="alert-item alert-info">
        <span class="alert-item-icon">${I.info || ''}</span>
        <div class="alert-item-body">
          <div class="alert-item-header">
            <strong>High Morning Humidity Detected</strong>
            <span class="alert-time">3 hours ago</span>
          </div>
          <p>Humidity reached 88%. Action: Keep soil aeration active to prevent leaf blast.</p>
        </div>
      </div>
    `;
  }

  addAlertItem(alert) {
    const feed = document.getElementById('dashboardAlertsFeed');
    if (!feed) return;
    const I = window.AgriIcons || {};

    const item = document.createElement('div');
    item.className = 'alert-item alert-danger new-alert-item';
    item.innerHTML = `
      <span class="alert-item-icon">${I.alertTriangle || ''}</span>
      <div class="alert-item-body">
        <div class="alert-item-header">
          <strong>${alert.title} (${alert.value})</strong>
          <span class="alert-time">Just now</span>
        </div>
        <p>${alert.message}</p>
        <span class="badge badge-danger">BUZZER TRIGGERED</span>
      </div>
    `;
    feed.prepend(item);
  }
}

window.dashboardEngine = new DashboardEngine();
