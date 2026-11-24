# Technischer Einstieg — P12

## P12-T01 lokal nachvollziehen

Im Projektordner mit der vorhandenen Laufzeit ausführen:

~~~powershell
uv run --offline --python 3.12 python -X utf8 nachweise/pruefe_beispiele.py
~~~

Tatsächlich verwendete Version steht in [P12-T01-pruefung.txt](nachweise/P12-T01-pruefung.txt). Keine zusätzlichen Pakete erforderlich. Der vorhandene uv-Cache bleibt im lokalen Projekt-Ausgabeordner.

Erwartetes Ergebnis: fünf unveränderte Originalanträge, drei innerhalb der inklusiven 500-Euro-Grenze, einer oberhalb und A05 mit negativem Betrag als beabsichtigter Fehlerfall. Der Prüflauf endet bei abweichenden Daten mit einem Fehler. Er schreibt keine Anträge und führt keine Freigaben aus. Fachliche Annahmen und Rollentrennung stehen in [PROZESS.md](PROZESS.md).

## P12-T02: Vertrag und lokalen Prototyp ausführen

~~~powershell
node src/prozess.cjs
~~~

Benötigt ausschließlich die vorhandene Node-Laufzeit, tatsächlich verwendet: **v24.13.0**, keine Pakete oder Netzwerkzugriffe. Der Befehl gibt JSON auf der Konsole aus und verändert keine Datei. Für eine gespeicherte Vorführung im Projektordner:

~~~powershell
New-Item -ItemType Directory -Path ausgabe -Force | Out-Null
node src/prozess.cjs | Set-Content -LiteralPath ausgabe/P12-T02-prototyp.json -Encoding UTF8
node nachweise/pruefe_prozess.cjs
~~~

Der letzte Befehl prüft die fünf Originale einschließlich SHA256 und schreibt `nachweise/P12-T02-ergebnisse.json`; bei einer Abweichung endet er mit Fehler. Die protokollierte Abnahme steht in `nachweise/P12-T02-pruefung.txt`. A01 erhält zwei, A02 eine neue Änderung. A03/A04 bleiben Endzustände mit unbekannter Vorgeschichte; A05 bleibt mit Fehlermeldung im Entwurf. Vier getrennt bezeichnete Testkopien decken 500 Euro, 1.500 Euro, fehlendes Budget und fehlenden Bedarf ab. Die Anzahl der Originalanträge bleibt fünf.

`vertrag/prozess.json` beschreibt die JSON-Struktur und liefert dem Code Zustände, Rollen und Übergänge. `ausMomentaufnahme` ergänzt EUR, synthetische Personenkennung, Ausgangszustand und eine leere lokale Änderungsliste. `uebergang(antrag, aktion)` liefert eine neue Antragskopie und prüft Betrag, Zustand, handelnde Person, Rolle, Begründung und UTC-Zeitpunkt. Entscheidungen verlangen ausdrücklich `bedarf_begruendet` und `budget_verfuegbar`; Genehmigung nur bis einschließlich 500 Euro, Ablehnung bei überschrittener Grenze oder fehlender Voraussetzung. Jede neue Änderung enthält Betrag, Person, Rolle, Grund und Entscheidungskriterium. Vorhandene Eingaben und fehlgeschlagene Aktionen werden nicht verändert. Ein gemeinsamer tatsächlicher Laufzeitpunkt markiert die Aktionen der Vorführung.

Technische Entscheidung: Die kleine Funktion arbeitet mit Kopien und ohne Datenbank; so bleiben Originale und neue Änderungsspur unterscheidbar. Rollen und Kennungen sind ungeprüfte lokale Angaben, keine Berechtigungsverwaltung. Die Änderungsspur ist weder ein historischer Beleg für importierte Zustände noch manipulationssicher. Keine Konten, Produktoberfläche, Automatisierung oder ERP-Verbindung.

## P12-T03: Zugangshindernis und geplanter Ablauf

Stand 11. November 2026: **blockiert**. Kein Power-Automate-Connector unter den verfügbaren Werkzeugen gefunden. `cua.createBrowserTab("iab", "https://make.powerautomate.com/", { visible: false })` meldete „The browser access host is unavailable“. Der anschließende Zugriff auf ein vorhandenes Opera-Fenster mittels `cua.getApp({ windowId: 197316 })` wurde mit „Computer Use was not approved to use Navigateur Opera“ abgewiesen. Nicht über andere Automatisierungswege umgangen. Fensternummern sind flüchtig und bei späteren Prüfungen neu aus der Inventur zu bestimmen.

