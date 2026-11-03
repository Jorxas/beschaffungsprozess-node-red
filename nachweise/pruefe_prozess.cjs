// Kleine ausführbare Abnahme für P12-T02, ausschließlich synthetische Daten.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { ausMomentaufnahme, uebergang, beispieleDurchlaufen } = require("../src/prozess.cjs");
const eingabe = fs.readFileSync(path.join(__dirname, "../beispieldaten/antraege.json"));
const pruefsumme = crypto.createHash("sha256").update(eingabe).digest("hex");
assert.equal(pruefsumme, "3a32b603fa52824ed32e0483c576398737f050e6a46effa2ce367ccbab438fb8");
const originale = JSON.parse(eingabe);
const vorher = JSON.stringify(originale);
const zeitpunkt = new Date().toISOString();
const ergebnisse = beispieleDurchlaufen(originale, zeitpunkt);
assert.equal(ergebnisse.length, 5);
assert.deepEqual(ergebnisse.map(({ antrag }) => antrag.zustand), ["genehmigt", "genehmigt", "genehmigt", "abgelehnt", "entwurf"]);
assert.deepEqual(ergebnisse.map(({ antrag }) => antrag.aenderungen.length), [2, 1, 0, 0, 0]);
assert.match(ergebnisse[4].fehler, /Betrag muss positiv/);
assert.equal(JSON.stringify(originale), vorher);
console.log(`P12-T02: BESTANDEN; Node ${process.version}; Prüfzeit ${zeitpunkt}`);
console.log(`Originale: 5; SHA256 ${pruefsumme}; unverändert.`);
console.log("A01: entwurf → eingereicht → genehmigt; 2 neue Änderungen.");
console.log("A02: eingereicht → genehmigt; 1 neue Änderung.");
console.log("A03/A04: vorhandene Endzustände erhalten; jeweils 0 neue Änderungen, Historie unbekannt.");
console.log("A05: Einreichung verhindert; bleibt entwurf; 0 Änderungen.");

function aktion(art, antrag, zusatz = {}) {
  return { art, zeitpunkt, begruendung: "Ausdrücklich synthetischer Regeltest",
    person: { kennung: art === "einreichen" ? antrag.antragsteller : "synthetisch-pruefer",
      rolle: art === "einreichen" ? "antragsteller" : "freigabeverantwortlicher" },
    bedarf_begruendet: true, budget_verfuegbar: true, ...zusatz };
}

// Frische Testkopien sind keine nachträgliche Historie der Originale A03/A04.
const regeltests = [];
for (const [kennung, betrag, zusatz, ziel, grund] of [
  ["A03", 500, {}, "genehmigt", /bis einschließlich 500/],
  ["A04", 1500, {}, "abgelehnt", /Betragsgrenze/],
  ["A02", 250, { budget_verfuegbar: false }, "abgelehnt", /Budget nicht verfügbar/],
  ["A01", 50, { bedarf_begruendet: false }, "abgelehnt", /Bedarf nicht begründet/],
]) {
  const entwurf = ausMomentaufnahme({ ...originale.find((antrag) => antrag.id === kennung), zustand: "entwurf" });
  assert.equal(entwurf.betrag, betrag);
  const eingereicht = uebergang(entwurf, aktion("einreichen", entwurf));
  const entschieden = uebergang(eingereicht, aktion(ziel === "genehmigt" ? "genehmigen" : "ablehnen", eingereicht, zusatz));
  assert.equal(entschieden.zustand, ziel);
  assert.equal(entwurf.zustand, "entwurf");
  assert.equal(entwurf.aenderungen.length, 0);
  assert.equal(entschieden.aenderungen.length, 2);
  const spur = entschieden.aenderungen[1];
  assert.match(spur.entscheidungskriterium, grund);
  assert.equal(spur.betrag, betrag);
  assert.equal(spur.person.rolle, "freigabeverantwortlicher");
  assert.notEqual(spur.person.kennung, entschieden.antragsteller);
  assert.equal(spur.zeitpunkt, zeitpunkt);
  assert.ok(spur.begruendung.length > 0);
  assert.throws(() => uebergang(entschieden, aktion("einreichen", entschieden)), /Zustand/);
  regeltests.push(entschieden);
}

const eingereicht = ausMomentaufnahme(originale[1]);
const sicherung = JSON.stringify(eingereicht);
assert.throws(() => uebergang(eingereicht, aktion("genehmigen", eingereicht,
  { person: { kennung: eingereicht.antragsteller, rolle: "freigabeverantwortlicher" } })), /Selbstfreigabe/);
assert.throws(() => uebergang(eingereicht, aktion("genehmigen", eingereicht,
  { person: { kennung: "fremd", rolle: "antragsteller" } })), /Rolle/);
assert.throws(() => uebergang(eingereicht, aktion("genehmigen", eingereicht, { begruendung: " " })), /Begründung/);
assert.throws(() => uebergang(eingereicht, aktion("genehmigen", eingereicht, { bedarf_begruendet: "ja" })), /Wahrheitswerte/);
assert.throws(() => uebergang(eingereicht, aktion("genehmigen", eingereicht, { zeitpunkt: "2026-02-30T00:00:00.000Z" })), /Zeitpunkt/);
assert.throws(() => uebergang(eingereicht, aktion("ablehnen", eingereicht)), /widerspricht/);
assert.throws(() => uebergang({ ...eingereicht, betrag: 1500 }, aktion("genehmigen", eingereicht)), /widerspricht/);
for (const betrag of [0, -5, 1.001, NaN, Infinity, "50"]) {
  assert.throws(() => uebergang({ ...eingereicht, betrag }, aktion("genehmigen", eingereicht)), /Betrag/);
}
const entwurf = ausMomentaufnahme(originale[0]);
assert.throws(() => uebergang(entwurf, aktion("einreichen", entwurf,
  { person: { kennung: "fremd", rolle: "antragsteller" } })), /Nur der Antragsteller/);
const frischEingereicht = uebergang(entwurf, aktion("einreichen", entwurf));
assert.throws(() => uebergang(frischEingereicht, aktion("genehmigen", frischEingereicht,
  { zeitpunkt: "2020-01-01T00:00:00.000Z" })), /vor der letzten/);
assert.equal(JSON.stringify(eingereicht), sicherung);
assert.equal(JSON.stringify(originale), vorher);
console.log("BESTANDEN: synthetische Testkopien für inklusive Grenze, Betragsablehnung, fehlendes Budget und fehlenden Bedarf.");
console.log("BESTANDEN: Rollen/Personen, Selbstfreigabe, Begründung, Entscheidung, Betrag, Zeitfolge, Endzustände und unveränderte Eingaben.");
fs.writeFileSync(path.join(__dirname, "P12-T02-ergebnisse.json"), JSON.stringify({
  pruefzeit: zeitpunkt, laufzeit: process.version, eingabe_sha256: pruefsumme,
  hinweis: "Lokale synthetische Ausführung; Testkopien sind keine Historie und kein Produktnachweis.",
  originaldurchlauf: ergebnisse, synthetische_regeltests: regeltests,
}, null, 2) + "\n", "utf8");
