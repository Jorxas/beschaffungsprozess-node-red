// Geplanter Zustandsvertrag; noch keine Anbindung an Power Automate oder SAP.
const zustaende = ["entwurf", "eingereicht", "genehmigt", "abgelehnt"];
function uebergang(antrag, aktion) {
  throw new Error("P12-T02: Regeln und Aenderungsprotokoll noch umzusetzen");
}
module.exports = { zustaende, uebergang };
if (require.main === module) console.log("P12 initialisiert; Prozess und Anbindungen noch offen.");
