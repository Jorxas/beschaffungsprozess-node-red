// Prüft die gebaute Demo im echten Browser, wie sie auf GitHub Pages unter /beschaffungsprozess-node-red/ ausgeliefert wird.
//   node tools/bauen.cjs && node tools/browser-pruefen.cjs [--bild=ordner]
// Braucht puppeteer-core (NODE_PATH) und einen installierten Chrome oder Edge (BROWSER_PFAD).
// Prüft: eingebetteter Prozesscode entspricht src/prozess.cjs und liefert dieselben Ergebnisse wie der echte Node-Lauf,
// Deutsch als Standard, Wechsel auf Französisch und zurück, Bedienung des Prozesses, Laufzeitfehler, externe Anfragen,
// horizontalen Überlauf bei 390 px.
const fs = require("node:fs"), path = require("node:path"), http = require("node:http"), vm = require("node:vm"), crypto = require("node:crypto");
const assert = require("node:assert/strict");
const dist = path.resolve(__dirname, "../dist");
const projekt = path.resolve(__dirname, "..");
const bildOrdner = process.argv.find((a) => a.startsWith("--bild="))?.slice(7);
const BASIS = "/beschaffungsprozess-node-red";

// 1. Eingebetteter Code gegen das Original
{
  const huelle = fs.readFileSync(path.join(projekt, "demo/prozess-echt.js"), "utf8").replace(/\r\n/g, "\n");
  const lauf = (() => { const w = {}; vm.runInNewContext(fs.readFileSync(path.join(projekt, "demo/lauf-daten.js"), "utf8"), { window: w }); return w.LAUF; })();
  const quelle = fs.readFileSync(path.join(projekt, "src/prozess.cjs"), "utf8").replace(/\r\n/g, "\n");
  assert(huelle.includes(quelle), "src/prozess.cjs ist unverändert in demo/prozess-echt.js enthalten");
  assert.equal(crypto.createHash("sha256").update(quelle).digest("hex"), lauf.quelleSha256, "SHA-256 stimmt");
  const w = {};
  vm.runInNewContext(huelle, { window: w, structuredClone });
  const echt = require("../src/prozess.cjs");
  const eingabe = JSON.parse(JSON.stringify(lauf.antraege));
  const zp = "2026-11-23T10:00:00.000Z";
  const a = w.ProzessEcht.beispieleDurchlaufen(JSON.parse(JSON.stringify(eingabe)), zp);
  const b = echt.beispieleDurchlaufen(JSON.parse(JSON.stringify(eingabe)), zp);
  assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), "Browserfassung und Node-Fassung liefern dasselbe");
  const gelaufen = JSON.parse(lauf.schritte[0].stdout).ergebnisse;
  assert.deepEqual(a.map((r) => r.antrag.zustand), gelaufen.map((r) => r.antrag.zustand), "Zustände wie im aufgezeichneten Lauf");
  assert.deepEqual(a.map((r) => r.antrag.aenderungen.length), gelaufen.map((r) => r.antrag.aenderungen.length));
  console.log("Eingebetteter Prozesscode entspricht src/prozess.cjs und dem aufgezeichneten Lauf.");
}

