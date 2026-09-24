/**
 * AgriSense & AgriMarket AI - 10-Step Hackathon Demo Scenario Runner
 * Matches PRD Section 47, 91, and 92.
 * Uses 100% Vector SVG Icons (Zero Emojis).
 */

class DemoScenarioRunner {
  constructor() {
    this.currentStep = 1;
    this.autoPlaying = false;
    this.autoPlayTimer = null;
    this.steps = [
      {
        step: 1,
        title: "1. Hardware Sensing Prototype",
        view: "devices",
        narrative: "Demonstrates physical IoT node: ESP32-WROOM-32, Capacitive Soil Moisture Sensor, DHT22, 2.3\" Color Display & Piezo Buzzer.",
        action: () => {
          if (window.navigateToView) window.navigateToView('devices');
        }
      },
      {
        step: 2,
        title: "2. Live Farm Sensor Monitoring",
        view: "dashboard",
        narrative: "Real-time telemetry streaming from farm: Soil moisture (68%), Ambient temperature (28.4°C), Air humidity (74%) synced to 2.3\" TFT canvas emulator.",
        action: () => {
          if (window.navigateToView) window.navigateToView('dashboard');
          if (window.sensorEngine) window.sensorEngine.resetToNormal();
        }
      },
      {
        step: 3,
        title: "3. Environmental Moisture Alert & Buzzer",
        view: "dashboard",
        narrative: "Canal surge causes soil moisture to spike to 89%. Watch the 2.3\" LCD switch to WARNING red screen, buzzer beeps, and alerts log.",
        action: () => {
          if (window.navigateToView) window.navigateToView('dashboard');
          if (window.sensorEngine) window.sensorEngine.triggerMoistureSpike(89);
        }
      },
      {
        step: 4,
        title: "4. Crop Intelligence & Growth Cycle",
        view: "crop",
        narrative: "Connects sensor data to AI phenological cycle. Paddy is at Day 46/120 (Vegetative Stage) with 87% confidence.",
        action: () => {
          if (window.navigateToView) window.navigateToView('crop');
        }
      },
      {
        step: 5,
        title: "5. Satellite Imagery & MobileNetV2 Analysis",
        view: "satellite",
        narrative: "High-resolution orbital imagery parcel (12.4 Ha). Switch between Optical RGB, Spectral NDVI, and run MobileNetV2 AI Segmentation inference.",
        action: () => {
          if (window.navigateToView) window.navigateToView('satellite');
          if (window.satelliteViewer) window.satelliteViewer.runAnalysis();
        }
      },
      {
        step: 6,
        title: "6. AgriMarket Social Marketplace",
        view: "marketplace",
        narrative: "Community marketplace feed for seeds, organic fertilizers, and tractor rentals. No complicated enterprise menus.",
        action: () => {
          if (window.navigateToView) window.navigateToView('marketplace');
        }
      },
      {
        step: 7,
        title: "7. Voice-First AI Assistant (Sarvam Indic NLU)",
        view: "marketplace",
        narrative: "Farmers interact using native voice. Watch the Multi-Agent Orchestrator understand: 'I need tomato seeds' in Kannada / Hindi / English.",
        action: () => {
          if (window.aiAssistant) {
            window.aiAssistant.openModal();
            window.aiAssistant.processUserText("I need tomato seeds");
          }
        }
      },
      {
        step: 8,
        title: "8. Multi-Agent Product Discovery & Explainability",
        view: "marketplace",
        narrative: "Marketplace Agent finds listings; Product Agent compares prices and explains why Arka Rakshak F1 was recommended.",
        action: () => {
          if (window.aiAssistant) {
            window.aiAssistant.openModal();
          }
        }
      },
      {
        step: 9,
        title: "9. Human-in-the-Loop Safe Order Confirmation",
        view: "marketplace",
        narrative: "AI never places orders unilaterally. A safety confirmation modal requires the farmer to verify price (₹450) and quantity.",
        action: () => {
          if (window.aiAssistant) {
            window.aiAssistant.prepareOrder('prod-001');
          }
        }
      },
      {
        step: 10,
        title: "10. Transparent Supply-Chain Tracking",
        view: "orders",
        narrative: "Order AGRI-10245 tracked across the 5-stage agricultural supply chain: Placed → Confirmed → Processing → Dispatched → Delivered.",
        action: () => {
          if (window.aiAssistant) window.aiAssistant.closeModal();
          if (window.navigateToView) window.navigateToView('orders');
          if (window.ordersEngine) window.ordersEngine.selectOrder('AGRI-10245');
        }
      }
    ];
  }

