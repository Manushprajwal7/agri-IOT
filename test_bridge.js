const { spawn } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'serial_bridge.ps1');
const ps = spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-File', scriptPath]);

console.log('Spawning PowerShell serial bridge...');

ps.stdout.on('data', (data) => {
  const text = data.toString();
  console.log('STDOUT FROM BRIDGE:', text.trim());
});

ps.stderr.on('data', (data) => {
  console.error('STDERR FROM BRIDGE:', data.toString().trim());
});

ps.on('close', (code) => {
  console.log(`Bridge exited with code ${code}`);
});

setTimeout(() => {
  console.log('Stopping test after 4 seconds...');
  ps.kill();
  process.exit(0);
}, 4000);
