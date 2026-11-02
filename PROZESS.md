# Beschaffungsprozess — Textskizze P12-T01

Festgelegt am 1. November 2026. Fachlicher Entwurf mit lokal geprüften Beispielen; Anwendung und Änderungsprotokoll folgen erst in P12-T02.

## Rollen und Regeln

- Antragsteller: erstellt den Entwurf und reicht einen gültigen Antrag ein. Das vorhandene Feld `verantwortlich: antragsteller` bezeichnet den fachlichen Inhaber auch nach einer Entscheidung, nicht die nächste bearbeitende Rolle.
- Freigabeverantwortlicher: eine andere Person als der Antragsteller; prüft Bedarf, Budget und Betrag und entscheidet mit Begründung. Keine Selbstfreigabe. Konkrete Personen fehlen in den Beispielen; die Rollentrennung lässt sich hier nur festlegen, nicht anhand von Personen prüfen.
- Betrag: synthetisch als Euro-Gesamtbetrag ausgelegt; positive endliche Zahl mit höchstens zwei Nachkommastellen. Null, negative oder fehlende Beträge verhindern die Einreichung. Ein Eingabefehler ist keine fachliche Ablehnung.
- Betragsgrenze: bis einschließlich 500,00 Euro kann der Freigabeverantwortliche genehmigen, wenn Bedarf begründet und Budget verfügbar sind. Bei fehlendem Bedarf oder Budget ist auch innerhalb der Grenze eine begründete Ablehnung möglich.
- Über 500,00 Euro: Ablehnung durch den Freigabeverantwortlichen mit Grund „Außerhalb der Betragsgrenze dieses kleinen Beschaffungsprozesses“. Eine Weiterleitung an ein anderes Gremium gehört nicht zu dieser Phase.
- Genehmigt und abgelehnt sind Endzustände dieses Entwurfs. Keine nachträgliche Änderung oder erneute Einreichung im festgelegten Ablauf.

## Kleine Textskizze

```text
Antragsteller: Entwurf
  → Eingabe prüfen
      ungültig → bleibt Entwurf; Eingabe korrigieren
      gültig   → Antragsteller reicht ein → eingereicht
  → andere Person als Freigabeverantwortlicher prüft
      Betrag > 500 Euro                       → abgelehnt (Betragsgrenze)
      Betrag <= 500 Euro, Bedarf/Budget fehlen → abgelehnt (Begründung)
      Betrag <= 500 Euro, Bedarf/Budget erfüllt → genehmigt (Begründung)
```

## Erwartungen für die fünf vorhandenen Anträge

Die Eingabedatei `beispieldaten/antraege.json` bleibt unverändert. Ihre Zustände sind Momentaufnahmen, keine nachgewiesene Änderungsspur. Für die erwarteten Freigaben A01 bis A03 nehmen wir ausschließlich für die Planung begründeten Bedarf und verfügbares Budget an; diese Angaben stehen nicht in der Datei.

| Antrag | Betrag (EUR) | Vorhandener Zustand | Geplanter Verlauf / Einordnung | Entscheidende Rolle und Grund |
|---|---:|---|---|---|
| A01 | 50,00 | entwurf | Entwurf → eingereicht → genehmigt | Freigabeverantwortlicher; unter Grenze, Bedarf/Budget angenommen |
| A02 | 250,00 | eingereicht | Eingereicht → genehmigt | Freigabeverantwortlicher; unter Grenze, Bedarf/Budget angenommen |
| A03 | 500,00 | genehmigt | Endzustand mit Regel vereinbar; keine neue Entscheidung ausführen | Freigabeverantwortlicher wäre zuständig; Grenzbetrag zulässig, Bedarf/Budget angenommen |
| A04 | 1.500,00 | abgelehnt | Endzustand mit Regel vereinbar; keine neue Entscheidung ausführen | Freigabeverantwortlicher wäre zuständig; über Grenze |
| A05 | −5,00 | entwurf | Bleibt Entwurf; Einreichung verhindern | Antragsteller korrigiert ungültigen Betrag; keine Freigabeentscheidung |

## Lokale Prüfung und Grenze

`nachweise/pruefe_beispiele.py` prüft Anzahl, Kennungen, Felder, vorhandene Zustände und die erwartete Betragseinstufung. Erwartet: drei innerhalb der Freigabegrenze, einer darüber, ein ungültiger Betrag. A05 muss als beabsichtigter Fehlerfall erkannt werden. Der Prüflauf verändert keinen Antrag und führt keine Zustandsübergänge aus.

Bedarf, Budget, Personenberechtigungen und historische Entscheidungen sind damit nicht nachgewiesen. LASTENHEFT A1 bis A4 bleiben offen. Power Automate, SharePoint und SAP werden hier nicht verwendet; Microsoft-Mandant und SAP-Zugang sind für spätere Varianten erforderlich und wurden in dieser Phase weder eingerichtet noch geprüft.