Der Zugang über die verfügbaren Werkzeuge ist blockiert; das Fehlen eines Kontos oder einer Lizenz wurde **nicht** festgestellt. Mandant, Umgebung, Lizenz, Verbindungen sowie Erstellungs-/Ausführungsrechte bleiben ungeprüft. Kein Konto, Testabo, Flow oder Nachricht angelegt; keine Anmeldung vorgenommen. Ein zugänglicher, freigegebener Microsoft-Mandant mit passenden Rechten ist für einen echten Produktlauf erforderlich. [Zugangsprotokoll](nachweise/P12-T03-zugang.json). Eine erneute Produktprüfung erfordert eine spätere freigegebene Arbeitseinheit.

### Geplant: Ein- und Ausgaben, keine Produktausführung

Der kleine Zielablauf folgt dem vorhandenen lokalen Vertrag `vertrag/prozess.json`: gültigen Entwurf einreichen, anschließend durch eine andere Person begründet genehmigen oder ablehnen. Positive, endliche, centgenaue EUR-Beträge sind erforderlich. Genehmigung bis einschließlich 500 EUR nur bei begründetem Bedarf und verfügbarem Budget; Ablehnung bei Überschreitung oder fehlender Voraussetzung. Endzustände bleiben erhalten; ungültige Eingaben erzeugen einen Fehler ohne Zustandswechsel. Keine E-Mails, SharePoint-Liste oder ERP-Verbindung in dieser Phase.

| Eingabe | Bedeutung / Herkunft |
|---|---|
| `id`, `betrag`, `zustand`, `verantwortlich` | Fünf unveränderte Momentaufnahmen aus `beispieldaten/antraege.json` |
| `waehrung`, `antragsteller`, `ausgangszustand`, `aenderungen` | Lokaler Vertrag: EUR, synthetische Personenkennung, übernommener Ausgangszustand, anfangs leere Änderungsliste |
| `art`, `person.kennung`, `person.rolle`, `zeitpunkt`, `begruendung` | Je Aktion: Antragsteller beim Einreichen bzw. andere Person als Freigabeverantwortlicher; tatsächlicher UTC-Zeitpunkt und Begründung |
| `bedarf_begruendet`, `budget_verfuegbar` | Bei Entscheidung ausdrücklich angegebene Wahrheitswerte; für die erwarteten Freigaben unten rein synthetisch als wahr angenommen |

Geplante Ausgabe entsprechend dem vorhandenen lokalen Prototyp: `ergebnisse` enthält je Eingang einen `antrag` mit aktuellem Zustand und neuen `aenderungen`, dazu `hinweis` oder `fehler`. Jede neue Änderung enthält vorherigen/nächsten Zustand, Aktion, Person/Rolle, Zeitpunkt, Betrag/Währung, Begründung und Entscheidungskriterium; Entscheidungen zusätzlich Bedarf/Budget. Das ist kein importierbarer Power-Automate-Flow. Personenkennungen beweisen keine Anmeldung oder Berechtigung.

| Original | Geplante Ausgabe unter den genannten Testannahmen | Tatsächliches Power-Automate-Ergebnis |
|---|---|---|
| A01: 50 EUR, Entwurf | Genehmigt nach Einreichen und Genehmigen; zwei neue Änderungen | Nicht ausgeführt; Zugangskontrolle blockiert |
| A02: 250 EUR, eingereicht | Genehmigt; eine neue Änderung, frühere Historie unbekannt | Nicht ausgeführt; Zugangskontrolle blockiert |
| A03: 500 EUR, genehmigt | Endzustand unverändert; keine erfundene Historie | Nicht ausgeführt; Zugangskontrolle blockiert |
| A04: 1.500 EUR, abgelehnt | Endzustand unverändert; keine neue Ablehnung behauptet | Nicht ausgeführt; Zugangskontrolle blockiert |
| A05: −5 EUR, Entwurf | Fehler „Betrag muss positiv, endlich und centgenau sein.“; Entwurf ohne Änderung | Nicht ausgeführt; Zugangskontrolle blockiert |

Keine neuen Beispieldaten oder Ersatzsimulationen erstellt. Der Vertrag bleibt ein lokaler Prozessvertrag, kein ERP-Vertrag. ERP-Export, SAP-/ABAP-/OData-Lauf und T04 gehören nicht zu dieser Phase. LASTENHEFT A1–A4 bleiben offen.

### Lokal tatsächlich geprüft

