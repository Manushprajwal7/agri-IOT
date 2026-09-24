/**
 * AgriSense & AgriMarket AI - Satellite Crop Intelligence Module
 * Interactive Satellite Viewer with Pan/Zoom, Spectral NDVI & AI Segmentation layers,
 * MobileNetV2 and CNN inference engine matching PRD Sections 19-22.
 */

class SatelliteViewer {
  constructor() {
    this.currentLayer = 'original'; // 'original' | 'ndvi' | 'mask'
    this.currentModel = 'MobileNetV2';
    this.zoomLevel = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.analyzing = false;

    this.layers = {
      original: 'assets/satellite/satellite_original.svg',
      ndvi: 'assets/satellite/satellite_ndvi.svg',
      mask: 'assets/satellite/satellite_mask.svg'
    };

    this.modelMetrics = {
      'MobileNetV2': {
        name: 'MobileNetV2 (Edge Quantized)',
        framework: 'TensorFlow Lite Agronomic',
        latency: '42 ms',
        confidence: '87%',
        vegStage: 'Vegetative (Tillering)',
        detectedArea: '12.4 Hectares',
        ndviScore: '0.78',
        chlorophyllIndex: 'Optimal',
        architectureNotes: 'Inverted residual blocks with depthwise separable convolutions optimized for edge inference.'
      },
      'CNN': {
        name: 'Custom Agronomic CNN',
        framework: 'PyTorch Multispectral CNN',
        latency: '78 ms',
        confidence: '84%',
        vegStage: 'Vegetative (Tillering)',
        detectedArea: '12.4 Hectares',
        ndviScore: '0.76',
        chlorophyllIndex: 'Optimal',
        architectureNotes: '4-layer convolutional feature extractor trained on SpaceNet agricultural parcels.'
      }
    };
  }

