/** Echte lokale Dateiabläufe; ausdrücklich kein Produktlauf. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {beispieleDurchlaufen}=require('../src/prozess.cjs');
const {planen,dateiVorbereiten}=require('../src/erp_export.cjs');
const projekt=path.resolve(__dirname,'..'),quelle=path.join(projekt,'beispieldaten/antraege.json');
const roh=fs.readFileSync(quelle),originale=JSON.parse(roh),zeit=new Date().toISOString();
assert.equal(originale.length,5);
assert.equal(crypto.createHash('sha256').update(roh).digest('hex'),'3a32b603fa52824ed32e0483c576398737f050e6a46effa2ce367ccbab438fb8');
const ergebnisse=beispieleDurchlaufen(originale,zeit),eingang=JSON.stringify(ergebnisse);
const neu=planen(ergebnisse);
assert.deepEqual(neu.speicher.eintraege.map(e=>e.daten.antrag_id),['A01','A02']);
assert.deepEqual(neu.speicher.eintraege.map(e=>e.daten.betrag_cent),[5000,25000]);
assert.match(neu.befunde.find(b=>b.antrag==='A03').grund,/ohne neue/);
assert.equal(neu.befunde.filter(b=>b.status==='ausgelassen').length,3);
assert.deepEqual(planen(ergebnisse,JSON.parse(JSON.stringify(neu.speicher))).speicher,neu.speicher);
assert.equal(planen(ergebnisse,neu.speicher).befunde.filter(b=>b.status==='bereits-vorbereitet').length,2);
assert.equal(JSON.stringify(ergebnisse),eingang);
const konflikt=structuredClone(ergebnisse);konflikt[0].antrag.aenderungen.at(-1).begruendung='Geänderter fachlicher Inhalt';
assert.throws(()=>planen(konflikt,neu.speicher),/Exportkonflikt/);
const selbst=structuredClone(ergebnisse);selbst[0].antrag.aenderungen.at(-1).person.kennung=selbst[0].antrag.antragsteller;
assert.throws(()=>planen(selbst),/Freigabespur/);
const betrag=structuredClone(ergebnisse);betrag[0].antrag.betrag=0.001;
assert.throws(()=>planen(betrag),/Exportbetrag/);
assert.throws(()=>planen([...ergebnisse,ergebnisse[0]]),/doppelt/);
const defekt=structuredClone(neu.speicher);defekt.eintraege[0].daten.betrag_cent=1;
assert.throws(()=>planen(ergebnisse,defekt),/beschädigt/);
const ausgabe=path.join(projekt,'ausgabe');fs.mkdirSync(ausgabe,{recursive:true});
const bereich=fs.mkdtempSync(path.join(ausgabe,'exportpruefung-'));
const eingangsdatei=path.join(bereich,'eingang.json'),ziel=path.join(bereich,'export.json');
fs.writeFileSync(eingangsdatei,JSON.stringify({ergebnisse},null,2));
dateiVorbereiten(eingangsdatei,ziel);const erster=fs.readFileSync(ziel);
dateiVorbereiten(eingangsdatei,ziel);assert.deepEqual(fs.readFileSync(ziel),erster);
fs.writeFileSync(eingangsdatei,JSON.stringify({ergebnisse:konflikt}));
assert.throws(()=>dateiVorbereiten(eingangsdatei,ziel),/Exportkonflikt/);
assert.deepEqual(fs.readFileSync(ziel),erster);
assert.throws(()=>dateiVorbereiten(eingangsdatei,eingangsdatei),/verschieden/);
assert.deepEqual(fs.readFileSync(quelle),roh);
const nachweis={zeitpunkt:new Date().toISOString(),erfolgreich:true,ausfuehrung:'Nur lokaler Prozess und eigener Exportvertrag; keine Power-Automate-, SharePoint- oder SAP-Ausführung.',
  quellhash:crypto.createHash('sha256').update(roh).digest('hex'),originale:5,befunde:neu.befunde,export:neu.speicher,
  pruefungen:['Fünf Originalanträge unverändert','Nur A01/A02 mit neuer Freigabespur exportiert','A03 ohne Historie zurückgehalten','Ablehnung und Fehler ausgelassen','Wiederholung nach JSON-Neuladen ohne Duplikat','Konflikt erhält Datei bytegleich','Selbstfreigabe und falscher Betrag abgewiesen','Doppelter Eingang und beschädigter Speicher abgewiesen','Eigene Quelldatei nicht überschreibbar'],
  dateipruefung:bereich};
fs.writeFileSync(path.join(__dirname,'P12-erp-export-pruefung.json'),JSON.stringify(nachweis,null,2)+'\n');
console.log('Bestanden: fünf Originale, zwei vorbereitete Exporte, Wiederholung ohne Duplikat und Konfliktschutz. Keine Produktausführung.');