  init(containerId = 'demoBarContainer') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const I = window.AgriIcons || {};

    this.container.innerHTML = `
      <div class="demo-runner-bar" id="demoRunnerBar">
        <div class="demo-step-info">
          <span class="demo-badge">${I.award || ''} HACKATHON DEMO TOUR</span>
          <span class="demo-current-step" id="demoStepTitle">${this.steps[0].title}</span>
          <p class="demo-narrative" id="demoStepNarrative">${this.steps[0].narrative}</p>
        </div>
        <div class="demo-stepper-controls">
          <button class="btn btn-sm btn-outline" id="btnPrevDemoStep">${I.chevronLeft || '◀'} Back</button>
          <span class="step-counter"><span id="demoStepNum">1</span> / 10</span>
          <button class="btn btn-sm btn-primary" id="btnNextDemoStep">Next Step ${I.chevronRight || '▶'}</button>
          <button class="btn btn-sm btn-accent" id="btnAutoPlayDemo">${I.zap || ''} Auto Tour</button>
          <button class="btn-close-demo" id="btnCloseDemoBar" title="Hide demo bar">${I.close || '✕'}</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const prevBtn = document.getElementById('btnPrevDemoStep');
    const nextBtn = document.getElementById('btnNextDemoStep');
    const autoBtn = document.getElementById('btnAutoPlayDemo');
    const closeBtn = document.getElementById('btnCloseDemoBar');
    const bar = document.getElementById('demoRunnerBar');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.goToStep(this.currentStep - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.goToStep(this.currentStep + 1);
      });
    }

    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        this.toggleAutoPlay();
      });
    }

    if (closeBtn && bar) {
      closeBtn.addEventListener('click', () => {
        bar.style.display = 'none';
        if (window.showAgriToast) window.showAgriToast('Demo tour collapsed. Click "Demo Tour" in navbar to reopen.', 'info');
      });
    }
  }

  goToStep(stepNumber) {
    if (stepNumber < 1) stepNumber = 1;
    if (stepNumber > 10) stepNumber = 10;
    this.currentStep = stepNumber;

    const s = this.steps[this.currentStep - 1];
    const titleEl = document.getElementById('demoStepTitle');
    const narrativeEl = document.getElementById('demoStepNarrative');
    const numEl = document.getElementById('demoStepNum');

    if (titleEl) titleEl.textContent = s.title;
    if (narrativeEl) narrativeEl.textContent = s.narrative;
    if (numEl) numEl.textContent = this.currentStep;

    s.action();
  }

  toggleAutoPlay() {
    const autoBtn = document.getElementById('btnAutoPlayDemo');
    const I = window.AgriIcons || {};
    if (this.autoPlaying) {
      this.autoPlaying = false;
      clearInterval(this.autoPlayTimer);
      if (autoBtn) autoBtn.innerHTML = `${I.zap || ''} Auto Tour`;
    } else {
      this.autoPlaying = true;
      if (autoBtn) autoBtn.innerHTML = `Pause Tour`;
      this.autoPlayTimer = setInterval(() => {
        if (this.currentStep >= 10) {
          this.goToStep(1);
        } else {
          this.goToStep(this.currentStep + 1);
        }
      }, 5500);
    }
  }
}

window.demoRunner = new DemoScenarioRunner();
