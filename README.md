# Beschaffungsantrag und Freigabeprozess

Stand: 2. November 2026 — **P12-T02 erledigt: lokaler JSON-Vertrag und Prototyp mit Änderungsspur geprüft**. Geplanter Abschluss der Basis: 2026-11-08, spätestens 8. November 2026. Geschätzter Basisaufwand: 3 Stunden ohne Einrichtung und Erweiterungen.

Ein Verein möchte kleine Beschaffungsanträge vor dem ERP-Export nachvollziehbar freigeben.

Ergebnis: Dokumentierter Prozess, Exportvertrag und echte kleine Automatisierung bei verfügbarem Zugang.

Vorgesehene Technologien: BPMN/Projektmanagement, Power Platform/M365, SAP, ABAP/OData, Jira/Confluence. Eine Nennung ist kein Nachweis einer Umsetzung.

## Einstieg

1. [Lastenheft](LASTENHEFT.md) lesen.
2. [Abgeschlossenes Ticket P12-T02](tickets/P12-T02.md) mit seiner Abgrenzung lesen.
3. [Technischen Einstieg](START.md) prüfen und ein Ticket nach dem anderen bearbeiten.
4. [Arbeitsjournal](ARBEITSJOURNAL.md) und echte Nachweise aktualisieren.

Abhängigkeiten: keine weiteren Projekte.

Der historische [Prozessentwurf P12-T01](PROZESS.md) legt Rollen, eine inklusive 500-Euro-Grenze sowie Freigabe und Ablehnung fest. Der neue [lokale Vertrag](vertrag/prozess.json) beschreibt Anträge, Aktionen und Änderungen; [prozess.cjs](src/prozess.cjs) führt die Übergänge aus. Der Vertrag ist eine JSON-Strukturbeschreibung mit ausführbaren Übergangsregeln, kein JSON Schema und kein ERP-Vertrag.

Die [Abnahme](nachweise/P12-T02-pruefung.txt) bestätigt: A01 wird eingereicht und genehmigt, A02 genehmigt, A03/A04 bleiben in ihren vorhandenen Endzuständen, A05 wird am Einreichen gehindert. Die fünf Eingaben bleiben samt SHA256 unverändert. [Ergebnisse und Änderungsspuren](nachweise/P12-T02-ergebnisse.json) trennen den Originaldurchlauf von vier ausdrücklich synthetischen Testkopien für Grenzbetrag und Ablehnung. Personenkennungen, Bedarf und Budget sind synthetische Ergänzungen; frühere Entscheidungen werden nicht rekonstruiert.

Nur der lokale Endpunkt ist abgeschlossen. Die Lastenheftkriterien bleiben offen; keine praktische Nutzung von Power Automate, SharePoint oder SAP nachgewiesen. Produktzugänge wurden nicht eingerichtet oder geprüft. Keine Authentifizierung, dauerhafte Speicherung oder manipulationssichere Historie; ERP-Adapter und Folgephasen bleiben offen.

[Erweiterungen](VARIANTEN.md) haben einen eigenen Umsetzungsstand. [Private Unternehmenszuordnung](UNTERNEHMEN.lokal.md) bleibt außerhalb der Git-Verwaltung.

## Projektsprache

Dokumentation, selbst gewählte Bezeichner, Kommentare, Meldungen und Beispieldaten werden auf Deutsch geschrieben. Festgelegte API-Schlüssel, Sprachsyntax und Produktnamen bleiben unverändert.
