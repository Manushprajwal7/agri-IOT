const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

const TRANSLATOR_PORT = parseInt(process.env.TRANSLATOR_PORT, 10) || 5005;
const LITERT_PORT = parseInt(process.env.LITERT_PORT, 10) || 9379;

// Generic reverse proxy helper
function proxyTo(targetPort, req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${targetPort}` }
  };

  const proxyReq = http.request(options, proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', err => {
    res.writeHead(502, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      error: 'Gemma Translation service unavailable',
      detail: err.message,
      targetPort: targetPort
    }));
  });

  req.pipe(proxyReq);
}

const TELEMETRY_FILE = path.join(__dirname, 'data', 'live_telemetry.json');

// Simple native .env loader
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const raw = fs.readFileSync(envPath, 'utf8').replace(/^\uFEFF/, '');
      const lines = raw.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          process.env[key] = val;
        }
      }
    } catch (err) {
      console.warn('[ENV] Error loading .env:', err.message);
    }
  }
}
loadEnv();

// In-memory cache for live telemetry
let lastTelemetry = {
  isLive: false,
  connected: false,
  source: 'SIMULATOR',
  soilMoisture: 68,
  soilRaw: 2200,
  temperature: 28.4,
  humidity: 74,
  buzzerActive: false,
  timestamp: new Date().toLocaleTimeString(),
  updatedAt: Date.now()
};

// SSE connected clients
const sseClients = new Set();

// Load initial telemetry from disk if exists
try {
  if (fs.existsSync(TELEMETRY_FILE)) {
    const raw = fs.readFileSync(TELEMETRY_FILE, 'utf8').replace(/^\uFEFF/, '').trim();
    if (raw) lastTelemetry = JSON.parse(raw);
  }
} catch (e) {}

// Watch telemetry file for changes to broadcast via SSE
try {
  fs.watch(path.dirname(TELEMETRY_FILE), (eventType, filename) => {
    if (filename === 'live_telemetry.json') {
      try {
        const raw = fs.readFileSync(TELEMETRY_FILE, 'utf8').replace(/^\uFEFF/, '').trim();
        if (raw) {
          const parsed = JSON.parse(raw);
          lastTelemetry = parsed;
          broadcastSse(parsed);
        }
      } catch (err) {}
    }
  });
} catch (e) {}

function broadcastSse(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch (e) {
      sseClients.delete(res);
    }
  }
}

// Background Serial Bridge Spawner
let bridgeProcess = null;
function startSerialBridge() {
  const scriptPath = path.join(__dirname, 'bridge.ps1');
  if (!fs.existsSync(scriptPath)) return;

  try {
    console.log('[SERIAL BRIDGE] Starting PowerShell COM3 bridge...');
    bridgeProcess = spawn('powershell.exe', [
      '-ExecutionPolicy', 'Bypass',
      '-NoProfile',
      '-File', scriptPath
    ], { stdio: 'ignore', detached: false });

    bridgeProcess.on('error', (err) => {
      console.warn('[SERIAL BRIDGE WARN]', err.message);
    });

    bridgeProcess.on('exit', (code) => {
      console.log(`[SERIAL BRIDGE] Process exited with code ${code}.`);
      bridgeProcess = null;
    });
  } catch (err) {
    console.error('[SERIAL BRIDGE ERROR]', err);
  }
}

const server = http.createServer((req, res) => {
  let cleanUrl = req.url.split('?')[0];

  // API Route: GET /api/v1/sensors/telemetry
  if (cleanUrl === '/api/v1/sensors/telemetry') {
    if (req.method === 'GET') {
      // Re-read file to ensure latest data
      try {
        if (fs.existsSync(TELEMETRY_FILE)) {
          let content = fs.readFileSync(TELEMETRY_FILE, 'utf8');
          content = content.replace(/^\uFEFF/, '').trim();
          if (content) {
            lastTelemetry = JSON.parse(content);
          }
        }
      } catch (e) {}

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(lastTelemetry));
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          parsed.isLive = true;
          parsed.updatedAt = Date.now();
          parsed.timestamp = new Date().toLocaleTimeString();
          lastTelemetry = parsed;
          fs.writeFileSync(TELEMETRY_FILE, JSON.stringify(parsed), 'utf8');
          broadcastSse(parsed);
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ success: true }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }
  }

  // API Route: SSE Stream GET /api/v1/sensors/stream
  if (cleanUrl === '/api/v1/sensors/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`data: ${JSON.stringify(lastTelemetry)}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // API Route: GET /api/v1/marketplace/call-config
  if (cleanUrl === '/api/v1/marketplace/call-config' && req.method === 'GET') {
    loadEnv();
    const phone = process.env.FARMER_PHONE_NUMBER || process.env.ALERT_PHONE_NUMBER || '+919844775528';
    const hasKey = Boolean(process.env.CALLE_API_KEY && process.env.CALLE_API_KEY.trim());
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      configured: hasKey,
      phoneNumber: phone,
      apiUrl: process.env.CALLE_API_URL || 'https://api.heycall-e.com/v1/calls'
    }));
    return;
  }

  // API Route: POST /api/v1/marketplace/call-farmer
  if (cleanUrl === '/api/v1/marketplace/call-farmer' && req.method === 'POST') {
    loadEnv();
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        let payload = {};
        if (body.trim()) {
          try { payload = JSON.parse(body); } catch (e) {}
        }

        const apiKey = process.env.CALLE_API_KEY ? process.env.CALLE_API_KEY.trim() : '';
        const phone = (payload.phone || process.env.FARMER_PHONE_NUMBER || process.env.ALERT_PHONE_NUMBER || '+919844775528').trim();
        const apiUrl = process.env.CALLE_API_URL || 'https://api.heycall-e.com/v1/calls';

        if (!apiKey) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            success: false,
            error: 'CALLE_API_KEY is missing in your .env file.'
          }));
          return;
        }

        if (!phone) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            success: false,
            error: 'Target phone number is missing in .env (ALERT_PHONE_NUMBER or FARMER_PHONE_NUMBER).'
          }));
          return;
        }

        // Build live catalog summary from data/products.json
        let catalogSummary = `
1. SEEDS:
   - Hybrid Tomato F1 Seeds (Arka Rakshak): Rs. 450 per 50g packet (24 packets in stock, 98% germination, 35-40 tons/acre yield)
2. TRACTORS & MACHINERY:
   - Mahindra 575 DI Tractor (45 HP): Rs. 1,200 per hour rental (2 available today, includes rotavator & driver)
   - VST Shakti Power Tiller (13 HP): Rs. 900 per day (3 available, ideal for wet paddy puddling)
3. FERTILIZERS & SOIL NUTRIENTS:
   - Kaveri Organic Vermicompost & Enriched Manure: Rs. 350 per 50kg bag (80 bags in stock)
   - NPK 19:19:19 Water Soluble Fertilizer: Rs. 850 per 25kg bag (35 bags available)
4. PESTICIDES & CROP PROTECTION:
   - Neem Oil 10,000 PPM Bio-Pesticide: Rs. 520 per litre (45 bottles in stock, zero chemical residue)
5. IRRIGATION & TOOLS:
   - Drip Irrigation Lateral Kit (1 Acre Complete): Rs. 6,800 per kit (12 kits available)
   - Battery Backpack Sprayer (16L): Rs. 2,400 per piece (18 units in stock)
`;
        try {
          const productsFile = path.join(__dirname, 'data', 'products.json');
          if (fs.existsSync(productsFile)) {
            const rawProducts = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
            const keyItems = rawProducts.slice(0, 10).map(p =>
              `- [${p.category.toUpperCase()}] ${p.name}: Rs. ${p.price} per ${p.unit} (${p.quantityAvailable} available at ${p.location})`
            ).join('\n');
            if (keyItems) {
              catalogSummary = keyItems;
            }
          }
        } catch (err) {
          console.warn('[CATALOG BUILD] Fallback to default catalog:', err.message);
        }

        const bookingId = 'AGRI-BOOK-' + Math.floor(100 + Math.random() * 900);

        const taskPrompt = `Call ${phone} and speak with the farmer as the official AgriMarket Supply Chain AI Representative calling from Mandya APMC Yard, Karnataka.

Objective:
You are an intelligent voice assistant for the AgriMarket agricultural commerce and supply chain platform.
The farmer is inquiring about available agricultural commodities: seeds, fertilizers, pesticides, and machinery rentals (like tractors).

Knowledge Base (Current Live Inventory at Mandya APMC Hub):
${catalogSummary}

Conversation Guidelines:
1. Warm Greeting:
   Begin by greeting the farmer warmly:
   "Namaskara! I am your AgriMarket Supply Chain Voice Assistant calling from Mandya APMC. How can I assist your farm today — are you looking for seeds, fertilizers, pesticides, or machinery rentals like tractors?"
2. Price & Availability Enquiry:
   When the farmer asks about any commodity (such as "What seeds do you have?" or "How much is the tractor rental?" or "What fertilizers or pesticides are available?"):
   - Clearly state the commodity name, exact price in Rupees per unit, and stock quantity available.
   - Mention key specs if asked (e.g. Mahindra 575 DI Tractor is 45 HP with rotavator and driver included; Tomato seeds have 98% germination).
3. Price Agreement & Booking:
   If the farmer agrees to the price and wants to book/buy any commodity (for example: "Yes, book 2 packets of tomato seeds" or "Book the Mahindra tractor for 4 hours tomorrow"):
   - Confirm the agreed item, quantity, and total cost in Rupees.
   - Provide an immediate verbal confirmation:
     "Booking confirmed! Your order reference is ${bookingId}."
   - Confirm logistics:
     "Your order is scheduled for delivery and dispatch to your farm at Plot 4B Mandya. Payment can be settled via UPI or Kisan Credit Card upon delivery."
4. Wrap Up:
   - Ask politely if they need any other commodities (seeds, bio-pesticides, fertilizers, or tractor hours).
   - Thank the farmer and wish them a prosperous harvest!`;

        console.log(`[CALL-E] Initiating call to ${phone} with booking reference ${bookingId}...`);

        const requestPayload = {
          task: taskPrompt
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': `agri-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          },
          body: JSON.stringify(requestPayload)
        });

        const respText = await response.text();
        let respData;
        try {
          respData = JSON.parse(respText);
        } catch (e) {
          respData = { raw: respText };
        }

        if (!response.ok) {
          console.error('[CALL-E ERROR]', response.status, respData);
          let friendlyError = respData.message || (respData.error && respData.error.message) || respData.error || respData.raw || 'CALL-E API request failed';
          if (respData.error && respData.error.code === 'account_concurrency_exceeded') {
            friendlyError = 'A previous call is currently in progress or wrapping up on CALL-E trial line (max 1 call at a time). Please wait 15–20 seconds and click again!';
          }
          res.writeHead(response.status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            success: false,
            status: response.status,
            error: friendlyError
          }));
          return;
        }

        console.log('[CALL-E SUCCESS]', respData);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          callId: respData.id || respData.call_id || 'initiated',
          phoneNumber: phone,
          bookingId: bookingId,
          message: `Voice call dispatched successfully to ${phone}. Pick up your phone!`
        }));

      } catch (err) {
        console.error('[CALL-E DISPATCH ERROR]', err);
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API Route: GET /api/v1/gemma/status
  if (cleanUrl === '/api/v1/gemma/status' && req.method === 'GET') {
    Promise.allSettled([
      fetch(`http://127.0.0.1:${LITERT_PORT}/v1/models`).then(r => r.json()),
      fetch(`http://127.0.0.1:${TRANSLATOR_PORT}/api/volume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get' })
      }).then(r => r.json())
    ]).then(([litertResult, translatorResult]) => {
      const litertOnline = litertResult.status === 'fulfilled' && Boolean(litertResult.value && litertResult.value.data);
      const translatorOnline = translatorResult.status === 'fulfilled';
      const models = litertOnline ? litertResult.value.data.map(m => m.id) : [];

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        online: litertOnline && translatorOnline,
        litertPort: LITERT_PORT,
        litertOnline: litertOnline,
        translatorPort: TRANSLATOR_PORT,
        translatorOnline: translatorOnline,
        activeModel: models.includes('gemma4-e2b') ? 'gemma4-e2b' : (models[0] || 'offline'),
        models: models,
        sttProvider: 'Moonshine (On-Device)',
        ttsProvider: 'Kokoro / Moonshine Voice (On-Device)',
        offlineCapable: true
      }));
    }).catch(err => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        online: false,
        error: err.message
      }));
    });
    return;
  }

  // Reverse-proxy Gemma Translator API calls to Python backend
  if (cleanUrl === '/api/stt' || cleanUrl.startsWith('/api/stt') ||
      cleanUrl === '/api/tts' || cleanUrl.startsWith('/api/tts') ||
      cleanUrl === '/proxy' || cleanUrl.startsWith('/proxy') ||
      cleanUrl === '/api/volume' || cleanUrl.startsWith('/api/volume')) {
    proxyTo(TRANSLATOR_PORT, req, res);
    return;
  }

  // Reverse-proxy direct LLM chat completions to LiteRT-LM
  if (cleanUrl.startsWith('/api/gemma/v1/')) {
    req.url = req.url.replace('/api/gemma/v1/', '/v1/');
    proxyTo(LITERT_PORT, req, res);
    return;
  }

  // Serve Gemma Translator Web UI
  if (cleanUrl === '/translator' || cleanUrl.startsWith('/translator/')) {
    let subPath = cleanUrl.replace(/^\/translator\/?/, '');
    if (!subPath || subPath === '') subPath = 'index.html';
    const distPath = path.join(__dirname, 'gemma_translator', 'frontend', 'dist', subPath);
    if (fs.existsSync(distPath) && fs.statSync(distPath).isFile()) {
      const ext = path.extname(distPath).toLowerCase();
      const cType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': cType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(distPath).pipe(res);
      return;
    }
  }

  // Static File Serving
  let decodedPath = cleanUrl;
  try {
    decodedPath = decodeURIComponent(cleanUrl);
  } catch (e) {}
  if (decodedPath === '/') decodedPath = '/index.html';
  const filePath = path.join(__dirname, decodedPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Not Found</h1><p><a href="/">Return to AgriSense Dashboard</a></p>');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    }
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`[AGRISENSE] AgriSense & AgriMarket AI Platform Running!`);
    console.log(`[NETWORK]   Local Server URL: http://localhost:${port}`);
    console.log(`[TELEMETRY] Live Endpoint:    http://localhost:${port}/api/v1/sensors/telemetry`);
    console.log(`[STREAM]    Live SSE Stream:  http://localhost:${port}/api/v1/sensors/stream`);
    console.log(`======================================================\n`);

    // Ensure serial bridge is active
    startSerialBridge();
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, attempting port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(DEFAULT_PORT);

module.exports = server;
