/**
 * AgriSense & AgriMarket AI - Master Application Controller (Comprehensive)
 * Implements all 10 Core Views, Authentication/Role Switcher, Sustainability Dashboard,
 * Alerts Management, Settings & Profile, and Localization.
 * Uses 100% Vector SVG Icons (Zero Emojis).
 * Matches PRD Sections 5, 6, 16, 30, 42, 43, 61-63, 78, 84, 85.
 */

class AgriApp {
  constructor() {
    this.currentView = 'dashboard';
    this.currentLanguage = 'en';
    this.translations = {};
    this.currentUser = null;
  }

  async init() {
    this.currentUser = window.agriApi.getCurrentUser();
    await this.loadTranslations();
    this.bindGlobalNavigation();
    this.bindLocalization();
    this.bindToastManager();
    this.bindUserAuthSwitcher();

    const hash = window.location.hash.replace('#', '') || window.INITIAL_PAGE_VIEW;
    const validViews = ['dashboard', 'farm-monitor', 'crop', 'satellite', 'alerts', 'marketplace', 'assistant', 'orders', 'devices', 'settings', 'sustainability', 'supplier', 'admin'];

    if (hash && validViews.includes(hash)) {
      this.switchView(hash);
    } else {
      this.switchView('dashboard');
    }

    if (window.demoRunner) {
      window.demoRunner.init('demoTourContainer');
    }

    if (window.aiAssistant) {
      window.aiAssistant.init('aiAssistantContainer');
    }

    this.updateUserBadgeUi();
  }

  async loadTranslations() {
    try {
      const res = await fetch('data/translations.json');
      this.translations = await res.json();
    } catch (e) {
      console.warn('Could not load translations:', e);
    }
  }

