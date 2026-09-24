/**
 * AgriSense & AgriMarket AI - Crop Intelligence Module
 * Manages crop phenological stage cycles, AI health evaluation, and agronomic recommendations.
 * Matches PRD Sections 17, 18, 71.
 */

class CropIntelligenceEngine {
  constructor() {
    this.currentCrop = 'Rice (Paddy)';
    this.selectedModel = 'MobileNetV2';
    this.cropData = {
      'Rice (Paddy)': {
        variety: 'Jaya / IR-64 High Yielding',
        cycleDaysTotal: 120,
        currentDay: 46,
        growthStage: 'Vegetative Stage (Tillering)',
        stageIndex: 2, // 0: Seeding, 1: Germination, 2: Vegetative, 3: Flowering, 4: Maturity, 5: Harvest
        aiCondition: 'Healthy Foliar Canopy',
        confidenceMobileNet: 87,
        confidenceCNN: 84,
        waterReqMmDay: '6.5 mm/day',
        rootZoneMoistureOpt: '60% - 75%',
        biomassEstimate: '2,800 kg/Ha',
        fertilizerRecommendation: 'Top dress with Urea (25kg/acre) + Zinc sulphate during active tillering.',
        stages: [
          { name: 'Seeding', range: 'Day 1-10', desc: 'Seedbed nursery preparation and wet broadcast.' },
          { name: 'Germination', range: 'Day 10-25', desc: 'Coleoptile emergence and transplantation into puddled plot.' },
          { name: 'Vegetative', range: 'Day 25-60', desc: 'Active tillering and canopy leaf area index expansion.' },
          { name: 'Flowering', range: 'Day 60-85', desc: 'Panicle initiation and anthesis pollination.' },
          { name: 'Maturity', range: 'Day 85-110', desc: 'Grain dough and hard dough maturation.' },
          { name: 'Harvest', range: 'Day 110-120', desc: 'Optimal grain moisture at 14% for harvest.' }
        ]
      },
      'Tomato': {
        variety: 'Arka Rakshak F1 Hybrid',
        cycleDaysTotal: 140,
        currentDay: 58,
        growthStage: 'Flowering & Early Fruit Set',
        stageIndex: 3,
        aiCondition: 'Good (No Leaf Curl Detected)',
        confidenceMobileNet: 89,
        confidenceCNN: 86,
        waterReqMmDay: '4.8 mm/day',
        rootZoneMoistureOpt: '55% - 70%',
        biomassEstimate: '3,400 kg/Ha',
        fertilizerRecommendation: 'Apply NPK 19:19:19 fertigation; maintain potassium for fruit firmness.',
        stages: [
          { name: 'Seeding', range: 'Day 1-15', desc: 'Pro-tray nursery germination.' },
          { name: 'Germination', range: 'Day 15-30', desc: 'Drip bed transplanting.' },
          { name: 'Vegetative', range: 'Day 30-55', desc: 'Side shoot staking and pruning.' },
          { name: 'Flowering', range: 'Day 55-85', desc: 'Cluster blooming and bee pollination.' },
          { name: 'Maturity', range: 'Day 85-120', desc: 'Fruit development and breaker stage.' },
          { name: 'Harvest', range: 'Day 120-140', desc: 'Staggered hand harvest.' }
        ]
      },
      'Sugarcane': {
        variety: 'Co 86032 (Nayana)',
        cycleDaysTotal: 360,
        currentDay: 140,
        growthStage: 'Grand Growth Period',
        stageIndex: 2,
        aiCondition: 'Vigorous Stalk Elongation',
        confidenceMobileNet: 91,
        confidenceCNN: 88,
        waterReqMmDay: '8.0 mm/day',
        rootZoneMoistureOpt: '65% - 80%',
        biomassEstimate: '75 Tons/Ha',
        fertilizerRecommendation: 'Earth-up ridges and apply secondary dose of potash and nitrogen.',
        stages: [
          { name: 'Seeding', range: 'Month 1', desc: 'Sett planting in furrows.' },
          { name: 'Germination', range: 'Month 1-2', desc: 'Sprouting of sett buds.' },
          { name: 'Vegetative', range: 'Month 3-7', desc: 'Tillering and cane stalk elongation.' },
          { name: 'Flowering', range: 'Month 8-9', desc: 'Tassel emergence (non-arrowing favored).' },
          { name: 'Maturity', range: 'Month 10-11', desc: 'Brix sucrose accumulation.' },
          { name: 'Harvest', range: 'Month 12', desc: 'Base cutting with mechanical harvester.' }
        ]
      }
    };
  }

  getCrop(cropName) {
    return this.cropData[cropName || this.currentCrop] || this.cropData['Rice (Paddy)'];
  }

  setCrop(cropName) {
    if (this.cropData[cropName]) {
      this.currentCrop = cropName;
      window.dispatchEvent(new CustomEvent('agri:crop-changed', { detail: this.getCrop() }));
    }
  }

  renderTimeline(containerId = 'cropTimelineContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const crop = this.getCrop();

    let html = `
      <div class="crop-timeline-wrapper">
        <div class="crop-timeline-steps">
    `;

    crop.stages.forEach((st, idx) => {
      const isPast = idx < crop.stageIndex;
      const isCurrent = idx === crop.stageIndex;
      const stateClass = isCurrent ? 'current' : (isPast ? 'completed' : 'upcoming');

      html += `
        <div class="timeline-step ${stateClass}">
          <div class="step-indicator">
            <span class="step-icon">${isPast ? '✓' : (isCurrent ? '●' : idx + 1)}</span>
            <span class="step-line"></span>
          </div>
          <div class="step-body">
            <span class="step-name">${st.name}</span>
            <span class="step-range">${st.range}</span>
            <p class="step-desc">${st.desc}</p>
            ${isCurrent ? `<span class="badge badge-ai-current">Current Predicted Stage</span>` : ''}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}

window.cropIntelligence = new CropIntelligenceEngine();
