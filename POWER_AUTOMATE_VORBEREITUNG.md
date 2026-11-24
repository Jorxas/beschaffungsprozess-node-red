# Power-Automate-Vorbereitung und Zugangshindernis

Stand 18. November 2026: Der Benutzer hat ausdrücklich erklärt, keinen Microsoft-Geschäfts- oder Hochschulzugang mit Power Automate zu haben. Damit ist die frühere bloße Werkzeugblockade präzisiert. Ein geeignetes Konto, eine Umgebung und Erstellungs-/Ausführungsrechte sind nicht verfügbar bzw. nicht nachgewiesen. Kein Konto, Testabonnement, Mandant, Flow, Verbindung oder Nachricht wurde angelegt. Keine Anmeldung oder Sicherheitsregel wurde umgangen.

Power Automate, SharePoint und SAP wurden in diesem Projekt **nicht praktisch ausgeführt**. Der [lokale Prozess](src/prozess.cjs) und die für T04 separat gesicherte lokale ERP-Vorbereitung sind getrennte eigene Programme. Der folgende Entwurf ist kein importierbares Power-Automate-Paket.

## Geplanter kleiner Flow bei später verfügbarem Zugang

1. Freigegebene Testumgebung und passende Lizenz prüfen. Nur synthetische Anträge und zwei ausdrücklich freigegebene Testidentitäten verwenden. Eine Anmeldung übernimmt der Benutzer.
2. Manuellen Testauslöser mit Kennung, Betrag in Cent, EUR, Antragstellerkennung, Bedarf und Budget vorsehen. Zustände und Pflichtfelder entsprechend `vertrag/prozess.json` prüfen; Betrag positiv und bis 50.000 Cent für Genehmigung.
3. Über eine echte Approvals-Aktion eine andere authentisierte Person entscheiden lassen. Antragsteller und Freigabeverantwortlicher müssen verschieden sein. Empfänger und mögliche Benachrichtigungen müssen vor einem echten Test ausdrücklich freigegeben sein; derzeit ist kein Versand eingerichtet.
4. Bei passender Umgebung optional den Zustand und die neue Änderungsspur in einer eigenen SharePoint-Testliste speichern. Berechtigungen und eindeutige Antragskennung dort tatsächlich prüfen. Eine Textkennung aus dem lokalen Prototyp ist kein Berechtigungsnachweis.
5. Entscheidung, tatsächliche Zeit, handelnde Identität, Grund und Betrag erfassen. Erst danach eine Übergabe anhand des tatsächlich verfügbaren ERP-Vertrags vorbereiten. Unser lokales Schema ist nur der fachliche Entwurf.
6. Fünf Originalfälle prüfen: A01 zwei Übergänge, A02 einer, A03/A04 unveränderte importierte Endzustände mit unbekannter Vorgeschichte, A05 Eingabefehler. Zusätzliche Testkopien decken 500/500,01 EUR, fehlenden Bedarf, fehlendes Budget, Wiederholung und Selbstfreigabe ab.

## Erwartete Ein- und Ausgaben

| Eingang | Geplant | Tatsächlich nachgewiesen |
|---|---|---|
| A01, 50 EUR, Entwurf | Einreichen und genehmigen; zwei neue Änderungen | Eigener lokaler Node-Prozess; kein Flow |
| A02, 250 EUR, eingereicht | Genehmigen; eine neue Änderung | Eigener lokaler Node-Prozess; kein Flow |
| A03, 500 EUR, genehmigt | Bestehenden Zustand behalten; keine Historie erfinden | Lokal unverändert; für Export ohne neue Spur zurückgehalten |
| A04, 1.500 EUR, abgelehnt | Bestehenden Zustand behalten | Lokal unverändert; kein Export |
| A05, −5 EUR, Entwurf | Eingabe ablehnen, Zustand behalten | Lokaler Betragsfehler; kein Export |

Die synthetischen Annahmen zu Bedarf und Budget stehen im lokalen Prüfer. Keine echte Person hat diese Anträge geprüft. Spätere Produktnachweise müssen Umgebungskennung ohne Geheimnisse, Flow-Version, tatsächlichen Laufstatus, Laufzeit und erwartete/übernommene Werte nennen; Protokolle vor Veröffentlichung von Identitäten oder Tokens bereinigen.

## Nachweise und offene Voraussetzungen

- Power Automate: Benutzerangabe „Je n’ai pas cet accès“; Geschäfts-/Hochschulzugang fehlt. Produktlauf blockiert.
- SharePoint: kein freigegebener Mandant, keine Liste und keine Verbindung nachgewiesen. Produktlauf blockiert.
- SAP/ABAP/OData: kein freigegebenes Testsystem, Konto oder konkreter Dienst nachgewiesen. Produktlauf blockiert; lokaler Export ist kein Ersatznachweis.

Die offizielle [Power-Automate-FAQ](https://learn.microsoft.com/en-us/power-automate/frequently-asked-questions) beschreibt die Anmeldung mit Geschäfts-/Hochschuladresse. [Approvals-Voraussetzungen](https://learn.microsoft.com/en-us/power-automate/get-started-approvals) und [offizieller Workflow-Leitfaden](https://learn.microsoft.com/en-us/power-automate/modern-approvals) erklären Produktkonfiguration und echte Testläufe. Am 18. November 2026 gelesen; diese Quellen sind Anleitung, keine Ausführung auf unserem Konto.