  bindGlobalNavigation() {
    document.querySelectorAll('[data-nav-view]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = e.currentTarget.dataset.navView;
        this.switchView(view);
      });
    });

    const hamburger = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('appSidebar');
    if (hamburger && sidebar) {
      hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    const reopenDemo = document.getElementById('btnNavbarDemoTour');
    if (reopenDemo) {
      reopenDemo.addEventListener('click', () => {
        const bar = document.getElementById('demoRunnerBar');
        if (bar) bar.style.display = 'flex';
      });
    }

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== this.currentView) {
        this.switchView(hash);
      }
    });
  }

  switchView(viewName) {
    this.currentView = viewName;
    window.location.hash = viewName;

    document.querySelectorAll('[data-nav-view]').forEach(item => {
      item.classList.toggle('active', item.dataset.navView === viewName);
    });

    document.querySelectorAll('.app-view-container').forEach(v => {
      v.style.display = 'none';
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.style.display = 'block';
    }

    const sidebar = document.getElementById('appSidebar');
    if (sidebar) sidebar.classList.remove('open');

    switch (viewName) {
      case 'dashboard':
        if (window.dashboardEngine && !targetView.dataset.initialized) {
          window.dashboardEngine.init('dashboardContainer');
          targetView.dataset.initialized = 'true';
        }
        if (window.sensorEngine) window.sensorEngine.renderLcdDisplay('esp32LcdCanvas');
        break;

      case 'farm-monitor':
        this.renderFarmMonitorWorkbench();
        break;

      case 'crop':
        if (window.cropIntelligence) {
          window.cropIntelligence.renderTimeline('cropTimelineContainer');
        }
        break;

      case 'satellite':
        if (window.satelliteViewer && !targetView.dataset.initialized) {
          window.satelliteViewer.init('satViewerContainer');
          targetView.dataset.initialized = 'true';
        }
        break;

      case 'alerts':
        this.renderAlertsCenter();
        break;

      case 'marketplace':
        if (window.agriMarket && !targetView.dataset.initialized) {
          window.agriMarket.init('marketplaceContainer');
          targetView.dataset.initialized = 'true';
        }
        break;

      case 'assistant':
        this.renderAssistantPageView();
        break;

      case 'orders':
        if (window.ordersEngine && !targetView.dataset.initialized) {
          window.ordersEngine.init('ordersContainer');
          targetView.dataset.initialized = 'true';
        }
        break;

      case 'devices':
        if (window.deviceManager && !targetView.dataset.initialized) {
          window.deviceManager.init('devicesContainer');
          targetView.dataset.initialized = 'true';
        }
        break;

      case 'settings':
        this.renderSettingsAndProfile();
        break;

      case 'sustainability':
        this.renderSustainabilityDashboard();
        break;

      case 'supplier':
        this.renderSupplierMetrics();
        break;

      case 'admin':
        this.renderAdminMetrics();
        break;
    }
  }

  renderFarmMonitorWorkbench() {
    const container = document.getElementById('farmMonitorContainer');
    if (!container) return;

    const I = window.AgriIcons || {};
    const r = window.sensorEngine ? window.sensorEngine.reading : { soilMoisture: 68, temperature: 28.4, humidity: 74 };

    container.innerHTML = `
      <div class="farm-monitor-workbench">
        <div class="card" style="margin-bottom: 20px;">
          <div class="card-header-flex">
            <div>
              <h3>IoT Farm Sensor Telemetry Node</h3>
              <span class="text-muted small">Live sampling every 3 seconds from ESP32 ADC & GPIO channels</span>
            </div>
            <div class="demo-controls-pill">
              <button class="btn btn-sm btn-outline active" onclick="window.sensorEngine.toggleSimulation()">
                Simulation: <strong>${window.sensorEngine?.simulationRunning ? 'ON' : 'OFF'}</strong>
              </button>
              <button class="btn btn-sm btn-warning" onclick="window.sensorEngine.triggerMoistureSpike(91)">
                ${I.zap || ''} Canal Surge (91% Moisture)
              </button>
              <button class="btn btn-sm btn-outline" onclick="window.sensorEngine.resetToNormal()">
                ${I.refresh || ''} Baseline
              </button>
            </div>
          </div>

          <div class="sensor-cards-grid">
            <div class="card">
              <span class="kpi-title">Soil Moisture Sensor</span>
              <div class="kpi-value-row">
                <span class="kpi-big-num">${r.soilMoisture}</span>
                <span class="kpi-unit">%</span>
              </div>
              <span class="badge ${r.soilMoisture > 85 ? 'badge-danger' : 'badge-success'}">${r.moistureStatus}</span>
              <p class="small text-muted" style="margin-top: 8px;">Capacitive Analog Channel ADC1_CH0 (GPIO 34)</p>
            </div>

            <div class="card">
              <span class="kpi-title">Air Temperature Sensor</span>
              <div class="kpi-value-row">
                <span class="kpi-big-num">${r.temperature}</span>
                <span class="kpi-unit">°C</span>
              </div>
              <span class="badge badge-success">NORMAL</span>
              <p class="small text-muted" style="margin-top: 8px;">DHT22 Calibrated Digital 1-Wire (GPIO 15)</p>
            </div>

            <div class="card">
              <span class="kpi-title">Relative Humidity</span>
              <div class="kpi-value-row">
                <span class="kpi-big-num">${r.humidity}</span>
                <span class="kpi-unit">%</span>
              </div>
              <span class="badge badge-success">NORMAL</span>
              <p class="small text-muted" style="margin-top: 8px;">RH Range 0-100% ±2% Accuracy</p>
            </div>

            <div class="card">
              <span class="kpi-title">Piezo Buzzer Status</span>
              <div class="kpi-value-row">
                <span class="kpi-big-num" style="font-size: 22px; color: ${r.buzzerActive ? '#dc2626' : '#15803d'}">
                  ${r.buzzerActive ? 'ACTIVE BEEP' : 'STANDBY'}
                </span>
              </div>
              <span class="badge ${r.buzzerActive ? 'badge-danger' : 'badge-primary'}">PWM 2400Hz</span>
              <p class="small text-muted" style="margin-top: 8px;">Automated threshold hardware trip</p>
            </div>
          </div>
        </div>

        <div class="dashboard-mid-grid">
          <div class="card">
            <h4>Live Telemetry Packet Log (Last 10 frames)</h4>
            <div id="liveFramesLog" class="telemetry-json-code" style="max-height: 260px;">
              ${this.getRecentFramesLog()}
            </div>
          </div>
          <div class="card lcd-emulator-card">
            <h4>ESP32 ST7789 2.3" Screen</h4>
            <div class="lcd-canvas-wrapper">
              <canvas id="farmMonitorLcdCanvas" width="320" height="240"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.sensorEngine) {
      window.sensorEngine.renderLcdDisplay('farmMonitorLcdCanvas');
    }
  }

  getRecentFramesLog() {
    const cur = window.sensorEngine ? window.sensorEngine.reading : { soilMoisture: 68, temperature: 28.4, humidity: 74 };
    return `[FRAME #1048] Soil: ${cur.soilMoisture}% | Temp: ${cur.temperature}°C | Humidity: ${cur.humidity}% | Buzzer: ${cur.buzzerActive ? 'ON' : 'OFF'}
[FRAME #1047] Soil: 67.8% | Temp: 28.3°C | Humidity: 73.9% | Status: OK
[FRAME #1046] Soil: 67.4% | Temp: 28.2°C | Humidity: 73.8% | Status: OK
[FRAME #1045] Soil: 67.1% | Temp: 28.1°C | Humidity: 73.5% | Status: OK
[FRAME #1044] Soil: 66.8% | Temp: 28.0°C | Humidity: 73.2% | Status: OK
[FRAME #1043] Soil: 66.5% | Temp: 27.9°C | Humidity: 73.0% | Status: OK`;
  }

  renderAlertsCenter() {
    const container = document.getElementById('alertsContainer');
    if (!container) return;
    const I = window.AgriIcons || {};

    container.innerHTML = `
      <div class="alerts-center-page">
        <div class="card" style="margin-bottom: 24px;">
          <div class="card-header-flex">
            <div>
              <h3>Environmental Alerts & Agricultural Warning Center</h3>
              <span class="text-muted small">Real-time alerts triggered by farm telemetry sensors and AI crop diagnostics</span>
            </div>
            <div class="alert-filter-pills" style="display: flex; gap: 8px;">
              <button class="btn btn-sm btn-outline active">All Alerts (4)</button>
              <button class="btn btn-sm btn-outline">Critical (1)</button>
              <button class="btn btn-sm btn-outline">Warnings (1)</button>
              <button class="btn btn-sm btn-outline">Info (2)</button>
            </div>
          </div>

          <div class="alerts-detailed-list">
            <div class="alert-card-detailed alert-danger">
              <div class="alert-icon-col" style="color: var(--status-critical);">${I.alertTriangle || ''}</div>
              <div class="alert-content-col">
                <div class="alert-title-row">
                  <h4>High Soil Moisture Warning (89%)</h4>
                  <span class="badge badge-danger">CRITICAL SPIKE</span>
                  <span class="text-muted small">12 minutes ago</span>
                </div>
                <p>Sensor detected severe saturation at Plot 4B (Paddy Nursery). Root rot risk if stagnant water persists for &gt; 4 hours.</p>
                <div class="alert-action-box">
                  <strong>Recommended Agronomic Action:</strong> Shut off main lateral canal intake sluice. Inspect drainage trench at southern border.
                </div>
              </div>
            </div>

            <div class="alert-card-detailed alert-warning">
              <div class="alert-icon-col" style="color: var(--status-warning);">${I.zap || ''}</div>
              <div class="alert-content-col">
                <div class="alert-title-row">
                  <h4>High Air Humidity Detected (88%)</h4>
                  <span class="badge badge-warning">WEATHER WARNING</span>
                  <span class="text-muted small">3 hours ago</span>
                </div>
                <p>Pre-monsoon humidity combined with 28°C temperature creates favorable conditions for fungal blast (Magnaporthe oryzae).</p>
                <div class="alert-action-box">
                  <strong>Recommended Agronomic Action:</strong> Spray cold-pressed Neem Oil bio-pesticide (10,000 PPM) as prophylactic foliar coat.
                </div>
              </div>
            </div>

            <div class="alert-card-detailed alert-info">
              <div class="alert-icon-col" style="color: var(--accent-blue);">${I.satellite || ''}</div>
              <div class="alert-content-col">
                <div class="alert-title-row">
                  <h4>Satellite Tile Updated (SpaceNet Mandya-4B)</h4>
                  <span class="badge badge-accent">AI INTELLIGENCE</span>
                  <span class="text-muted small">Yesterday, 04:30 PM</span>
                </div>
                <p>New cloud-free optical satellite pass processed by MobileNetV2. Vegetative stage confirmed at 87% model confidence.</p>
                <div class="alert-action-box">
                  <strong>Recommended Agronomic Action:</strong> Proceed with second top-dress urea fertigation cycle during active tillering.
                </div>
              </div>
            </div>

            <div class="alert-card-detailed alert-success">
              <div class="alert-icon-col" style="color: var(--status-normal);">${I.check || ''}</div>
              <div class="alert-content-col">
                <div class="alert-title-row">
                  <h4>ESP32 Telemetry Resumed Nominally</h4>
                  <span class="badge badge-success">RESOLVED</span>
                  <span class="text-muted small">Yesterday, 08:00 AM</span>
                </div>
                <p>Wireless packet RSSI stabilized at -62 dBm following Wi-Fi gateway reconnect.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderAssistantPageView() {
    const container = document.getElementById('assistantPageContainer');
    if (!container) return;
    const I = window.AgriIcons || {};

    container.innerHTML = `
      <div class="assistant-page-layout card">
        <div class="assistant-page-header">
          <div class="header-info">
            <h2>AI Voice-First Agricultural Assistant</h2>
            <p class="text-muted small">Powered by Sarvam AI Indic NLU and Multi-Agent Orchestrator. Speak naturally in your native language.</p>
          </div>
          <div class="assistant-lang-badge">
            <span style="font-size: 12px; margin-right: 6px;">Language:</span>
            <select class="form-select-sm" id="pageAssistantLangSelect" onchange="window.aiAssistant.setLanguage(this.value)">
              <option value="en">English (India)</option>
              <option value="kn" selected>ಕನ್ನಡ (Kannada)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>
        </div>

        <div class="assistant-page-content-grid">
          <div class="assistant-main-chat-pane">
            <div class="ai-conversation-stream" id="pageChatStream" style="height: 420px;">
              <div class="ai-msg msg-assistant">
                <div class="msg-avatar">${I.bot || ''}</div>
                <div class="msg-bubble">
                  <p><strong>Namaskara!</strong> I am your agricultural AI assistant. You can speak or type in Kannada, Hindi, English, Tamil, or Telugu.</p>
                  <p>Ask me about soil moisture, pest diagnosis, tomato seeds, or tractor rentals.</p>
                  <div class="quick-prompts">
                    <button class="btn-prompt-chip" onclick="window.aiAssistant.processUserText('I need tomato seeds')">"I need tomato seeds"</button>
                    <button class="btn-prompt-chip" onclick="window.aiAssistant.processUserText('Show tractor for rent')">"Show tractor for rent"</button>
                    <button class="btn-prompt-chip" onclick="window.aiAssistant.processUserText('Check my soil moisture')">"Check my soil moisture"</button>
                    <button class="btn-prompt-chip" onclick="window.aiAssistant.processUserText('What is the cheapest fertilizer?')">"Cheapest fertilizer"</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="ai-input-bar">
              <button class="btn-mic-main" id="btnPageAiMic" onclick="window.aiAssistant.toggleVoiceListen()">
                ${I.mic || ''}
              </button>
              <input type="text" id="pageAiTextInput" class="ai-text-input" placeholder="Speak in your language, or type agricultural query here..." />
              <button class="btn-send-ai" onclick="const input = document.getElementById('pageAiTextInput'); if(input.value.trim()){ window.aiAssistant.processUserText(input.value.trim()); input.value=''; }">
                Send
              </button>
            </div>
          </div>

          <div class="assistant-side-pane">
            <h4>Multi-Agent Architecture</h4>
            <div class="agent-architecture-cards">
              <div class="arch-card">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="color: var(--primary-700);">${I.cpu || ''}</span>
                  <strong>Orchestrator</strong>
                </div>
                <span class="small text-muted">Sarvam AI NLU Intent Detection</span>
              </div>
              <div class="arch-card">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="color: var(--primary-700);">${I.search || ''}</span>
                  <strong>Marketplace Agent</strong>
                </div>
                <span class="small text-muted">Tool: search_products() & filter</span>
              </div>
              <div class="arch-card">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="color: var(--primary-700);">${I.sprout || ''}</span>
                  <strong>Product Agent</strong>
                </div>
                <span class="small text-muted">Tool: compare_products() & explain</span>
              </div>
              <div class="arch-card">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="color: var(--primary-700);">${I.orders || ''}</span>
                  <strong>Order Agent</strong>
                </div>
                <span class="small text-muted">Human-in-the-loop safety validation</span>
              </div>
            </div>

            <h4 style="margin-top: 18px;">Safety Protocol</h4>
            <div class="safety-info-card">
              <p class="small text-muted">AI will NEVER place orders automatically. Every purchase requires direct human verification of product, price, and quantity.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderSustainabilityDashboard() {
    const container = document.getElementById('sustainabilityContainer');
    if (!container) return;
    const I = window.AgriIcons || {};

    const metrics = window.agriApi.getSustainabilityMetrics();

    container.innerHTML = `
      <div class="sustainability-dashboard">
        <div class="card" style="margin-bottom: 24px;">
          <div class="card-header-flex">
            <div>
              <h3>Farm Sustainability & Climate Impact Dashboard</h3>
              <span class="text-muted small">Metrics calculated from IoT automated irrigation scheduling and precision crop intelligence</span>
            </div>
            <span class="badge badge-success badge-lg">${I.sprout || ''} Certified Sustainable Practice</span>
          </div>

          <div class="sensor-cards-grid">
            <div class="card">
              <span class="kpi-title">Water Conserved via IoT</span>
              <div class="kpi-value-row">
                <span class="kpi-big-num text-primary">142,000</span>
                <span class="kpi-unit">Liters</span>
              </div>
              <span class="text-success small">↑ 28% efficiency vs flood irrigation</span>
            </div>

            <div class="card">
              <span class="kpi-title">Runoff Fertilizer Prevented</span>
              <div class="kpi-value-row">
                <span class="kpi-big-num text-success">340</span>
                <span class="kpi-unit">kg NPK</span>
              </div>
              <span class="text-muted small">Protects groundwater & Kaveri canal</span>
            </div>

            <div class="card">
              <span class="kpi-title">Diesel Fuel Saved</span>
              <div class="kpi-value-row">
                <span class="kpi-big-num text-accent">85</span>
                <span class="kpi-unit">Liters</span>
              </div>
              <span class="text-muted small">Optimized tractor routing & rental</span>
            </div>

            <div class="card">
              <span class="kpi-title">Carbon Offset Equivalent</span>
              <div class="kpi-value-row">
                <span class="kpi-big-num text-primary">520</span>
                <span class="kpi-unit">kg CO₂e</span>
              </div>
              <span class="text-success small">Verified seasonal carbon balance</span>
            </div>
          </div>
        </div>

        <div class="dashboard-mid-grid">
          <div class="card">
            <h4>Sustainable Precision Irrigation Schedule</h4>
            <p class="text-muted small">AI-computed soil water deficit based on capacitive sensor and satellite evapotranspiration:</p>
            <table class="table-compact" style="margin-top: 14px;">
              <thead>
                <tr>
                  <th>Field Zone</th>
                  <th>Current Moisture</th>
                  <th>Target Moisture</th>
                  <th>Scheduled Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Paddy Nursery (4B-1)</strong></td>
                  <td>68%</td>
                  <td>65%</td>
                  <td><span class="badge badge-success">Irrigation Paused</span></td>
                </tr>
                <tr>
                  <td><strong>Tomato Plot (4B-2)</strong></td>
                  <td>61%</td>
                  <td>60%</td>
                  <td><span class="badge badge-success">Adequate Moisture</span></td>
                </tr>
                <tr>
                  <td><strong>Sugarcane Ridge (4B-3)</strong></td>
                  <td>70%</td>
                  <td>70%</td>
                  <td><span class="badge badge-success">Nominal</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="card">
            <h4>Soil Organic Carbon & Health</h4>
            <div style="text-align: center; padding: 20px 0;">
              <span style="font-size: 44px; font-weight: 800; color: #15803d;">88 / 100</span>
              <p class="text-muted small">High Bio-Active Microbial Diversity Index</p>
            </div>
            <p class="small text-muted">Enhanced by vermicompost bio-enrichment and zero over-irrigation leaching.</p>
          </div>
        </div>
      </div>
    `;
  }

  renderSettingsAndProfile() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    const I = window.AgriIcons || {};

    const u = this.currentUser || {};
    const s = window.agriApi.getSettings();

    container.innerHTML = `
      <div class="settings-profile-layout">
        <div class="card" style="margin-bottom: 24px;">
          <div class="card-header-flex">
            <div>
              <h3>Farmer Profile & Account Settings (PRD §43)</h3>
              <span class="text-muted small">Registered agricultural identity and connected IoT hardware profile</span>
            </div>
            <button class="btn btn-primary" id="btnOpenRoleSwitcherModal">
              ${I.refresh || ''} Switch Demo Role
            </button>
          </div>

          <div class="profile-info-grid">
            <div class="form-group col">
              <label>Farmer Full Name</label>
              <input type="text" id="profName" class="form-control" value="${u.name || 'Ramesh Kumar'}" />
            </div>
            <div class="form-group col">
              <label>Farm Location</label>
              <input type="text" id="profLoc" class="form-control" value="${u.location || 'Mandya, Karnataka'}" />
            </div>
            <div class="form-group col">
              <label>Connected IoT Node</label>
              <input type="text" id="profDevice" class="form-control" value="${u.device || 'AGRI-ESP32-001'}" readonly />
            </div>
          </div>
        </div>

        <div class="card">
          <h4>Platform Configuration & Sarvam AI Integration (PRD §64)</h4>
          <p class="text-muted small">API endpoints and threshold configurations for edge hardware and AI services:</p>

          <form id="settingsForm" style="margin-top: 16px;">
            <div class="form-row">
              <div class="form-group col">
                <label>Sarvam AI Indic NLU Endpoint</label>
                <input type="text" name="sarvamEndpoint" class="form-control" value="${s.sarvamEndpoint || ''}" />
              </div>
              <div class="form-group col">
                <label>Default Indic Voice Accent</label>
                <select name="sarvamVoiceLang" class="form-select">
                  <option value="kn-IN" ${s.sarvamVoiceLang === 'kn-IN' ? 'selected' : ''}>Kannada (kn-IN)</option>
                  <option value="hi-IN" ${s.sarvamVoiceLang === 'hi-IN' ? 'selected' : ''}>Hindi (hi-IN)</option>
                  <option value="en-IN" ${s.sarvamVoiceLang === 'en-IN' ? 'selected' : ''}>English India (en-IN)</option>
                  <option value="ta-IN" ${s.sarvamVoiceLang === 'ta-IN' ? 'selected' : ''}>Tamil (ta-IN)</option>
                  <option value="te-IN" ${s.sarvamVoiceLang === 'te-IN' ? 'selected' : ''}>Telugu (te-IN)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col">
                <label>IoT MQTT Broker WebSocket URL</label>
                <input type="text" name="mqttBrokerUrl" class="form-control" value="${s.mqttBrokerUrl || ''}" />
              </div>
              <div class="form-group col">
                <label>Telemetry PubSub Topic</label>
                <input type="text" name="deviceTelemetryTopic" class="form-control" value="${s.deviceTelemetryTopic || ''}" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col">
                <label>High Soil Moisture Buzzer Trip (%)</label>
                <input type="number" name="highMoistureThreshold" class="form-control" value="${s.highMoistureThreshold || 85}" />
              </div>
              <div class="form-group col">
                <label>Low Soil Moisture Alert (%)</label>
                <input type="number" name="lowMoistureThreshold" class="form-control" value="${s.lowMoistureThreshold || 30}" />
              </div>
              <div class="form-group col">
                <label>Max Air Humidity (%)</label>
                <input type="number" name="highHumidityThreshold" class="form-control" value="${s.highHumidityThreshold || 85}" />
              </div>
            </div>

            <div class="form-actions" style="margin-top: 14px;">
              <button type="submit" class="btn btn-primary">${I.check || ''} Save Platform Settings</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const form = document.getElementById('settingsForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const updated = {
          sarvamEndpoint: fd.get('sarvamEndpoint'),
          sarvamVoiceLang: fd.get('sarvamVoiceLang'),
          mqttBrokerUrl: fd.get('mqttBrokerUrl'),
          deviceTelemetryTopic: fd.get('deviceTelemetryTopic'),
          highMoistureThreshold: parseFloat(fd.get('highMoistureThreshold')),
          lowMoistureThreshold: parseFloat(fd.get('lowMoistureThreshold')),
          highHumidityThreshold: parseFloat(fd.get('highHumidityThreshold'))
        };
        window.agriApi.saveSettings(updated);
        this.showToast('Settings updated successfully!', 'success');
      });
    }

    const switchBtn = document.getElementById('btnOpenRoleSwitcherModal');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        this.openRoleSwitcherModal();
      });
    }
  }

  bindUserAuthSwitcher() {
    window.addEventListener('agri:user-changed', (e) => {
      this.currentUser = e.detail;
      this.updateUserBadgeUi();
      this.showToast(`Switched active profile to: ${this.currentUser.name}`, 'info');
    });
  }

  updateUserBadgeUi() {
    const u = this.currentUser || {};
    const nameEl = document.querySelector('.user-name');
    const roleEl = document.querySelector('.user-role');

    if (nameEl) nameEl.textContent = u.name || 'Demo Farmer';
    if (roleEl) roleEl.textContent = u.location || 'Mandya, Karnataka';
  }

  openRoleSwitcherModal() {
    const I = window.AgriIcons || {};
    let modal = document.getElementById('authRoleModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'authRoleModal';
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h4>Switch Demo User Role (PRD §63)</h4>
            <button class="modal-close-btn" onclick="document.getElementById('authRoleModal').style.display='none'">${I.close || '✕'}</button>
          </div>
          <div class="modal-body">
            <p class="text-muted small">Choose an identity to experience the platform from different perspectives:</p>
            <div class="role-selector-cards" style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px;">
              <button class="btn btn-outline role-select-btn" onclick="window.agriApp.selectRole('farmer')">
                <span style="display: flex; align-items: center; gap: 10px;">${I.user || ''} Continue as <strong>Farmer</strong> (Ramesh Kumar - Mandya)</span>
              </button>
              <button class="btn btn-outline role-select-btn" onclick="window.agriApp.selectRole('supplier')">
                <span style="display: flex; align-items: center; gap: 10px;">${I.store || ''} Continue as <strong>Agricultural Supplier</strong> (Rajesh Farm Supplies)</span>
              </button>
              <button class="btn btn-outline role-select-btn" onclick="window.agriApp.selectRole('equipment_owner')">
                <span style="display: flex; align-items: center; gap: 10px;">${I.tractor || ''} Continue as <strong>Equipment Owner</strong> (GreenField Rentals)</span>
              </button>
              <button class="btn btn-outline role-select-btn" onclick="window.agriApp.selectRole('admin')">
                <span style="display: flex; align-items: center; gap: 10px;">${I.shield || ''} Continue as <strong>System Administrator</strong></span>
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
  }

  async selectRole(role) {
    const users = await window.agriApi.getUsers();
    const found = users.find(u => u.role === role) || users[0];
    window.agriApi.setCurrentUser(found);
    const modal = document.getElementById('authRoleModal');
    if (modal) modal.style.display = 'none';

    if (role === 'supplier') {
      this.switchView('supplier');
    } else if (role === 'admin') {
      this.switchView('admin');
    } else {
      this.switchView('dashboard');
    }
  }

  bindLocalization() {
    const langSelect = document.getElementById('globalLangSelect');
    if (!langSelect) return;

    langSelect.addEventListener('change', (e) => {
      this.currentLanguage = e.target.value;
      if (window.aiAssistant) {
        window.aiAssistant.setLanguage(this.currentLanguage);
      }
      this.applyTranslations();
      this.showToast(`Language switched to ${e.target.options[e.target.selectedIndex].text}`, 'info');
    });
  }

  applyTranslations() {
    const dict = this.translations[this.currentLanguage] || this.translations['en'];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });
  }

  bindToastManager() {
    window.showAgriToast = (msg, type = 'info') => {
      this.showToast(msg, type);
    };
  }

  showToast(message, type = 'info') {
    const I = window.AgriIcons || {};
    let container = document.getElementById('agriToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'agriToastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    const icon = type === 'success' ? (I.check || '✓') : (type === 'warning' ? (I.alertTriangle || '⚠') : (type === 'danger' ? (I.close || '✕') : (I.info || 'ℹ')));
    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-msg">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  renderSupplierMetrics() {
    const container = document.getElementById('supplierContainer');
    if (!container) return;
    const I = window.AgriIcons || {};

    container.innerHTML = `
      <div class="supplier-dashboard-grid">
        <div class="supplier-hero-card card">
          <div class="card-header-flex">
            <div>
              <h3>Supplier Enterprise Hub</h3>
              <span class="text-muted small">Verified Vendor: Rajesh Farm Supplies (Mandya Agro Depot)</span>
            </div>
            <button class="btn btn-primary" onclick="window.navigateToView('marketplace'); document.getElementById('btnOpenCreateListing')?.click();">
              ${I.plus || ''} Add New Listing
            </button>
          </div>

          <div class="supplier-stats-grid">
            <div class="stat-box">
              <span class="stat-number">12</span>
              <span class="stat-title">Active Listings</span>
              <span class="stat-sub text-success">↑ 2 posted this week</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">3</span>
              <span class="stat-title">Pending Orders</span>
              <span class="stat-sub text-warning">Requires Dispatch</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">48</span>
              <span class="stat-title">Completed Orders</span>
              <span class="stat-sub text-success">100% On-time</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">₹84,500</span>
              <span class="stat-title">Gross Revenue</span>
              <span class="stat-sub text-success">Direct Krishi UPI</span>
            </div>
          </div>
        </div>

        <div class="card supplier-inventory-card">
          <h4>Real-Time Inventory & Dispatch Ready List</h4>
          <table class="table-compact">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Hybrid Tomato F1 Seeds (Arka Rakshak)</strong></td>
                <td>Seeds</td>
                <td>₹450 / packet</td>
                <td>24 packets</td>
                <td><span class="badge badge-success">In Stock</span></td>
                <td><button class="btn btn-xs btn-outline">Restock</button></td>
              </tr>
              <tr>
                <td><strong>Mahindra 575 DI Tractor (45 HP)</strong></td>
                <td>Tractors</td>
                <td>₹1,200 / hr</td>
                <td>2 units</td>
                <td><span class="badge badge-accent">Available</span></td>
                <td><button class="btn btn-xs btn-outline">Manage Schedule</button></td>
              </tr>
              <tr>
                <td><strong>Organic Vermicompost Manure</strong></td>
                <td>Manure</td>
                <td>₹350 / bag</td>
                <td>80 bags</td>
                <td><span class="badge badge-success">In Stock</span></td>
                <td><button class="btn btn-xs btn-outline">Restock</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderAdminMetrics() {
    const container = document.getElementById('adminContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="admin-dashboard-grid">
        <div class="card admin-hero-card">
          <div class="card-header-flex">
            <div>
              <h3>Platform Administrator System Health</h3>
              <span class="text-muted small">Network Telemetry & Ecosystem Analytics</span>
            </div>
            <span class="badge badge-success badge-lg">All Systems Nominal</span>
          </div>

          <div class="admin-kpi-grid">
            <div class="kpi-card-admin">
              <span class="kpi-num">128</span>
              <span class="kpi-name">Registered Farmers</span>
            </div>
            <div class="kpi-card-admin">
              <span class="kpi-num">42</span>
              <span class="kpi-name">Verified Suppliers</span>
            </div>
            <div class="kpi-card-admin">
              <span class="kpi-num">17</span>
              <span class="kpi-name">Connected ESP32 Nodes</span>
            </div>
            <div class="kpi-card-admin">
              <span class="kpi-num">384</span>
              <span class="kpi-name">Active Listings</span>
            </div>
            <div class="kpi-card-admin">
              <span class="kpi-num">96</span>
              <span class="kpi-name">Orders Fulfilled</span>
            </div>
            <div class="kpi-card-admin">
              <span class="kpi-num">1,420</span>
              <span class="kpi-name">AI Voice Queries</span>
            </div>
          </div>
        </div>

        <div class="card admin-logs-card">
          <h4>IoT Gateway & AI Model Server Logs</h4>
          <pre class="telemetry-json-code">
[2026-09-24 10:30:12] [ESP32-001] Telemetry heartbeat received: Soil=68% Temp=28.4C Hum=74% RSSI=-62dBm
[2026-09-24 10:30:15] [CropAI] Model MobileNetV2 inferencing on SpaceNet tile Mandya-4B (42ms) -> 87% Vegetative
[2026-09-24 10:30:22] [Sarvam Indic NLU] Audio query transcribed (kn-IN) -> Intent: SEARCH_PRODUCT ("tomato seeds")
[2026-09-24 10:30:24] [MarketplaceAgent] 4 listings returned -> Ordered Arka Rakshak F1 by proximity (Mandya depot)
[2026-09-24 10:30:30] [OrderAgent] Order AGRI-10245 confirmed via human approval. Tamper-proof digest minted.
          </pre>
        </div>
      </div>
    `;
  }
}

window.navigateToView = function(viewName) {
  if (window.agriApp) {
    window.agriApp.switchView(viewName);
  }
};

window.addEventListener('DOMContentLoaded', () => {
  window.agriApp = new AgriApp();
  window.agriApp.init();
});
