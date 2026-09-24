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
  '.ico': 'image/x-icon'
};

const TELEMETRY_FILE = path.join(__dirname, 'data', 'live_telemetry.json');

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

  // Static File Serving
  if (cleanUrl === '/') cleanUrl = '/index.html';
  const filePath = path.join(__dirname, cleanUrl);
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