~~~powershell
uv run --offline --python 3.12 python -X utf8 nachweise/pruefe_beispiele.py
Get-Content -LiteralPath projekt.json -Encoding UTF8 | ConvertFrom-Json | Select-Object id,status,expectedRecords
git diff --check -- README.md START.md ARBEITSJOURNAL.md projekt.json tickets/P12-T03.md
~~~

Der vorhandene Prüfer kontrolliert fünf Originale einschließlich SHA256 und Betragseinstufung; er führt keine Freigaben oder Produkte aus. Ergebnis und Python-Version: `nachweise/P12-T03-pruefung.txt`. Wiederholung benötigt `nachweise/pruefe_beispiele.py` und `beispieldaten/antraege.json`; fachliche Quellen sind `PROZESS.md`, `vertrag/prozess.json` und `src/prozess.cjs`. Konfiguration und Umfang: `projekt.json`, `tickets/P12-T03.md`, `LASTENHEFT.md`. Keine zusätzlichen Pakete erforderlich.

## Weitere Produktvoraussetzungen

Microsoft-Mandant für die Power-Automate-/SharePoint-Variante und SAP-Lernzugang für SAP/ABAP. Für den lokalen Prototyp sind sie nicht erforderlich. Diese Produkte wurden nicht verwendet; ein lokaler Prüflauf ersetzt keinen Produktnachweis. Power-Automate-Zugangskontrolle in T03 wie oben blockiert; SharePoint und SAP nicht separat geprüft.

P12-T03 endet mit dokumentiertem Hindernis und lokal geprüften Eingabedaten. Folgephasen benötigen eine eigene Freigabe und Voraussetzungenprüfung; hier keine Folgephase beginnen.

## T03 — bedingter Vorbereitungszweig am 18. November

Der Benutzer hat keinen passenden Power-Automate-Geschäfts-/Hochschulzugang. Das ursprünglich vorgesehene Alternativergebnis „Zugangshindernis sowie Ein-/Ausgaben dokumentieren“ ist damit abgenommen. Der Produktlauf bleibt ausdrücklich blockiert; keine Ersatzsimulation als Power-Automate-Erfahrung. Power Automate und SharePoint benötigen einen zugänglichen freigegebenen Mandanten; ein SAP-Testsystem wurde ebenfalls nicht nachgewiesen.

POWER_AUTOMATE_VORBEREITUNG.md enthält den geplanten Ablauf, die fünf ursprünglichen Fälle und Voraussetzungen einer späteren echten Produktprüfung. Der vorhandene lokale Prozess wurde erneut tatsächlich geprüft: node nachweise/pruefe_prozess.cjs; alle Zustands-, Rollen-, Betrags- und Zeitprüfungen bestanden. Kein Netzwerkzugriff und keine Originaländerung. Die tatsächliche neue Änderungsspur ist lokal und nicht manipulationssicher. T04 folgt mit einem eigenen lokalen Übergabeentwurf; SAP/ABAP/OData bleiben unvalidiert.

## T04 — geprüfte lokale ERP-Vorbereitung

Die zuvor separat entwickelten Dateien wurden unverändert übernommen und am 18. November erneut tatsächlich geprüft. Umfang und Wiederholungsbefehle stehen vollständig in ERP_UEBERGABE.md. Einfacher Einstieg: node src/vorfuehren.cjs. Ein zweiter Aufruf verwendet dieselbe gespeicherte Momentaufnahme; keine neue Entscheidung mit erfundener Vorgeschichte. Für neue Eingaben einen eigenen Arbeitsstand verwenden.

node nachweise/pruefe_prozess.cjs und node nachweise/erp_export_pruefen.cjs bestanden erneut. Der zweite Prüfer erstellt ein eigenes temporäres Ausgabeverzeichnis und kontrolliert reale Dateiwiederholung und bytegleichen Erhalt bei Konflikt. Kein HTTP-, OData-, SAP- oder Microsoft-Aufruf. Das eigene JSON Schema beschreibt nur den vorgeschlagenen Übergabevertrag; es ist kein importierbarer Flow und keine offizielle SAP-Dienstdefinition. Alle eigenen Quelldateien und Protokolle bleiben lokal.

Der lokale Basisumfang nach dem bedingten Lastenheft ist damit erfüllt. Die weiter blockierten Produkte benötigen vor einer späteren Kompetenznennung einen eigenen echten Lauf. Vollständige lokale Basisabnahme und vollständige Produktabdeckung sind unterschiedliche Aussagen.
