# Lokale ERP-Übergabe — kein SAP-Lauf

Stand 18. November 2026. Die getestete lokale Vorbereitung benötigt keinen Microsoft- oder SAP-Zugang. Sie ersetzt keine praktische Verwendung dieser Produkte.

## Vertrag und Ablauf

Das eigene [JSON Schema](vertrag/erp-export.schema.json) beschreibt eine kleine Übergabe mit Exportkennung, Antragskennung, ganzzahligem Centbetrag, EUR, Freigabezeit, entscheidender Person und Begründung. Es ist ein vorgeschlagenes lokales Format. Es entspricht keinem nachgewiesenen SAP-OData-Dienst, BAPI oder S/4-Datenmodell.

[erp_export.cjs](src/erp_export.cjs) übernimmt gespeicherte Ergebnisse des lokalen Prozesses. Nur genehmigte Anträge mit einer neuen, in sich stimmigen Freigabespur werden berücksichtigt. Betrag, Rolle, fremde entscheidende Person, Budget, Bedarf, Begründung und Zeitformat werden kontrolliert. Die ursprüngliche Genehmigung A03 hat keine rekonstruierbare Historie und wird ausdrücklich zurückgehalten. A04 ist abgelehnt, A05 fehlerhaft. A01 und A02 ergeben zwei lokale Exportdatensätze über 5.000 bzw. 25.000 Cent.

Die Kennung `uebung-A01` bleibt stabil. Ein SHA256 des fest aufgebauten Inhalts ermöglicht den Vergleich bei Wiederholung. Gleiche Kennung und gleicher Inhalt erzeugen keinen zweiten Datensatz. Gleiche Kennung mit verändertem Inhalt bricht vor jeder Dateiänderung ab. Ein beschädigter gespeicherter Hash oder doppelte Eingangskennungen werden abgewiesen. Ein bereits gespeicherter Endzustand ohne Historie gilt nicht automatisch als freigegeben.

Der lokale Speicher enthält Daten und Hash gemeinsam in einer JSON-Datei. Eine neue vollständige Datei wird erst nach erfolgreicher Planung geschrieben und anschließend umbenannt. Ein einzelner lokaler Schreiber ist Voraussetzung; keine Mehrprozesssperre, Datenbanktransaktion oder Zustellgarantie gegenüber einem ERP. SHA256 macht die Datei nicht manipulationssicher: wer Schreibrechte hat, kann auch den Hash neu berechnen. Die synthetischen Personenkennungen ersetzen weder Anmeldung noch Berechtigungsprüfung.

## Ausführen

Im Projektordner mit Node 24:

~~~powershell
node nachweise/pruefe_prozess.cjs
node nachweise/erp_export_pruefen.cjs
~~~

Beide Befehle wurden am 18. November tatsächlich erfolgreich ausgeführt. Der Exporttest nutzt alle fünf unveränderten Originalanträge, führt die lokalen Übergänge neu aus und prüft Wiederholung nach JSON-Neuladen, Konflikt mit bytegleich erhaltener Datei, Selbstfreigabe, ungültigen Betrag, doppelte Eingänge und beschädigten Speicher. Ergebnisse: `nachweise/P12-erp-export-pruefung.json`. Eigene Prüfausgaben liegen unter `ausgabe/exportpruefung-*`.

Für einen bewussten lokalen Ablauf einmal eine Momentaufnahme anlegen und bei Wiederholung genau diesen Stand übergeben:

~~~powershell
node src/vorfuehren.cjs
node src/vorfuehren.cjs
~~~

Der erste Aufruf schreibt die tatsächlichen lokalen Übergänge einmal nach `ausgabe/prozessergebnisse.json` als UTF-8 ohne BOM und legt `ausgabe/erp-export.json` an. Der zweite liest dieselbe Momentaufnahme: beide Exporte sind bereits vorbereitet, die Exportdatei bleibt bytegleich. Bestehende Dateien werden nicht als neue Historie überschrieben. Für eine eigene gespeicherte UTF-8-Datei ohne BOM lässt sich `node src/erp_export.cjs <Datei>` verwenden. Den Prozess nicht vor jedem Export mit neuen Zeitpunkten erneut berechnen: Eine tatsächlich neue Entscheidung mit anderer Zeit ist ein anderer Inhalt und wird als Konflikt behandelt. Keine parallelen Aufrufe desselben lokalen Speichers starten.

## Für eine spätere echte ERP-Anbindung offen

Ein konkretes Zielsystem, lesbare Metadaten, authentisierte Identitäten, Feldzuordnung, Berechtigungen und ein freigegebener Testmandant fehlen. Erst dann den offiziellen Vertrag des tatsächlich gewählten Dienstes übernehmen, Idempotenz und Antworten dieses Dienstes prüfen sowie echte Beleg-/Fehlerkennungen protokollieren. Derzeit wird nichts versendet; keine SAP-, ABAP-, OData- oder SharePoint-Erfahrung behaupten.
