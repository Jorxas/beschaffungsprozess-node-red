// Tatsächliche Node-RED-Laufzeit starten, HTTP-Knoten durchlaufen und nur eigene Prozesse beenden.
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const projekt = path.resolve(__dirname, '..');
const beginn = new Date().toISOString();
const ordner = path.join(__dirname, 'lauf-' + beginn.replace(/[:.]/g, '-') + '-' + process.pid);
fs.mkdirSync(ordner, { recursive: true });
const ausgabe = path.join(ordner, 'ausgabe');
const datei = path.join(ausgabe, 'vorfuehrung.json');
const belege = [];
let lauf;
let log = '';
async function stoppen() {
  if (!lauf || lauf.exitCode !== null || lauf.signalCode !== null) return;
  const beendet = once(lauf, 'exit');
  lauf.kill();
  await beendet;
}
async function starten() {
  const reservierung = net.createServer();
  reservierung.listen(0, '127.0.0.1');
  await once(reservierung, 'listening');
  const port = reservierung.address().port;
  await new Promise(fertig => reservierung.close(fertig));
  lauf = spawn(process.execPath, [require.resolve('node-red/red.js'), '--settings',
    path.join(projekt, 'einstellungen.cjs'), '--userDir', path.join(ordner, 'laufzeit'),
    '--port', String(port), path.join(projekt, 'ablauf.json')], {
    cwd: projekt, env: { ...process.env, P12_NODE_RED_AUSGABE: ausgabe },
    windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
  });
  lauf.stdout.on('data', daten => { log += daten; });
  lauf.stderr.on('data', daten => { log += daten; });
  const basis = 'http://127.0.0.1:' + port;
  for (let versuch = 0; versuch < 200; versuch++) {
    if (lauf.exitCode !== null) throw Error('Node-RED wurde vorzeitig beendet: ' + log);
    try {
      const antwort = await fetch(basis + '/gesundheit', { signal: AbortSignal.timeout(1000) });
      if (antwort.ok) return basis;
    } catch {}
    await new Promise(fertig => setTimeout(fertig, 100));
  }
  throw Error('Node-RED wurde nicht rechtzeitig bereit: ' + log);
}
async function pruefen() {
  let basis = await starten();
  const aufrufen = async daten => {
    const antwort = await fetch(basis + '/beschaffung/vorfuehren', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(daten), signal: AbortSignal.timeout(5000)
    });
    return { status: antwort.status, daten: await antwort.json() };
  };
  assert.equal((await fetch(basis + '/editor/')).status, 200);
  assert.equal((await fetch(basis + '/beschaffung/stand')).status, 404);
  belege.push('Editor erreichbar; vor erster Ausführung kein gespeicherter Stand.');
  assert.equal((await aufrufen({ unzulaessig: true })).status, 400);
  assert.equal(fs.existsSync(datei), false);
  belege.push('Unzulässiger HTTP-Eingang abgewiesen; keine Ausgabe angelegt.');
  const antworten = await Promise.all(Array.from({ length: 5 }, () => aufrufen({})));
  assert(antworten.every(antwort => antwort.status === 200));
  assert.equal(antworten.filter(antwort => !antwort.daten.wiederverwendet).length, 1);
  const stand = antworten[0].daten.daten;
  assert.equal(stand.ergebnisse.length, 5);
  assert.deepEqual(stand.export.eintraege.map(e => e.daten.antrag_id), ['A01', 'A02']);
  assert.deepEqual(stand.export.eintraege.map(e => e.daten.betrag_cent), [5000, 25000]);
  assert.match(stand.ergebnisse.find(e => e.antrag.id === 'A05').fehler, /positiv/);
  assert.equal(stand.ergebnisse.find(e => e.antrag.id === 'A04').antrag.aenderungen.length, 0);
  belege.push('Fünf gleichzeitige Aufrufe: ein Stand, zwei gültige Exporte, negativer Betrag blockiert, alte Historie nicht erfunden.');
  const vorher = fs.readFileSync(datei);
  await stoppen();
  basis = await starten();
  const wiederholung = await aufrufen({});
  assert.equal(wiederholung.status, 200);
  assert.equal(wiederholung.daten.wiederverwendet, true);
  assert.deepEqual(wiederholung.daten.daten, stand);
  assert.deepEqual(fs.readFileSync(datei), vorher);
  belege.push('Nach echtem Laufzeitneustart: gleiche Zeitstempel und bytegleiche Ausgabe, keine Doppelverarbeitung.');
  const beschaedigt = JSON.parse(vorher);
  beschaedigt.daten.export.eintraege[0].daten.betrag_cent++;
  fs.writeFileSync(datei, JSON.stringify(beschaedigt));
  assert.equal((await aufrufen({})).status, 400);
  assert.equal((await fetch(basis + '/beschaffung/stand')).status, 500);
  belege.push('Beschädigte gespeicherte Datei erkannt; kein stilles Überschreiben.');
}
(async () => {
  let fehler;
  try { await pruefen(); } catch (grund) { fehler = grund; }
  finally { await stoppen(); fs.writeFileSync(path.join(ordner, 'laufzeit.log'), log); }
  const bericht = { beginn, ende: new Date().toISOString(), erfolgreich: !fehler,
    versionen: { node: process.version, nodeRed: require('node-red/package.json').version },
    belege, laufzeit_beendet: !lauf || lauf.exitCode !== null || lauf.signalCode !== null,
    fehler: fehler?.stack || null, ordner };
  fs.writeFileSync(path.join(__dirname, 'letzte-pruefung.json'), JSON.stringify(bericht, null, 2) + '\n');
  console.log(JSON.stringify(bericht, null, 2));
  if (fehler) process.exitCode = 1;
})();
