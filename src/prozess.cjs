// Lokaler Zustandsautomat; keine Anbindung an Microsoft- oder SAP-Produkte.
const fs = require("node:fs");
const path = require("node:path");
const vertrag = require("../vertrag/prozess.json");
const zustaende = vertrag.zustaende;

function verlangen(bedingung, meldung) {
  if (!bedingung) throw new Error(meldung);
}

function textGueltig(wert) {
  return typeof wert === "string" && wert.trim().length > 0;
}

function betragGueltig(betrag) {
  return typeof betrag === "number" && Number.isFinite(betrag) && betrag > 0
    && Number.isSafeInteger(Math.round(betrag * 100))
    && betrag === Math.round(betrag * 100) / 100;
}

function ausMomentaufnahme(antrag) {
  verlangen(textGueltig(antrag.id) && zustaende.includes(antrag.zustand), "Ungültige Momentaufnahme.");
  verlangen(antrag.verantwortlich === "antragsteller", "Unbekannte Verantwortung.");
  return { ...antrag, waehrung: vertrag.waehrung,
    antragsteller: `synthetisch-${antrag.id}`, ausgangszustand: antrag.zustand, aenderungen: [] };
}

function uebergang(antrag, aktion) {
  verlangen(antrag && aktion, "Antrag und Aktion sind erforderlich.");
  verlangen(textGueltig(antrag.id) && textGueltig(antrag.antragsteller)
    && antrag.verantwortlich === "antragsteller" && antrag.waehrung === vertrag.waehrung
    && zustaende.includes(antrag.ausgangszustand) && Array.isArray(antrag.aenderungen),
  "Lokale Antragsstruktur ist ungültig.");
  const regel = Object.hasOwn(vertrag.uebergaenge, aktion.art) ? vertrag.uebergaenge[aktion.art] : null;
  verlangen(regel && antrag.zustand === regel.von, "Aktion ist im aktuellen Zustand nicht erlaubt.");
  verlangen(betragGueltig(antrag.betrag), "Betrag muss positiv, endlich und centgenau sein.");
  verlangen(aktion.person && textGueltig(aktion.person.kennung)
    && aktion.person.rolle === regel.rolle, "Person oder Rolle ist unzulässig.");
  verlangen(textGueltig(aktion.begruendung), "Eine Begründung ist erforderlich.");
  verlangen(typeof aktion.zeitpunkt === "string"
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(aktion.zeitpunkt)
    && Number.isFinite(Date.parse(aktion.zeitpunkt))
    && new Date(aktion.zeitpunkt).toISOString() === aktion.zeitpunkt,
  "Zeitpunkt muss ein gültiger UTC-Zeitstempel mit Millisekunden sein.");
  const letzteAenderung = antrag.aenderungen.at(-1);
  verlangen(!letzteAenderung || aktion.zeitpunkt >= letzteAenderung.zeitpunkt,
    "Zeitpunkt darf nicht vor der letzten Änderung liegen.");

  let entscheidungskriterium = "Gültiger Betrag; Einreichung durch Antragsteller";
  if (aktion.art === "einreichen") {
    verlangen(aktion.person.kennung === antrag.antragsteller, "Nur der Antragsteller darf einreichen.");
  } else {
    verlangen(aktion.person.kennung !== antrag.antragsteller, "Selbstfreigabe und eigene Ablehnung sind unzulässig.");
    verlangen(typeof aktion.bedarf_begruendet === "boolean" && typeof aktion.budget_verfuegbar === "boolean",
      "Bedarf und Budget müssen ausdrücklich als Wahrheitswerte angegeben werden.");
    const gruende = [];
    if (antrag.betrag > vertrag.betragsgrenze_euro) gruende.push("Betragsgrenze überschritten");
    if (!aktion.bedarf_begruendet) gruende.push("Bedarf nicht begründet");
    if (!aktion.budget_verfuegbar) gruende.push("Budget nicht verfügbar");
    verlangen(aktion.art === "genehmigen" ? gruende.length === 0 : gruende.length > 0,
      "Entscheidung widerspricht Betrag, Bedarf oder Budget.");
    entscheidungskriterium = gruende.length ? gruende.join("; ") : "Betrag bis einschließlich 500 EUR; Bedarf begründet; Budget verfügbar";
  }

  const aenderung = { von: antrag.zustand, nach: regel.nach, aktion: aktion.art,
    person: { ...aktion.person }, zeitpunkt: aktion.zeitpunkt,
    betrag: antrag.betrag, waehrung: antrag.waehrung,
    begruendung: aktion.begruendung, entscheidungskriterium };
  if (aktion.art !== "einreichen") {
    aenderung.bedarf_begruendet = aktion.bedarf_begruendet;
    aenderung.budget_verfuegbar = aktion.budget_verfuegbar;
  }
  return { ...structuredClone(antrag), zustand: regel.nach,
    aenderungen: [...structuredClone(antrag.aenderungen), aenderung] };
}

function beispieleDurchlaufen(originale, zeitpunkt = new Date().toISOString()) {
  return originale.map((original) => {
    let antrag = ausMomentaufnahme(original);
    try {
      if (antrag.zustand === "entwurf") {
        antrag = uebergang(antrag, { art: "einreichen", zeitpunkt,
          person: { kennung: antrag.antragsteller, rolle: "antragsteller" },
          begruendung: "Synthetischer Beschaffungsbedarf zur lokalen Vorführung" });
      }
      if (antrag.zustand === "eingereicht") {
        antrag = uebergang(antrag, { art: antrag.betrag <= vertrag.betragsgrenze_euro ? "genehmigen" : "ablehnen",
          zeitpunkt, person: { kennung: "synthetisch-pruefer", rolle: "freigabeverantwortlicher" },
          begruendung: "Lokales Szenario mit ausdrücklich angenommenem Bedarf und Budget",
          bedarf_begruendet: true, budget_verfuegbar: true });
      }
      return { antrag, hinweis: antrag.aenderungen.length ? "Nur lokale neue Übergänge protokolliert."
        : "Vorhandener Endzustand erhalten; historische Änderungsspur unbekannt." };
    } catch (fehler) {
      return { antrag, fehler: fehler.message };
    }
  });
}

module.exports = { zustaende, ausMomentaufnahme, uebergang, beispieleDurchlaufen };
if (require.main === module) {
  const originale = JSON.parse(fs.readFileSync(path.join(__dirname, "../beispieldaten/antraege.json"), "utf8"));
  console.log(JSON.stringify({ hinweis: "Lokaler Prototyp; keine Produktnutzung oder historische Rekonstruktion.",
    ergebnisse: beispieleDurchlaufen(originale) }, null, 2));
}
