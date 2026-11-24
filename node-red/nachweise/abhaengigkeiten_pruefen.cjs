const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
// Konstanter Windows-Befehl ohne Benutzereingaben oder interpolierte Argumente.
const lauf = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', 'npm audit --omit=dev --json'], {
  cwd: path.resolve(__dirname, '..'), encoding: 'utf8', windowsHide: true, timeout: 60000
});
if (lauf.error) throw lauf.error;
const audit = JSON.parse(lauf.stdout);
const bericht = { zeitpunkt: new Date().toISOString(),
  nodeRed: require('../package.json').dependencies['node-red'],
  metadaten: audit.metadata, fehler: audit.error || null };
fs.writeFileSync(path.join(__dirname, 'npm-audit.json'), JSON.stringify(bericht, null, 2) + '\n');
console.log(JSON.stringify(bericht, null, 2));
process.exitCode = lauf.status;
