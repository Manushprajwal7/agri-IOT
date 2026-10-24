const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, 'assets', 'images', 'products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const images = [
  {
    name: 'tomato_seeds.jpg',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'mahindra_tractor.jpg',
    url: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'vermicompost.jpg',
    url: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'npk_fertilizer.jpg',
    url: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'power_tiller.jpg',
    url: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'neem_oil.jpg',
    url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'drip_irrigation.jpg',
    url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'backpack_sprayer.jpg',
    url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'wheat_seeds.jpg',
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'combine_harvester.jpg',
    url: 'https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'paddy_seeds.jpg',
    url: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'john_deere.jpg',
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'transplanter.jpg',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'agri_drone.jpg',
    url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'solar_pump.jpg',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'maize_seeds.jpg',
    url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'cotton_seeds.jpg',
    url: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'bio_npk.jpg',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'micronutrient.jpg',
    url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'soil_tester.jpg',
    url: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'insect_traps.jpg',
    url: 'https://images.unsplash.com/photo-1589923188651-268a9f65e321?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'neem_cake.jpg',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d69104a47?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'trichoderma.jpg',
    url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'laser_leveler.jpg',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'
  }
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    
    function makeRequest(currentUrl) {
      https.get(currentUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          makeRequest(response.headers.location);
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`Failed with status ${response.statusCode} for ${currentUrl}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve());
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }

    makeRequest(url);
  });
}

async function run() {
  console.log(`Starting download of ${images.length} real agricultural product photos...`);
  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    const dest = path.join(targetDir, item.name);
    try {
      process.stdout.write(`[${i + 1}/${images.length}] Downloading ${item.name}... `);
      await downloadFile(item.url, dest);
      const size = fs.statSync(dest).size;
      console.log(`DONE (${(size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`ERROR: ${err.message}`);
    }
  }
  console.log('All downloads completed!');
}

run();