  init(containerId = 'satViewerContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="satellite-viewer-card card">
        <div class="sat-toolbar">
          <div class="sat-layer-selectors">
            <button class="btn-layer active" data-layer="original">Original Satellite</button>
            <button class="btn-layer" data-layer="ndvi">NDVI Vegetation Index</button>
            <button class="btn-layer" data-layer="mask">AI Segmentation Mask</button>
          </div>
          <div class="sat-zoom-controls">
            <button class="btn-icon" id="satZoomIn" title="Zoom In">+</button>
            <button class="btn-icon" id="satZoomOut" title="Zoom Out">−</button>
            <button class="btn-icon" id="satZoomReset" title="Reset View">⟲</button>
          </div>
        </div>

        <div class="sat-viewport" id="satViewport">
          <div class="sat-image-wrapper" id="satImgWrapper">
            <img src="${this.layers.original}" id="satMainImg" alt="Satellite imagery parcel" draggable="false" />
          </div>
          <div class="sat-hud-overlay">
            <span class="hud-tag">${(window.AgriIcons && window.AgriIcons.mapPin) || ''} Mandya Plot 4B (12.4 Ha)</span>
            <span class="hud-tag hud-layer-tag" id="hudLayerTag">Layer: Optical RGB</span>
          </div>
        </div>

        <div class="sat-inference-panel">
          <div class="sat-model-select-group">
            <label for="satModelSelect">Select AI Inference Model:</label>
            <select id="satModelSelect" class="form-select">
              <option value="MobileNetV2" selected>MobileNetV2 (Edge Quantized)</option>
              <option value="CNN">Custom Agronomic CNN (Multispectral)</option>
            </select>
          </div>
          <button class="btn btn-primary" id="btnRunInference">
            <span class="btn-text" style="display:inline-flex; align-items:center; gap:6px;">${(window.AgriIcons && window.AgriIcons.zap) || ''} Analyze Satellite Parcel</span>
          </button>
        </div>

        <div class="sat-results-box" id="satResultsBox">
          ${this.getResultsHtml()}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Layer switching
    document.querySelectorAll('.btn-layer').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-layer').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const layer = e.currentTarget.dataset.layer;
        this.setLayer(layer);
      });
    });

    // Zoom & Pan
    const zoomIn = document.getElementById('satZoomIn');
    const zoomOut = document.getElementById('satZoomOut');
    const zoomReset = document.getElementById('satZoomReset');
    const viewport = document.getElementById('satViewport');
    const wrapper = document.getElementById('satImgWrapper');

    if (zoomIn) zoomIn.addEventListener('click', () => this.zoom(0.2));
    if (zoomOut) zoomOut.addEventListener('click', () => this.zoom(-0.2));
    if (zoomReset) zoomReset.addEventListener('click', () => this.resetView());

    if (viewport && wrapper) {
      viewport.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.startX = e.clientX - this.panX;
        this.startY = e.clientY - this.panY;
        viewport.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        this.panX = e.clientX - this.startX;
        this.panY = e.clientY - this.startY;
        this.applyTransform();
      });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
        if (viewport) viewport.style.cursor = 'grab';
      });
    }

    // Model Change
    const modelSelect = document.getElementById('satModelSelect');
    if (modelSelect) {
      modelSelect.addEventListener('change', (e) => {
        this.currentModel = e.target.value;
      });
    }

    // Analyze Button
    const runBtn = document.getElementById('btnRunInference');
    if (runBtn) {
      runBtn.addEventListener('click', () => this.runAnalysis());
    }
  }

  setLayer(layer) {
    this.currentLayer = layer;
    const img = document.getElementById('satMainImg');
    const hud = document.getElementById('hudLayerTag');
    if (img && this.layers[layer]) {
      img.src = this.layers[layer];
    }
    if (hud) {
      const labels = {
        original: 'Layer: Optical RGB (DeepGlobe)',
        ndvi: 'Layer: Spectral NDVI False Color',
        mask: 'Layer: AI Segmentation Mask'
      };
      hud.textContent = labels[layer] || layer;
    }
  }

  zoom(delta) {
    this.zoomLevel = Math.max(0.8, Math.min(3.0, this.zoomLevel + delta));
    this.applyTransform();
  }

  resetView() {
    this.zoomLevel = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.applyTransform();
  }

  applyTransform() {
    const wrapper = document.getElementById('satImgWrapper');
    if (wrapper) {
      wrapper.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel})`;
    }
  }

  async runAnalysis() {
    const runBtn = document.getElementById('btnRunInference');
    const resultsBox = document.getElementById('satResultsBox');
    if (!runBtn || !resultsBox) return;

    runBtn.disabled = true;
    runBtn.innerHTML = `<span class="spinner-border"></span> Running ${this.currentModel} Inference...`;

    // Skeleton loader
    resultsBox.innerHTML = `
      <div class="sat-skeleton-loader">
        <div class="skeleton-line shimmer" style="width: 60%; height: 20px;"></div>
        <div class="skeleton-line shimmer" style="width: 85%; height: 16px;"></div>
        <div class="skeleton-line shimmer" style="width: 70%; height: 16px;"></div>
      </div>
    `;

    // Simulate model inference
    await new Promise(r => setTimeout(r, 850));

    runBtn.disabled = false;
    runBtn.innerHTML = `<span style="display:inline-flex; align-items:center; gap:6px;">${(window.AgriIcons && window.AgriIcons.zap) || ''} Analyze Satellite Parcel</span>`;

    // Switch to segmentation mask automatically to show visual proof
    this.setLayer('mask');
    document.querySelectorAll('.btn-layer').forEach(b => {
      b.classList.toggle('active', b.dataset.layer === 'mask');
    });

    resultsBox.innerHTML = this.getResultsHtml();
    if (window.showAgriToast) {
      window.showAgriToast(`AI Inference complete: ${this.currentModel} classified Vegetative stage at 87% confidence`, 'success');
    }
  }

  getResultsHtml() {
    const m = this.modelMetrics[this.currentModel] || this.modelMetrics['MobileNetV2'];
    return `
      <div class="model-result-card">
        <div class="model-result-header">
          <div class="model-title-badge">
            <span class="badge badge-success">INFERENCE COMPLETED</span>
            <span class="model-arch">${m.name}</span>
          </div>
          <span class="latency-pill">Latency: ${m.latency}</span>
        </div>

        <div class="model-kpi-grid">
          <div class="kpi-item">
            <span class="kpi-label">Predicted Growth Stage</span>
            <span class="kpi-val text-primary">${m.vegStage}</span>
          </div>
          <div class="kpi-item">
            <span class="kpi-label">Model Confidence</span>
            <span class="kpi-val text-success">${m.confidence}</span>
            <div class="confidence-bar-bg">
              <div class="confidence-bar-fill" style="width: ${m.confidence};"></div>
            </div>
          </div>
          <div class="kpi-item">
            <span class="kpi-label">Detected Crop Area</span>
            <span class="kpi-val">${m.detectedArea}</span>
          </div>
          <div class="kpi-item">
            <span class="kpi-label">Mean NDVI Value</span>
            <span class="kpi-val text-accent">${m.ndviScore} (High Canopy)</span>
          </div>
        </div>

        <div class="ai-disclaimer-box">
          <span class="disclaimer-icon">ℹ</span>
          <span class="disclaimer-text">
            <strong>AI Disclaimer:</strong> AI predictions are intended for decision-support and demonstration purposes and should not be treated as a replacement for professional on-field agronomic advice.
          </span>
        </div>
      </div>
    `;
  }
}

window.satelliteViewer = new SatelliteViewer();
