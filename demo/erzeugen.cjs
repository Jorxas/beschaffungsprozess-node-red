// Erzeugt die Daten der Demo aus echten Läufen des Projekts.
//   node demo/erzeugen.cjs
// Der veröffentlichte Projektstand wird in einen Temporärordner kopiert; die Skripte des Projekts laufen nur dort,
// damit Eingaben und abgeleitete Dateien des Repositorys unverändert bleiben.
// Geschrieben werden:
//   demo/prozess-echt.js   src/prozess.cjs, unverändert eingebettet und im Browser ausführbar gemacht
//   demo/lauf-daten.js     Beispielanträge, Vertrag und die echten Ausgaben der Projektskripte
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), crypto = require("node:crypto");
const { execFileSync, spawnSync } = require("node:child_process");

const projekt = path.resolve(__dirname, "..");
const demo = __dirname;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "beschaffung-"));
const arbeit = path.join(tmp, "projekt");

// Projektstand wie im Repository gespeichert (LF) kopieren.
for (const datei of execFileSync("git", ["ls-files"], { cwd: projekt, encoding: "utf8" }).split(/\r?\n/).filter(Boolean)) {
  if (datei.startsWith("demo/") || datei.startsWith("tools/")) continue;
  const ziel = path.join(arbeit, datei);
  fs.mkdirSync(path.dirname(ziel), { recursive: true });
  let inhalt = fs.readFileSync(path.join(projekt, datei));
  if (/\.(json|cjs|py|md)$/.test(datei)) inhalt = Buffer.from(inhalt.toString("utf8").replace(/\r\n/g, "\n"), "utf8");
  fs.writeFileSync(ziel, inhalt);
}

function lauf(befehl, args, anzeige) {
  const r = spawnSync(befehl, args, { cwd: arbeit, encoding: "utf8", env: { ...process.env, PYTHONUTF8: "1" } });
  if (r.status !== 0) throw new Error(`${anzeige} fehlgeschlagen:\n${r.stdout}\n${r.stderr}`);
  const bereinigt = (s) => s.replace(/\r/g, "").trim().replace(/[A-Za-z]:[\\/][^\s"']+/g, "<Pfad entfernt>");
  return { befehl: anzeige, rueckgabecode: r.status, stdout: bereinigt(r.stdout), stderr: bereinigt(r.stderr) };
}

const pythonVersion = execFileSync("python", ["-X", "utf8", "-c", "import platform;print(platform.python_version())"], { encoding: "utf8" }).trim();
const schritte = [
  lauf("node", ["src/prozess.cjs"], "node src/prozess.cjs"),
  lauf("node", ["nachweise/pruefe_prozess.cjs"], "node nachweise/pruefe_prozess.cjs"),
  lauf("python", ["-X", "utf8", "nachweise/pruefe_beispiele.py"], "python -X utf8 nachweise/pruefe_beispiele.py"),
];

// Echter Prozessquelltext, unverändert, für den Browser eingebettet.
const quelle = fs.readFileSync(path.join(arbeit, "src/prozess.cjs"), "utf8");
const vertrag = JSON.parse(fs.readFileSync(path.join(arbeit, "vertrag/prozess.json"), "utf8"));
const antraege = JSON.parse(fs.readFileSync(path.join(arbeit, "beispieldaten/antraege.json"), "utf8"));
const sha = crypto.createHash("sha256").update(quelle).digest("hex");
const huelle = `// Erzeugt von demo/erzeugen.cjs. Enthält src/prozess.cjs unverändert (SHA-256 ${sha}); nur die require-Aufrufe werden
// für den Browser bereitgestellt: vertrag/prozess.json als Objekt, node:fs und node:path als leere Platzhalter (im Browser ungenutzt).
window.ProzessEcht = (function () {
  var module = { exports: {} };
  var exports = module.exports;
  var vertragsdaten = ${JSON.stringify(vertrag)};
  function require(name) { return /prozess\\.json$/.test(name) ? vertragsdaten : {}; }
  (function (module, exports, require) {
${quelle}
  })(module, exports, require);
  return module.exports;
})();
`;
fs.writeFileSync(path.join(demo, "prozess-echt.js"), huelle, "utf8");

const daten = {
  erzeugt: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
  node: process.version, python: pythonVersion, quelleSha256: sha,
  schritte, antraege, vertrag,
};
fs.writeFileSync(path.join(demo, "lauf-daten.js"), "window.LAUF = " + JSON.stringify(daten, null, 1) + ";\n", "utf8");
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Demo-Daten geschrieben: ${schritte.length} Schritte, Node ${process.version}, Python ${pythonVersion}, prozess.cjs SHA-256 ${sha.slice(0, 12)}`);
