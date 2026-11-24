# Beschaffungsablauf mit Node-RED

Kostenlose lokale Zusatzvariante zu P12. Node-RED steht unter Apache 2.0 und benötigt für diese lokale Vorführung kein Microsoft-Konto. Node-RED 5.0.10, Node.js ab 22.9; verwendete Versionen im Prüfbericht. Mit KI-Unterstützung entwickelt.

## Start und Vorführung

Im Ordner dieser Erweiterung:

```powershell
npm ci --ignore-scripts
npm test
npm start
```

Editor: <http://127.0.0.1:18812/editor/>. Den Knopf am Knoten „Vorführung auslösen“ betätigen und im Debug-Bereich das Ergebnis ansehen. Alternativ:

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:18812/beschaffung/vorfuehren -ContentType 'application/json' -Body '{}'
Invoke-RestMethod -Uri http://127.0.0.1:18812/beschaffung/stand
```

Der sichtbare Ablauf führt drei echte Schritte aus: synthetische Anträge prüfen und entscheiden, eigenen ERP-Exportvertrag prüfen, gemeinsame Momentaufnahme atomar speichern. A01/A02 liefern zwei Exporte. A03 hat einen importierten Endzustand ohne neue Freigabespur und wird nicht exportiert. A04 bleibt abgelehnt. A05 bleibt wegen eines negativen Betrags blockiert.

Die erste Vorführung legt `ausgabe/vorfuehrung.json` an. Weitere Aufrufe und Laufzeitneustarts verwenden genau diesen Stand samt echten ursprünglichen Zeitstempeln. Geänderte Beispieldaten benötigen einen neuen getrennten Ausgabeordner über `P12_NODE_RED_AUSGABE`. Eine bestehende Ausgabe nicht löschen, um ältere Freigaben vorzutäuschen.

Beenden mit Strg+C. Es wird kein Windows-Dienst eingerichtet. Der Test startet und beendet seine eigene Laufzeit; Prüfbericht: `nachweise/letzte-pruefung.json`. Der Editor und HTTP-Knoten werden tatsächlich über HTTP geprüft; ein manueller Klick im Editor ist kein Bestandteil des automatischen Nachweises.

## Grenzen und Herkunft

Fachkern unter `fachkern/` unverändert aus dem bereits lokal getesteten P12 übernommen; Herkunft und SHA-256 stehen in `HERKUNFT.json`. Diese separate Erweiterung verändert keine gesicherten Basisphasen oder deren Commitfolge.

Nur feste synthetische Daten, lokale Einzelbenutzung und ein schreibender Prozess je Ausgabeordner. Keine Anmeldung, echte menschliche Freigabe oder manipulationssichere Historie. Hashes erkennen zufällige Änderungen, schützen aber nicht gegen absichtliche Neuberechnung. Nur Loopback-Bindung; keine öffentliche Bereitstellung. Der lokale Editor kann Code ausführen und bleibt ausschließlich für vertrauenswürdige lokale Verwendung bestimmt.

Diese Ausführung belegt Node-RED und Prozessmodellierung. Power Automate, SharePoint und SAP wurden weiterhin nicht praktisch ausgeführt. Der eigene Export ist keine SAP-Schnittstelle. Die Zusatzvariante gehört noch nicht zu den 52 gesicherten Basisphasen.

Abhängigkeitsstand: `node nachweise/abhaengigkeiten_pruefen.cjs` führt einen echten npm-Audit durch. Am 18. November meldete Node-RED 5.0.10 weiterhin 33 mittlere und sechs hohe Befunde, keine kritischen. Betroffen ist insbesondere der mitgelieferte npm-Abhängigkeitsbaum. Die zwischenzeitlich geprüfte ältere Version wurde wegen zusätzlicher kritischer Befunde verworfen. Es wird keine behobene oder vollständig sichere Abhängigkeitslage behauptet. Installation zusätzlicher Knoten und Module ist deaktiviert; keine Laufzeit bleibt nach dem Test aktiv. Vor einer öffentlichen Demo oder erweitertem Betrieb die Befunde erneut prüfen und beheben. Der bestandene Funktionstest ersetzt diese Prüfung nicht.

## Quellen

- [Node-RED-Lizenz](https://nodered.org/about/license/)
- [Lokale Ausführung](https://nodered.org/docs/getting-started/local)
- [Laufzeitkonfiguration](https://nodered.org/docs/user-guide/runtime/configuration)
- [Function-Knoten](https://nodered.org/docs/user-guide/writing-functions)
