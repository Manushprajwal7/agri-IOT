const fs = require('fs');
const path = require('path');
const imgDir = path.join(__dirname, 'assets', 'images');

const newSvgs = {
  'paddy_seeds.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="paddyBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#134e4a"/><stop offset="100%" stop-color="#042f2e"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#paddyBg)" rx="16"/>
  <path d="M 120 70 L 280 70 L 295 240 L 105 240 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="4"/>
  <rect x="135" y="60" width="130" height="16" rx="6" fill="#15803d"/>
  <rect x="130" y="110" width="140" height="95" rx="8" fill="#ffffff"/>
  <text x="200" y="142" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#166534" text-anchor="middle">JAYA / IR-64</text>
  <text x="200" y="166" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#b45309" text-anchor="middle">PADDY SEEDS</text>
  <text x="200" y="188" font-family="system-ui, sans-serif" font-size="10" fill="#475569" text-anchor="middle">Certified High Yield (120 Days)</text>
  <circle cx="200" cy="225" r="10" fill="#16a34a"/>
  <text x="200" y="228" font-family="system-ui, sans-serif" font-size="8" font-weight="bold" fill="#fff" text-anchor="middle">100%</text>
  <text x="200" y="268" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#fef08a" text-anchor="middle">10 KG CERTIFIED PACK</text>
</svg>`,

  'maize_seeds.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="maizeBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#854d0e"/><stop offset="100%" stop-color="#422006"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#maizeBg)" rx="16"/>
  <rect x="125" y="70" width="150" height="175" rx="12" fill="#fde047" stroke="#eab308" stroke-width="4"/>
  <rect x="140" y="105" width="120" height="85" rx="8" fill="#ffffff"/>
  <text x="200" y="136" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#713f12" text-anchor="middle">NK-6240</text>
  <text x="200" y="158" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#ca8a04" text-anchor="middle">GOLDEN MAIZE</text>
  <text x="200" y="178" font-family="system-ui, sans-serif" font-size="9" fill="#64748b" text-anchor="middle">Syngenta F1 Hybrid</text>
  <circle cx="200" cy="215" r="14" fill="#16a34a"/>
  <text x="200" y="219" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">F1</text>
  <text x="200" y="270" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#fef08a" text-anchor="middle">4 KG PACKET</text>
</svg>`,

  'cotton_seeds.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="cotBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#cotBg)" rx="16"/>
  <rect x="125" y="70" width="150" height="175" rx="10" fill="#e0f2fe" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="200" cy="145" r="38" fill="#ffffff" stroke="#93c5fd" stroke-width="4"/>
  <path d="M 185 145 Q 200 120 215 145 Q 200 170 185 145 Z" fill="#0284c7"/>
  <text x="200" y="128" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">BT COTTON</text>
  <text x="200" y="164" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#0c4a6e" text-anchor="middle">BG-II</text>
  <text x="200" y="210" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#0284c7" text-anchor="middle">Bollgard II Hybrid</text>
  <text x="200" y="270" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#bae6fd" text-anchor="middle">450g CERTIFIED SEED</text>
</svg>`,

  'john_deere.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="jdBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#14532d"/><stop offset="100%" stop-color="#052e16"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#jdBg)" rx="16"/>
  <g transform="translate(50, 70)">
    <rect x="80" y="45" width="135" height="65" rx="8" fill="#367c2b"/>
    <rect x="145" y="15" width="70" height="55" rx="6" fill="#1e293b" stroke="#ffd100" stroke-width="3"/>
    <rect x="152" y="22" width="56" height="32" rx="4" fill="#93c5fd" opacity="0.6"/>
    <circle cx="75" cy="125" r="34" fill="#1e293b" stroke="#ffd100" stroke-width="8"/>
    <circle cx="220" cy="120" r="44" fill="#1e293b" stroke="#ffd100" stroke-width="10"/>
    <circle cx="75" cy="125" r="16" fill="#ffd100"/>
    <circle cx="220" cy="120" r="22" fill="#ffd100"/>
    <rect x="60" y="20" width="8" height="35" fill="#ffd100"/>
  </g>
  <text x="200" y="265" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffd100" text-anchor="middle">JOHN DEERE 5050D 4WD (50 HP)</text>
</svg>`,

  'transplanter.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="transBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#9a3412"/><stop offset="100%" stop-color="#431407"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#transBg)" rx="16"/>
  <g transform="translate(55, 75)">
    <rect x="80" y="50" width="130" height="45" rx="6" fill="#ea580c"/>
    <polygon points="170,25 240,55 190,55" fill="#fed7aa"/>
    <line x1="220" y1="55" x2="260" y2="120" stroke="#f97316" stroke-width="6" stroke-linecap="round"/>
    <circle cx="90" cy="115" r="28" fill="#1c1917" stroke="#ea580c" stroke-width="6"/>
    <circle cx="190" cy="115" r="28" fill="#1c1917" stroke="#ea580c" stroke-width="6"/>
  </g>
  <text x="200" y="260" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#ffedd5" text-anchor="middle">KUBOTA 4-ROW PADDY TRANSPLANTER</text>
</svg>`,

  'agri_drone.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="droneBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#droneBg)" rx="16"/>
  <g transform="translate(70, 70)">
    <line x1="40" y1="40" x2="220" y2="120" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
    <line x1="40" y1="120" x2="220" y2="40" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
    <line x1="20" y1="80" x2="240" y2="80" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="40" cy="40" rx="28" ry="7" fill="#38bdf8" opacity="0.8"/>
    <ellipse cx="220" cy="40" rx="28" ry="7" fill="#38bdf8" opacity="0.8"/>
    <ellipse cx="40" cy="120" rx="28" ry="7" fill="#38bdf8" opacity="0.8"/>
    <ellipse cx="220" cy="120" rx="28" ry="7" fill="#38bdf8" opacity="0.8"/>
    <ellipse cx="20" cy="80" rx="28" ry="7" fill="#38bdf8" opacity="0.8"/>
    <ellipse cx="240" cy="80" rx="28" ry="7" fill="#38bdf8" opacity="0.8"/>
    <rect x="100" y="60" width="60" height="40" rx="10" fill="#f8fafc" stroke="#0ea5e9" stroke-width="3"/>
    <circle cx="130" cy="80" r="12" fill="#0284c7"/>
    <rect x="110" y="100" width="40" height="20" rx="4" fill="#10b981"/>
  </g>
  <text x="200" y="260" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#e0f2fe" text-anchor="middle">16L AI AGRI DRONE SPRAY SERVICE</text>
</svg>`,

  'solar_pump.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="solBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0369a1"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#solBg)" rx="16"/>
  <polygon points="100,60 210,60 190,130 80,130" fill="#1e3a8a" stroke="#93c5fd" stroke-width="3"/>
  <line x1="136" y1="60" x2="116" y2="130" stroke="#93c5fd" stroke-width="2"/>
  <line x1="173" y1="60" x2="153" y2="130" stroke="#93c5fd" stroke-width="2"/>
  <line x1="90" y1="95" x2="200" y2="95" stroke="#93c5fd" stroke-width="2"/>
  <line x1="145" y1="130" x2="145" y2="180" stroke="#94a3b8" stroke-width="6"/>
  <rect x="240" y="100" width="65" height="95" rx="10" fill="#0284c7" stroke="#38bdf8" stroke-width="3"/>
  <rect x="255" y="80" width="35" height="20" fill="#0369a1"/>
  <circle cx="272" cy="145" r="16" fill="#bae6fd"/>
  <text x="200" y="260" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#f0fdf4" text-anchor="middle">5HP SOLAR SUBMERSIBLE PUMP</text>
</svg>`,

  'soil_tester.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="testBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#064e3b"/><stop offset="100%" stop-color="#022c22"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#testBg)" rx="16"/>
  <rect x="145" y="50" width="110" height="120" rx="16" fill="#1e293b" stroke="#10b981" stroke-width="3"/>
  <rect x="160" y="65" width="80" height="45" rx="6" fill="#064e3b"/>
  <text x="200" y="92" font-family="monospace" font-size="15" font-weight="bold" fill="#34d399" text-anchor="middle">pH 6.8</text>
  <text x="200" y="105" font-family="monospace" font-size="10" fill="#6ee7b7" text-anchor="middle">MOIST 68%</text>
  <circle cx="180" cy="135" r="8" fill="#10b981"/>
  <circle cx="220" cy="135" r="8" fill="#3b82f6"/>
  <line x1="180" y1="170" x2="180" y2="245" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>
  <line x1="220" y1="170" x2="220" y2="245" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>
  <text x="200" y="275" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#a7f3d0" text-anchor="middle">DIGITAL 3-IN-1 SOIL & NPK TESTER</text>
</svg>`,

  'bio_npk.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="bioBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#14532d"/><stop offset="100%" stop-color="#166534"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#bioBg)" rx="16"/>
  <path d="M 160 80 L 240 80 L 255 230 L 145 230 Z" fill="#f0fdf4" stroke="#4ade80" stroke-width="3"/>
  <rect x="175" y="60" width="50" height="20" rx="4" fill="#16a34a"/>
  <rect x="155" y="115" width="90" height="80" rx="6" fill="#bbf7d0"/>
  <text x="200" y="145" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#14532d" text-anchor="middle">BIO-NPK</text>
  <text x="200" y="165" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#15803d" text-anchor="middle">CONSORTIA</text>
  <text x="200" y="182" font-family="system-ui, sans-serif" font-size="8" fill="#166534" text-anchor="middle">Azotobacter + PSB</text>
  <text x="200" y="265" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#bbf7d0" text-anchor="middle">1 LITRE LIQUID BIO-FERTILIZER</text>
</svg>`,

  'micronutrient.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="microBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4c1d95"/><stop offset="100%" stop-color="#2e1065"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#microBg)" rx="16"/>
  <rect x="145" y="70" width="110" height="155" rx="10" fill="#f5f3ff" stroke="#a855f7" stroke-width="3"/>
  <rect x="170" y="50" width="60" height="20" rx="4" fill="#7e22ce"/>
  <text x="200" y="120" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#581c87" text-anchor="middle">Zn + Boron</text>
  <text x="200" y="145" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#9333ea" text-anchor="middle">CHELATED 12%</text>
  <text x="200" y="170" font-family="system-ui, sans-serif" font-size="9" fill="#6b21a8" text-anchor="middle">Foliar Micronutrient</text>
  <text x="200" y="260" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#e9d5ff" text-anchor="middle">1 KG COMBO PACK</text>
</svg>`,

  'traps.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs><linearGradient id="trapBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#78350f"/><stop offset="100%" stop-color="#451a03"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#trapBg)" rx="16"/>
  <rect x="100" y="70" width="80" height="130" rx="6" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
  <rect x="210" y="70" width="80" height="130" rx="6" fill="#38bdf8" stroke="#0284c7" stroke-width="3"/>
  <line x1="140" y1="40" x2="140" y2="70" stroke="#cbd5e1" stroke-width="3"/>
  <line x1="250" y1="40" x2="250" y2="70" stroke="#cbd5e1" stroke-width="3"/>
  <text x="140" y="140" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#854d0e" text-anchor="middle">YELLOW</text>
  <text x="250" y="140" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">BLUE</text>
  <text x="200" y="260" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#fef08a" text-anchor="middle">STICKY & PHEROMONE TRAP KIT (20x)</text>
</svg>`
};

for (const [filename, content] of Object.entries(newSvgs)) {
  fs.writeFileSync(path.join(imgDir, filename), content, 'utf8');
}
console.log('Successfully generated new SVG assets: ' + Object.keys(newSvgs).length);
