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

## Spätere Voraussetzungen

Microsoft-Mandant für die Power-Automate-/SharePoint-Variante und SAP-Lernzugang für SAP/ABAP. Für den lokalen Prototyp sind sie nicht erforderlich. Diese Produkte wurden nicht verwendet; ein lokaler Prüflauf ersetzt keinen Produktnachweis. Ob Zugänge verfügbar sind, wurde hier nicht untersucht.

P12-T02 endet nach dieser lokalen Abnahme. Folgephasen benötigen eine eigene Freigabe und Voraussetzungenprüfung; hier keine Folgephase beginnen.
