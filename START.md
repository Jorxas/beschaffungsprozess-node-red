# Technischer Einstieg — P12

## P12-T01 lokal nachvollziehen

Im Projektordner mit der vorhandenen Laufzeit ausführen:

~~~powershell
uv run --offline --python 3.12 python -X utf8 nachweise/pruefe_beispiele.py
~~~

Tatsächlich verwendete Version steht in [P12-T01-pruefung.txt](nachweise/P12-T01-pruefung.txt). Keine zusätzlichen Pakete erforderlich. Der vorhandene uv-Cache bleibt im lokalen Projekt-Ausgabeordner.

Erwartetes Ergebnis: fünf unveränderte Originalanträge, drei innerhalb der inklusiven 500-Euro-Grenze, einer oberhalb und A05 mit negativem Betrag als beabsichtigter Fehlerfall. Der Prüflauf endet bei abweichenden Daten mit einem Fehler. Er schreibt keine Anträge und führt keine Freigaben aus. Fachliche Annahmen und Rollentrennung stehen in [PROZESS.md](PROZESS.md).

## Vorhandener Einstiegspunkt

~~~powershell
node src/prozess.cjs
~~~

Dieser Einstieg meldet weiterhin den Initialisierungsstand. Die Funktion `uebergang` ist noch nicht implementiert; dies gehört zu P12-T02 und wurde in dieser Phase nicht vorweggenommen.

## Spätere Voraussetzungen

Microsoft-Mandant für die Power-Automate-/SharePoint-Variante und SAP-Lernzugang für SAP/ABAP. Für die lokale Beispieldatenprüfung sind sie nicht erforderlich. Diese Produkte wurden in P12-T01 nicht verwendet; ein lokaler Prüflauf ersetzt keinen Produktnachweis.

Nächster getrennter Schritt: P12-T02, frühestens am 2. November 2026 gemäß Zeitplan, mit tatsächlicher Prüfung seiner Voraussetzungen. Jetzt keine Folgephase beginnen.
