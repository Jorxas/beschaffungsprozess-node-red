// Zusatzvariante: unveränderten P12-Fachkern über echte Node-RED-Knoten ausführen.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { beispieleDurchlaufen } = require('../fachkern/src/prozess.cjs');
const { planen } = require('../fachkern/src/erp_export.cjs');
const beispiele = require('../fachkern/beispieldaten/antraege.json');
const pruefsumme = daten => crypto.createHash('sha256').update(JSON.stringify(daten)).digest('hex');

function erstellen(ausgabe) {
  const datei = path.join(ausgabe, 'vorfuehrung.json');
  function lesen() {
    if (!fs.existsSync(datei)) return null;
    const stand = JSON.parse(fs.readFileSync(datei, 'utf8'));
    if (stand.sha256 !== pruefsumme(stand.daten)) throw Error('Gespeicherte Vorführung ist beschädigt.');
    return stand.daten;
  }
  return {
    lesen,
    vorbereiten(eingang = {}) {
      if (!eingang || Array.isArray(eingang) || typeof eingang !== 'object'
        || Object.keys(eingang).length) throw Error('Nur ein leeres JSON-Objekt für die feste synthetische Vorführung zulässig.');
      const eingangspruefsumme = pruefsumme(beispiele);
      const vorher = lesen();
      if (vorher) {
        if (vorher.eingangspruefsumme !== eingangspruefsumme) throw Error('Beispieldaten geändert: neue getrennte Ausgabe verwenden.');
        return { wiederverwendet: true, daten: vorher };
      }
      return { wiederverwendet: false, daten: { eingangspruefsumme,
        ausgefuehrt_am: new Date().toISOString(),
        ergebnisse: beispieleDurchlaufen(beispiele) } };
    },
    exportieren(vorbereitung) {
      if (!vorbereitung.wiederverwendet) {
        const plan = planen(vorbereitung.daten.ergebnisse);
        vorbereitung.daten.export = plan.speicher;
        vorbereitung.daten.befunde = plan.befunde;
      }
      return vorbereitung;
    },
    sichern(vorbereitung) {
      fs.mkdirSync(ausgabe, { recursive: true });
      const vorher = lesen();
      // Ein Prozess, synchroner Schreibschritt. Gleichzeitige Vorführungen übernehmen den ersten Stand.
      if (vorher) {
        if (vorher.eingangspruefsumme !== vorbereitung.daten.eingangspruefsumme) throw Error('Widersprüchliche Eingänge.');
        return { wiederverwendet: true, daten: vorher };
      }
      const daten = vorbereitung.daten;
      if (!daten.export) throw Error('Exportprüfung fehlt.');
      const zwischen = datei + '.' + process.pid + '.neu';
      try {
        fs.writeFileSync(zwischen, JSON.stringify({ sha256: pruefsumme(daten), daten }, null, 2) + '\n', { flag: 'wx' });
        fs.renameSync(zwischen, datei);
      } finally {
        if (fs.existsSync(zwischen)) fs.unlinkSync(zwischen);
      }
      return { wiederverwendet: false, daten };
    }
  };
}
module.exports = { erstellen };
