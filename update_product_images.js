const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Mapping of product IDs to new image filenames (JPEGs in assets/images/products/)
const imageMap = {
  'prod-001': 'tomato_seeds.jpg',
  'prod-002': 'mahindra_tractor.jpg',
  'prod-003': 'vermicompost.jpg',
  'prod-004': 'npk_fertilizer.jpg',
  'prod-005': 'power_tiller.jpg',
  'prod-006': 'neem_oil.jpg',
  'prod-007': 'drip_irrigation.jpg',
  'prod-008': 'backpack_sprayer.jpg',
  'prod-009': 'wheat_seeds.jpg',
  'prod-010': 'combine_harvester.jpg',
  'prod-011': 'paddy_seeds.jpg',
  'prod-012': 'john_deere.jpg',
  'prod-013': 'transplanter.jpg',
  'prod-014': 'agri_drone.jpg',
  'prod-015': 'solar_pump.jpg',
  'prod-016': 'maize_seeds.jpg',
  'prod-017': 'cotton_seeds.jpg',
  'prod-018': 'bio_npk.jpg',
  'prod-019': 'micronutrient.jpg',
  'prod-020': 'soil_tester.jpg',
  'prod-021': 'insect_traps.jpg', // placeholder, replace later
  'prod-022': 'neem_cake.jpg', // placeholder, replace later
  'prod-023': 'trichoderma.jpg',
  'prod-024': 'laser_leveler.jpg'
};

let updatedCount = 0;
products.forEach(p => {
  const newImg = imageMap[p.id];
  if (newImg) {
    const newPath = `assets/images/products/${newImg}`;
    if (p.image !== newPath) {
      p.image = newPath;
      updatedCount++;
    }
  }
});

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
console.log(`Updated ${updatedCount} product image paths in ${productsPath}`);
