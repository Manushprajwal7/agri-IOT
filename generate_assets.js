const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'assets', 'images');
const satDir = path.join(__dirname, 'assets', 'satellite');

if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
if (!fs.existsSync(satDir)) fs.mkdirSync(satDir, { recursive: true });

const svgs = {
  'fertilizer.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="fertBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0077b6"/><stop offset="100%" stop-color="#023e8a"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#fertBg)" rx="16"/>
  <path d="M 125 65 L 275 65 L 295 245 L 105 245 Z" fill="#caf0f8" stroke="#90e0ef" stroke-width="3"/>
  <rect x="135" y="55" width="130" height="15" rx="5" fill="#0077b6"/>
  <rect x="130" y="105" width="140" height="105" rx="8" fill="#ffffff"/>
  <text x="200" y="145" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#03045e" text-anchor="middle">NPK</text>
  <text x="200" y="170" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#0077b6" text-anchor="middle">19 : 19 : 19</text>
  <text x="200" y="195" font-family="system-ui, sans-serif" font-size="9" fill="#6c757d" text-anchor="middle">100% Water Soluble</text>
  <text x="200" y="235" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#03045e" text-anchor="middle">25 KG NET</text>
</svg>`,

  'power_tiller.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="tillerBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#495057"/><stop offset="100%" stop-color="#212529"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#tillerBg)" rx="16"/>
  <g transform="translate(60, 80)">
    <rect x="100" y="40" width="100" height="50" rx="6" fill="#e63946"/>
    <rect x="120" y="20" width="40" height="25" fill="#6c757d"/>
    <line x1="80" y1="40" x2="20" y2="10" stroke="#f8f9fa" stroke-width="8" stroke-linecap="round"/>
    <circle cx="20" cy="10" r="8" fill="#e63946"/>
    <circle cx="150" cy="120" r="38" fill="#343a40"/>
    <circle cx="150" cy="120" r="22" fill="#ffb703"/>
    <path d="M 190 90 L 240 120 L 220 135 Z" fill="#ced4da"/>
  </g>
  <text x="200" y="260" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">VST SHAKTI 13HP TILLER</text>
</svg>`,

  'pesticide.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="pestBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#386641"/><stop offset="100%" stop-color="#1b4332"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#pestBg)" rx="16"/>
  <path d="M 160 70 L 240 70 L 240 90 L 260 110 L 260 230 L 140 230 L 140 110 L 160 90 Z" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2"/>
  <rect x="175" y="50" width="50" height="20" rx="3" fill="#6a994e"/>
  <rect x="150" y="125" width="100" height="85" rx="6" fill="#a7c957"/>
  <text x="200" y="155" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#1b4332" text-anchor="middle">NEEM OIL</text>
  <text x="200" y="175" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#386641" text-anchor="middle">10,000 PPM</text>
  <text x="200" y="195" font-family="system-ui, sans-serif" font-size="8" fill="#1b4332" text-anchor="middle">Pure Cold Pressed</text>
</svg>`,

  'irrigation.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="irriBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0077b6"/><stop offset="100%" stop-color="#03045e"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#irriBg)" rx="16"/>
  <circle cx="200" cy="140" r="75" fill="none" stroke="#212529" stroke-width="18"/>
  <circle cx="200" cy="140" r="50" fill="none" stroke="#343a40" stroke-width="14"/>
  <circle cx="200" cy="140" r="28" fill="none" stroke="#495057" stroke-width="12"/>
  <circle cx="200" cy="140" r="14" fill="#00b4d8"/>
  <path d="M 260 70 C 255 78 265 78 260 70 Z" fill="#90e0ef"/>
  <path d="M 140 190 C 135 198 145 198 140 190 Z" fill="#90e0ef"/>
  <text x="200" y="260" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">DRIP IRRIGATION LATERAL KIT</text>
</svg>`,

  'sprayer.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="sprBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f77f00"/><stop offset="100%" stop-color="#d62828"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#sprBg)" rx="16"/>
  <rect x="140" y="70" width="120" height="150" rx="20" fill="#f8f9fa"/>
  <rect x="170" y="55" width="60" height="18" rx="6" fill="#212529"/>
  <rect x="160" y="110" width="80" height="40" rx="6" fill="#003049"/>
  <text x="200" y="135" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">16L BATTERY</text>
  <line x1="260" y1="180" x2="310" y2="100" stroke="#fdf0d5" stroke-width="5" stroke-linecap="round"/>
  <circle cx="312" cy="98" r="6" fill="#fcbf49"/>
  <text x="200" y="260" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">BACKPACK POWER SPRAYER</text>
</svg>`,

  'wheat_seeds.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="wBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#dda15e"/><stop offset="100%" stop-color="#bc6c25"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#wBg)" rx="16"/>
  <rect x="110" y="45" width="180" height="210" rx="10" fill="#fefae0" stroke="#faedcd" stroke-width="2"/>
  <rect x="110" y="45" width="180" height="35" rx="6" fill="#bc6c25"/>
  <text x="200" y="68" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">HERITAGE INDIGENOUS</text>
  <g transform="translate(200, 140)">
    <ellipse cx="0" cy="-20" rx="8" ry="14" fill="#d4a373"/>
    <ellipse cx="-12" cy="-5" rx="8" ry="14" fill="#dda15e" transform="rotate(-30, -12, -5)"/>
    <ellipse cx="12" cy="-5" rx="8" ry="14" fill="#dda15e" transform="rotate(30, 12, -5)"/>
    <ellipse cx="-12" cy="18" rx="8" ry="14" fill="#d4a373" transform="rotate(-30, -12, 18)"/>
    <ellipse cx="12" cy="18" rx="8" ry="14" fill="#d4a373" transform="rotate(30, 12, 18)"/>
    <line x1="0" y1="-30" x2="0" y2="45" stroke="#bc6c25" stroke-width="3"/>
  </g>
  <text x="200" y="215" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#283618" text-anchor="middle">SONAMOTI WHEAT</text>
  <text x="200" y="235" font-family="system-ui, sans-serif" font-size="10" fill="#606c38" text-anchor="middle">100% Heirloom Non-GMO</text>
</svg>`,

  'harvester.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="harvBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#283618"/><stop offset="100%" stop-color="#141c0c"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#harvBg)" rx="16"/>
  <g transform="translate(50, 70)">
    <rect x="80" y="30" width="140" height="70" rx="8" fill="#e76f51"/>
    <path d="M 220 50 L 270 90 L 220 90 Z" fill="#f4a261"/>
    <rect x="180" y="20" width="35" height="40" fill="#264653"/>
    <circle cx="265" cy="95" r="22" fill="#2a9d8f"/>
    <rect x="70" y="105" width="160" height="32" rx="16" fill="#212529"/>
    <circle cx="90" cy="121" r="10" fill="#6c757d"/>
    <circle cx="125" cy="121" r="10" fill="#6c757d"/>
    <circle cx="160" cy="121" r="10" fill="#6c757d"/>
    <circle cx="195" cy="121" r="10" fill="#6c757d"/>
  </g>
  <text x="200" y="260" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">COMBINE HARVESTER (TRACK)</text>
</svg>`
};

for (const [name, content] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(imgDir, name), content.trim());
}

// Satellite SVGs
const satOriginal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <pattern id="cropRows1" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="20" stroke="#2d6a4f" stroke-width="6" />
      <line x1="10" y1="0" x2="10" y2="20" stroke="#40916c" stroke-width="4" />
    </pattern>
    <pattern id="cropRows2" width="16" height="16" patternTransform="rotate(-30 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="16" stroke="#52b788" stroke-width="5" />
      <line x1="8" y1="0" x2="8" y2="16" stroke="#74c69d" stroke-width="3" />
    </pattern>
  </defs>
  <!-- Background Terrain -->
  <rect width="800" height="600" fill="#95d5b2"/>
  
  <!-- Farm Parcels (DeepGlobe / SpaceNet Style) -->
  <polygon points="40,30 320,40 300,260 50,230" fill="url(#cropRows1)" stroke="#d8f3dc" stroke-width="4"/>
  <polygon points="340,50 580,70 560,280 320,270" fill="#52b788" stroke="#d8f3dc" stroke-width="4"/>
  <polygon points="600,60 760,80 750,290 580,290" fill="url(#cropRows2)" stroke="#d8f3dc" stroke-width="4"/>
  
  <polygon points="60,260 280,280 270,540 40,520" fill="#40916c" stroke="#d8f3dc" stroke-width="4"/>
  <polygon points="300,290 540,300 520,560 280,550" fill="url(#cropRows1)" stroke="#d8f3dc" stroke-width="4"/>
  <polygon points="560,310 770,310 760,570 540,570" fill="#74c69d" stroke="#d8f3dc" stroke-width="4"/>
  
  <!-- Irrigation Canal & Access Road -->
  <path d="M 0,245 Q 290,265 550,295 T 800,305" fill="none" stroke="#0077b6" stroke-width="12" stroke-linecap="round"/>
  <path d="M 290,0 L 280,600" fill="none" stroke="#dda15e" stroke-width="8" stroke-dasharray="8,6"/>
  
  <!-- Farmhouse & Sensor Hub -->
  <rect x="260" y="270" width="30" height="24" rx="3" fill="#bc6c25"/>
  <circle cx="275" cy="282" r="5" fill="#e63946"/>
  <circle cx="275" cy="282" r="14" fill="none" stroke="#e63946" stroke-width="2" opacity="0.7">
    <animate attributeName="r" values="5;24" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite"/>
  </circle>

  <!-- Legend & Geo Overlay -->
  <rect x="20" y="540" width="260" height="42" rx="6" fill="#1b4332" opacity="0.9"/>
  <text x="35" y="565" font-family="monospace" font-size="12" fill="#d8f3dc">GEO: 12.5244°N, 76.8958°E | 12.4 Ha</text>
</svg>`;

const satNdvi = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="ndviGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#007f5f"/>
      <stop offset="60%" stop-color="#2b9348"/>
      <stop offset="100%" stop-color="#55a630"/>
    </linearGradient>
    <linearGradient id="ndviGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#80b918"/>
      <stop offset="50%" stop-color="#aacc00"/>
      <stop offset="100%" stop-color="#d4d700"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="#2b2d42"/>
  
  <!-- High NDVI Parcels (Vigorous Vegetation) -->
  <polygon points="40,30 320,40 300,260 50,230" fill="url(#ndviGrad1)" stroke="#80b918" stroke-width="3"/>
  <polygon points="340,50 580,70 560,280 320,270" fill="url(#ndviGrad1)" stroke="#80b918" stroke-width="3"/>
  <polygon points="600,60 760,80 750,290 580,290" fill="url(#ndviGrad2)" stroke="#ee9b00" stroke-width="3"/>
  
  <polygon points="60,260 280,280 270,540 40,520" fill="url(#ndviGrad1)" stroke="#80b918" stroke-width="3"/>
  <polygon points="300,290 540,300 520,560 280,550" fill="url(#ndviGrad1)" stroke="#80b918" stroke-width="3"/>
  <polygon points="560,310 770,310 760,570 540,570" fill="url(#ndviGrad2)" stroke="#ee9b00" stroke-width="3"/>
  
  <!-- Water Body (Low/Negative NDVI) -->
  <path d="M 0,245 Q 290,265 550,295 T 800,305" fill="none" stroke="#d90429" stroke-width="12" stroke-linecap="round"/>
  
  <rect x="20" y="540" width="310" height="42" rx="6" fill="#1b4332" opacity="0.92"/>
  <text x="35" y="565" font-family="monospace" font-size="12" fill="#70e000">NDVI: 0.78 (Vigorous Vegetative Canopy)</text>
</svg>`;

const satMask = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#0d1b2a"/>
  
  <!-- MobileNetV2 / CNN Segmentation Classes -->
  <!-- Class 1: Paddy (Vegetative Stage) - Cyan -->
  <polygon points="40,30 320,40 300,260 50,230" fill="rgba(0, 245, 212, 0.6)" stroke="#00f5d4" stroke-width="3"/>
  <text x="160" y="145" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">PADDY (VEG: 87%)</text>
  
  <polygon points="340,50 580,70 560,280 320,270" fill="rgba(0, 245, 212, 0.6)" stroke="#00f5d4" stroke-width="3"/>
  <text x="440" y="165" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">PADDY (VEG: 91%)</text>
  
  <!-- Class 2: Horticulture (Tomato) - Purple -->
  <polygon points="600,60 760,80 750,290 580,290" fill="rgba(155, 93, 229, 0.6)" stroke="#9b5de5" stroke-width="3"/>
  <text x="670" y="175" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">TOMATO (FLOWER: 84%)</text>
  
  <polygon points="60,260 280,280 270,540 40,520" fill="rgba(0, 245, 212, 0.6)" stroke="#00f5d4" stroke-width="3"/>
  <text x="160" y="400" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">PADDY (VEG: 89%)</text>
  
  <polygon points="300,290 540,300 520,560 280,550" fill="rgba(0, 187, 249, 0.6)" stroke="#00bbf9" stroke-width="3"/>
  <text x="410" y="420" font-family="system-ui, sans-serif" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">SUGARCANE (MATURE: 82%)</text>
  
  <!-- Water Canal -->
  <path d="M 0,245 Q 290,265 550,295 T 800,305" fill="none" stroke="#fee440" stroke-width="12" stroke-linecap="round" opacity="0.8"/>
  <text x="500" y="275" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#fee440">CANAL INFRASTRUCTURE</text>

  <rect x="20" y="540" width="350" height="42" rx="6" fill="#1b4332" opacity="0.95"/>
  <text x="35" y="565" font-family="monospace" font-size="12" fill="#00f5d4">MODEL: MobileNetV2 Semantic Mask • 87% Mean Conf</text>
</svg>`;

fs.writeFileSync(path.join(satDir, 'satellite_original.svg'), satOriginal.trim());
fs.writeFileSync(path.join(satDir, 'satellite_ndvi.svg'), satNdvi.trim());
fs.writeFileSync(path.join(satDir, 'satellite_mask.svg'), satMask.trim());

console.log('All SVGs generated successfully!');