const typen = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json" };
const server = http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, "http://x").pathname);
  if (!p.startsWith(BASIS + "/")) { r.statusCode = 404; return r.end("nicht gefunden"); }
  p = p.slice(BASIS.length) || "/";
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(dist, p);
  if (!f.startsWith(dist) || !fs.existsSync(f)) { r.statusCode = 404; return r.end("nicht gefunden"); }
  r.setHeader("Content-Type", typen[path.extname(f)] || "application/octet-stream");
  r.end(fs.readFileSync(f));
});
const puppeteer = require("puppeteer-core");
const browserPfad = process.env.BROWSER_PFAD || ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((f) => fs.existsSync(f));
if (!browserPfad) throw new Error("BROWSER_PFAD auf einen installierten Chrome oder Edge setzen.");
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const basis = `http://127.0.0.1:${server.address().port}${BASIS}/`;
  const browser = await puppeteer.launch({ executablePath: browserPfad, headless: true });
  const fehler = [], extern = [];
  if (bildOrdner) fs.mkdirSync(bildOrdner, { recursive: true });
  try {
    const s = await browser.newPage();
    s.on("pageerror", (e) => fehler.push("Seitenfehler: " + e.message));
    s.on("console", (m) => { if (m.type() === "error") fehler.push("Konsole: " + m.text()); });
    s.on("requestfailed", (r) => fehler.push("Anfrage fehlgeschlagen: " + r.url()));
    s.on("response", (r) => { if (r.status() >= 400) fehler.push(`HTTP ${r.status()}: ${r.url()}`); });
    s.on("request", (r) => { if (!r.url().startsWith("data:") && new URL(r.url()).hostname !== "127.0.0.1") extern.push(r.url()); });
    const text = () => s.$eval("body", (e) => e.innerText);
    const meldung = () => s.$eval("#meldung", (e) => e.innerText);
    const protokoll = () => s.$$eval("#protokoll li:not(.leer)", (l) => l.length);
    const lang = () => s.$eval("html", (e) => e.lang);
    const ueberlauf = () => s.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    const ausfuehren = async () => { await s.click('#aktionsform button[type="submit"]'); await warte(50); };
    const setze = async (sel, wert) => { await s.$eval(sel, (e) => { e.focus(); e.select(); }); await s.keyboard.press("Backspace"); if (wert) await s.type(sel, wert); await warte(50); };

    // Deutsch als Standard
    await s.setViewport({ width: 1280, height: 900 });
    await s.goto(basis, { waitUntil: "networkidle0" });
    assert.equal(await lang(), "de-DE");
    assert.equal(await s.title(), "Beschaffungsprozess Demo");
    let t = (await text()).toLowerCase();
    for (const w of ["Beschaffung mit nachvollziehbarer Freigabe", "Aufgabe", "Ergebnis", "Grenzen", "Ausgabe eines echten Laufs des Projekts", "Alle fünf Beispielanträge", "Selbstfreigabe"])
      assert(t.includes(w.toLowerCase()), `Deutsch: "${w}" fehlt`);
    assert(t.includes("vorhandener endzustand erhalten"), "Gesamtlauf zeigt Hinweise des Codes");
    assert.equal(await s.$$eval("#alle tbody tr", (r) => r.length), 5);
    assert.equal(await s.$eval('[data-lang="de"]', (b) => b.getAttribute("aria-pressed")), "true");
    if (bildOrdner) await s.screenshot({ path: path.join(bildOrdner, "desktop-de.png"), fullPage: true });

    // A01: einreichen, genehmigen, dann abgewiesen
    assert((await meldung()).includes("Noch keine Aktion"));
    await ausfuehren();
    assert((await meldung()).includes("Entwurf → Eingereicht"), "Einreichen erlaubt");
    assert.equal(await protokoll(), 1);
    await ausfuehren();
    assert((await meldung()).includes("Eingereicht → Genehmigt"), "Genehmigen erlaubt");
    assert.equal(await protokoll(), 2);
    assert((await s.$eval("#protokoll", (e) => e.innerText)).includes("Betrag bis einschließlich 500 EUR; Bedarf begründet; Budget verfügbar"));
    assert.equal(await s.$eval('.z-knoten[data-aktuell="ja"]', (e) => e.innerText), "Genehmigt");
    await s.select("#aktion", "einreichen");
    await ausfuehren();
    assert((await meldung()).includes("Aktion ist im aktuellen Zustand nicht erlaubt."), "Endzustand schützt");
    assert.equal(await protokoll(), 2, "Protokoll unverändert nach Abweisung");

    // A02: Selbstfreigabe, falsche Rolle, fehlende Begründung, Budget fehlt, Betragsgrenze
    await s.select("#antrag", "A02");
    assert.equal(await protokoll(), 0);
    await s.select("#person", "antragsteller");
    await ausfuehren();
    assert((await meldung()).includes("Selbstfreigabe und eigene Ablehnung sind unzulässig."), "Selbstfreigabe abgewiesen");
    await s.select("#person", "pruefer");
    await s.select("#rolle", "antragsteller");
    await ausfuehren();
    assert((await meldung()).includes("Person oder Rolle ist unzulässig."), "falsche Rolle abgewiesen");
    await s.select("#rolle", "freigabeverantwortlicher");
    await setze("#begruendung", "");
    await ausfuehren();
    assert((await meldung()).includes("Eine Begründung ist erforderlich."));
    await setze("#begruendung", "Test");
    await s.click("#budget");
    await ausfuehren();
    assert((await meldung()).includes("Entscheidung widerspricht Betrag, Bedarf oder Budget."), "Genehmigung ohne Budget abgewiesen");
    await s.select("#aktion", "ablehnen");
    await ausfuehren();
    assert((await meldung()).includes("Eingereicht → Abgelehnt"), "Ablehnung wegen fehlendem Budget erlaubt");
    assert((await s.$eval("#protokoll", (e) => e.innerText)).includes("Budget nicht verfügbar"));

    // Eigener Antrag: Grenze inklusive, darüber, ungültiger Betrag
    await s.select("#antrag", "eigen");
    await s.select("#eigen-zustand", "eingereicht");
    await setze("#eigen-betrag", "500");
    await s.select("#aktion", "genehmigen");
    await ausfuehren();
    assert((await meldung()).includes("Eingereicht → Genehmigt"), "500 Euro genau auf der Grenze genehmigt");
    await setze("#eigen-betrag", "500,01");
    await s.select("#aktion", "genehmigen");
    await ausfuehren();
    assert((await meldung()).includes("Entscheidung widerspricht"), "500,01 Euro nicht genehmigbar");
    await setze("#eigen-betrag", "1,001");
    await ausfuehren();
    assert((await meldung()).includes("Betrag muss positiv, endlich und centgenau sein."), "Betrag mit drei Nachkommastellen abgewiesen");
    await setze("#eigen-betrag", "250");

    // Wechsel auf Französisch (Fehlermeldung bleibt sichtbar und wird übersetzt)
    await s.select("#aktion", "genehmigen");
    await s.select("#person", "antragsteller");
    await ausfuehren();
    await s.click('[data-lang="fr"]');
    await warte(100);
    assert.equal(await lang(), "fr-FR");
    assert(s.url().includes("lang=fr"));
    assert.equal(await s.title(), "Démo processus d'achat");
    t = (await text()).toLowerCase();
    for (const w of ["Achats avec validation traçable", "Tâche", "Données", "Limites", "Sortie d'une vraie exécution du projet", "Les cinq demandes d'exemple"])
      assert(t.includes(w.toLowerCase()), `Französisch: "${w}" fehlt`);
    assert(!t.includes("beschaffung mit nachvollziehbarer freigabe"), "keine deutsche Überschrift mehr");
    assert((await meldung()).includes("L'auto-validation et l'auto-rejet sont interdits."), "Fehlermeldung übersetzt");
    assert((await meldung()).includes("Message d'origine : Selbstfreigabe"), "Originalmeldung bleibt erkennbar");
    assert.equal(await s.$eval("#antrag", (e) => e.value), "eigen", "Auswahl bleibt beim Sprachwechsel");
    assert.equal(await s.$eval('[data-lang="fr"]', (b) => b.getAttribute("aria-pressed")), "true");
    assert((await s.$eval("#alle", (e) => e.innerText)).includes("État final existant conservé"));
    assert(/1\s500,00/.test(await s.$eval("#alle", (e) => e.innerText)), "Betrag im französischen Format");
    if (bildOrdner) await s.screenshot({ path: path.join(bildOrdner, "desktop-fr.png"), fullPage: true });

    // Zurück auf Deutsch
    await s.click('[data-lang="de"]');
    await warte(100);
    assert.equal(await lang(), "de-DE");
    assert(!s.url().includes("lang="));
    assert((await text()).toLowerCase().includes("aufgabe"));
    assert((await s.$eval("#alle", (e) => e.innerText)).includes("1.500,00"), "Betrag im deutschen Format");

    // Direktaufruf ?lang=fr und Tastatur
    await s.goto(basis + "?lang=fr", { waitUntil: "networkidle0" });
    assert.equal(await lang(), "fr-FR");
    await s.goto(basis, { waitUntil: "networkidle0" });
    await s.keyboard.press("Tab"); await s.keyboard.press("Tab"); await s.keyboard.press("Tab");
    assert.equal(await s.evaluate(() => document.activeElement.getAttribute("data-lang")), "fr");
    await s.keyboard.press("Enter");
    await warte(100);
    assert.equal(await lang(), "fr-FR");

    // Handy 390 px
    await s.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await s.goto(basis, { waitUntil: "networkidle0" });
    assert.equal(await ueberlauf(), false, "Überlauf auf dem Handy (DE)");
    await ausfuehren(); await ausfuehren();
    assert.equal(await ueberlauf(), false, "Überlauf nach Bedienung (DE)");
    if (bildOrdner) await s.screenshot({ path: path.join(bildOrdner, "handy-de.png"), fullPage: true });
    await s.goto(basis + "?lang=fr", { waitUntil: "networkidle0" });
    await ausfuehren(); await ausfuehren(); await ausfuehren();
    assert.equal(await ueberlauf(), false, "Überlauf auf dem Handy (FR)");
    if (bildOrdner) await s.screenshot({ path: path.join(bildOrdner, "handy-fr.png"), fullPage: true });
  } finally { await browser.close(); server.close(); }
  assert.deepEqual(fehler, [], "keine Laufzeitfehler");
  assert.deepEqual(extern, [], "keine externen Anfragen");
  console.log("Browserprüfung bestanden: Deutsch als Standard, Wechsel auf Französisch und zurück, Prozess bedienen, 390 px ohne Überlauf, keine Fehler, keine externen Anfragen.");
})().catch((e) => { console.error(e); process.exitCode = 1; server.close(); });
