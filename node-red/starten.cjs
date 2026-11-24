const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const benutzerordner = path.join(__dirname, '.laufzeit');
fs.mkdirSync(benutzerordner, { recursive: true });
const lauf = spawn(process.execPath, [require.resolve('node-red/red.js'),
  '--settings', path.join(__dirname, 'einstellungen.cjs'), '--userDir', benutzerordner,
  '--port', '18812', path.join(__dirname, 'ablauf.json')], { stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => lauf.kill(signal));
lauf.on('exit', code => { process.exitCode = code || 0; });
lauf.on('error', fehler => { console.error('Start fehlgeschlagen:', fehler.message); process.exitCode = 1; });
