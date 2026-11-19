# Beschaffung mit nachvollziehbarer Freigabe

Kleine Beschaffungsanträge sollen mit getrennten Rollen und überprüfbaren Betragsregeln vor einem lokalen ERP-Export freigegeben werden.

![Projektaufbau](dokumentation/ueberblick.svg)

**Veröffentlichungsstand: Phase 2/4.** Dieses eigenständige Repository übernimmt zunächst den bereits lokal committeten Stand. Weitere fachliche Phasen werden im Abstand von mindestens vier Stunden veröffentlicht. Die technische Entwicklung und die öffentliche Veröffentlichung haben unterschiedliche echte Zeitpunkte.

## Was hier zu sehen ist

| Schritt | Inhalt | Hier veröffentlicht |
|---|---|---|
| 1 | Prozess- und Rollenvertrag | Ja |
| 2 | Lokaler Zustandsautomat | Ja |
| 3 | Voraussetzungen und Produktgrenzen | Folgt |
| 4 | Exportvertrag, Wiederholung und Node-RED-Zusatz | Folgt |

## Fachlicher Nutzen

Prozessmodellierung, Rollentrennung, Validierung, Idempotenz und lokale Workflow-Orchestrierung.

## Lokal starten

Im geklonten Repository ausführen; die benötigte Laufzeit muss installiert sein. Python-Beispiele verwenden 3.12, Node-Beispiele 24 und C# die im Projekt angegebene .NET-Version. Befehle mit uv laden die dort genau bezeichneten Pakete bei Bedarf.

```powershell
node src/prozess.cjs
node nachweise/pruefe_prozess.cjs
```

Ausführliche technische Befehle: [START.md](START.md). [Öffentlicher Prüfstand](ABNAHME.json) und [Quellphasen](VERLAUF.json) dokumentieren Herkunft und echte Ausführungsdaten. Eine neue Repositorykopie ist kein neuer nativer Desktoplauf.

## Ergebnis des lokal geprüften Schlussstands

Zwei gültige lokale Exporte, Konfliktschutz und unveränderte Wiederholung. Node-RED separat mit echtem Neustart geprüft.

**Dieser Schlussstand ist lokal bereits geprüft, aber noch nicht vollständig in diesem Repository veröffentlicht.** Maßgeblich für den hier verfügbaren Code ist die Phasentabelle oben.

## Grenzen

Power Automate, SharePoint und SAP bleiben unvalidiert. Der eigene JSON-Vertrag ist keine SAP-Schnittstelle. Node-RED bleibt lokal; bekannte npm-Befunde sind im Zusatz dokumentiert.

Eigenes kleines Lernprojekt mit synthetischen Daten, mit KI-Unterstützung entwickelt und geprüft. Keine Aussage über Berufserfahrung, menschliche Arbeitsstunden oder praktische Verwendung weiterer nur geplanter Produkte.

## Entwicklungshistorie

[Entwicklungshistorie](HISTORIE.md): die vorhandenen lokalen Änderungen, ihre ursprünglichen Daten und die spätere GitHub-Übernahme.
