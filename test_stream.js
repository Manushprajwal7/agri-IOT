const { spawn } = require('child_process');
const path = require('path');

const ps = spawn('powershell.exe', [
  '-NoProfile',
  '-ExecutionPolicy', 'Bypass',
  '-Command',
  `$port = New-Object System.IO.Ports.SerialPort 'COM3', 115200, None, 8, one; $port.ReadTimeout = 3000; $port.Open(); while($true) { try { $line = $port.ReadLine(); Write-Host $line } catch {} }`
]);

let count = 0;
ps.stdout.on('data', (d) => {
  const str = d.toString().trim();
  console.log('[NODE STREAM RECEIVED]:', str);
  count++;
  if (count >= 3) {
    console.log('SUCCESS! Received 3 lines from COM3.');
    ps.kill();
    process.exit(0);
  }
});

ps.stderr.on('data', (d) => {
  console.error('[NODE STREAM ERR]:', d.toString().trim());
});

setTimeout(() => {
  console.log('Timed out waiting for 3 lines');
  ps.kill();
  process.exit(0);
}, 6000);
