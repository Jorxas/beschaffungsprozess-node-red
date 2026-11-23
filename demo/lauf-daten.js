window.LAUF = {
 "erzeugt": "2026-11-23T09:08:58Z",
 "node": "v24.13.0",
 "python": "3.13.14",
 "quelleSha256": "2eff3637076f378d3e321b9de3cf20dc20d329b20de576016dfbfb4698180534",
 "schritte": [
  {
   "befehl": "node src/prozess.cjs",
   "rueckgabecode": 0,
   "stdout": "{\n  \"hinweis\": \"Lokaler Prototyp; keine Produktnutzung oder historische Rekonstruktion.\",\n  \"ergebnisse\": [\n    {\n      \"antrag\": {\n        \"id\": \"A01\",\n        \"betrag\": 50,\n        \"zustand\": \"genehmigt\",\n        \"verantwortlich\": \"antragsteller\",\n        \"waehrung\": \"EUR\",\n        \"antragsteller\": \"synthetisch-A01\",\n        \"ausgangszustand\": \"entwurf\",\n        \"aenderungen\": [\n          {\n            \"von\": \"entwurf\",\n            \"nach\": \"eingereicht\",\n            \"aktion\": \"einreichen\",\n            \"person\": {\n              \"kennung\": \"synthetisch-A01\",\n              \"rolle\": \"antragsteller\"\n            },\n            \"zeitpunkt\": \"2026-11-23T09:08:58.555Z\",\n            \"betrag\": 50,\n            \"waehrung\": \"EUR\",\n            \"begruendung\": \"Synthetischer Beschaffungsbedarf zur lokalen Vorführung\",\n            \"entscheidungskriterium\": \"Gültiger Betrag; Einreichung durch Antragsteller\"\n          },\n          {\n            \"von\": \"eingereicht\",\n            \"nach\": \"genehmigt\",\n            \"aktion\": \"genehmigen\",\n            \"person\": {\n              \"kennung\": \"synthetisch-pruefer\",\n              \"rolle\": \"freigabeverantwortlicher\"\n            },\n            \"zeitpunkt\": \"2026-11-23T09:08:58.555Z\",\n            \"betrag\": 50,\n            \"waehrung\": \"EUR\",\n            \"begruendung\": \"Lokales Szenario mit ausdrücklich angenommenem Bedarf und Budget\",\n            \"entscheidungskriterium\": \"Betrag bis einschließlich 500 EUR; Bedarf begründet; Budget verfügbar\",\n            \"bedarf_begruendet\": true,\n            \"budget_verfuegbar\": true\n          }\n        ]\n      },\n      \"hinweis\": \"Nur lokale neue Übergänge protokolliert.\"\n    },\n    {\n      \"antrag\": {\n        \"id\": \"A02\",\n        \"betrag\": 250,\n        \"zustand\": \"genehmigt\",\n        \"verantwortlich\": \"antragsteller\",\n        \"waehrung\": \"EUR\",\n        \"antragsteller\": \"synthetisch-A02\",\n        \"ausgangszustand\": \"eingereicht\",\n        \"aenderungen\": [\n          {\n            \"von\": \"eingereicht\",\n            \"nach\": \"genehmigt\",\n            \"aktion\": \"genehmigen\",\n            \"person\": {\n              \"kennung\": \"synthetisch-pruefer\",\n              \"rolle\": \"freigabeverantwortlicher\"\n            },\n            \"zeitpunkt\": \"2026-11-23T09:08:58.555Z\",\n            \"betrag\": 250,\n            \"waehrung\": \"EUR\",\n            \"begruendung\": \"Lokales Szenario mit ausdrücklich angenommenem Bedarf und Budget\",\n            \"entscheidungskriterium\": \"Betrag bis einschließlich 500 EUR; Bedarf begründet; Budget verfügbar\",\n            \"bedarf_begruendet\": true,\n            \"budget_verfuegbar\": true\n          }\n        ]\n      },\n      \"hinweis\": \"Nur lokale neue Übergänge protokolliert.\"\n    },\n    {\n      \"antrag\": {\n        \"id\": \"A03\",\n        \"betrag\": 500,\n        \"zustand\": \"genehmigt\",\n        \"verantwortlich\": \"antragsteller\",\n        \"waehrung\": \"EUR\",\n        \"antragsteller\": \"synthetisch-A03\",\n        \"ausgangszustand\": \"genehmigt\",\n        \"aenderungen\": []\n      },\n      \"hinweis\": \"Vorhandener Endzustand erhalten; historische Änderungsspur unbekannt.\"\n    },\n    {\n      \"antrag\": {\n        \"id\": \"A04\",\n        \"betrag\": 1500,\n        \"zustand\": \"abgelehnt\",\n        \"verantwortlich\": \"antragsteller\",\n        \"waehrung\": \"EUR\",\n        \"antragsteller\": \"synthetisch-A04\",\n        \"ausgangszustand\": \"abgelehnt\",\n        \"aenderungen\": []\n      },\n      \"hinweis\": \"Vorhandener Endzustand erhalten; historische Änderungsspur unbekannt.\"\n    },\n    {\n      \"antrag\": {\n        \"id\": \"A05\",\n        \"betrag\": -5,\n        \"zustand\": \"entwurf\",\n        \"verantwortlich\": \"antragsteller\",\n        \"waehrung\": \"EUR\",\n        \"antragsteller\": \"synthetisch-A05\",\n        \"ausgangszustand\": \"entwurf\",\n        \"aenderungen\": []\n      },\n      \"fehler\": \"Betrag muss positiv, endlich und centgenau sein.\"\n    }\n  ]\n}",
   "stderr": ""
  },
  {
   "befehl": "node nachweise/pruefe_prozess.cjs",
   "rueckgabecode": 0,
   "stdout": "P12-T02: BESTANDEN; Node v24.13.0; Prüfzeit 2026-11-23T09:08:58.628Z\nOriginale: 5; SHA256 3a32b603fa52824ed32e0483c576398737f050e6a46effa2ce367ccbab438fb8; unverändert.\nA01: entwurf → eingereicht → genehmigt; 2 neue Änderungen.\nA02: eingereicht → genehmigt; 1 neue Änderung.\nA03/A04: vorhandene Endzustände erhalten; jeweils 0 neue Änderungen, Historie unbekannt.\nA05: Einreichung verhindert; bleibt entwurf; 0 Änderungen.\nBESTANDEN: synthetische Testkopien für inklusive Grenze, Betragsablehnung, fehlendes Budget und fehlenden Bedarf.\nBESTANDEN: Rollen/Personen, Selbstfreigabe, Begründung, Entscheidung, Betrag, Zeitfolge, Endzustände und unveränderte Eingaben.",
   "stderr": ""
  },
  {
   "befehl": "python -X utf8 nachweise/pruefe_beispiele.py",
   "rueckgabecode": 0,
   "stdout": "P12-T01: lokale Datenprüfung; keine Zustandsübergänge ausgeführt\nPrüfzeit UTC: 2026-11-23T09:08:58.837859+00:00\nPython: 3.13.14\nEingabe: beispieldaten/antraege.json; SHA256: 3a32b603fa52824ed32e0483c576398737f050e6a46effa2ce367ccbab438fb8\nA01: 50.00 EUR; Zustand entwurf; Betragseinstufung innerhalb\nA02: 250.00 EUR; Zustand eingereicht; Betragseinstufung innerhalb\nA03: 500.00 EUR; Zustand genehmigt; Betragseinstufung innerhalb\nA04: 1500.00 EUR; Zustand abgelehnt; Betragseinstufung oberhalb\nA05: -5.00 EUR; Zustand entwurf; Betragseinstufung ungueltig\nBESTANDEN: 5 unveränderte Anträge; 3 innerhalb, 1 oberhalb, 1 beabsichtigt ungültig.\nA03: inklusive 500-Euro-Grenze bestätigt. A05: Einreichung wegen negativem Betrag verhindern.\nFreigabe bei A01–A03 setzt zusätzlich Bedarf/Budget und eine andere entscheidende Person voraus.",
   "stderr": ""
  }
 ],
 "antraege": [
  {
   "id": "A01",
   "betrag": 50,
   "zustand": "entwurf",
   "verantwortlich": "antragsteller"
  },
  {
   "id": "A02",
   "betrag": 250,
   "zustand": "eingereicht",
   "verantwortlich": "antragsteller"
  },
  {
   "id": "A03",
   "betrag": 500,
   "zustand": "genehmigt",
   "verantwortlich": "antragsteller"
  },
  {
   "id": "A04",
   "betrag": 1500,
   "zustand": "abgelehnt",
   "verantwortlich": "antragsteller"
  },
  {
   "id": "A05",
   "betrag": -5,
   "zustand": "entwurf",
   "verantwortlich": "antragsteller"
  }
 ],
 "vertrag": {
  "version": 1,
  "geltung": "Lokaler Beschaffungsprototyp; kein ERP-, SAP- oder Power-Automate-Vertrag",
  "waehrung": "EUR",
  "betragsgrenze_euro": 500,
  "zustaende": [
   "entwurf",
   "eingereicht",
   "genehmigt",
   "abgelehnt"
  ],
  "uebergaenge": {
   "einreichen": {
    "von": "entwurf",
    "nach": "eingereicht",
    "rolle": "antragsteller"
   },
   "genehmigen": {
    "von": "eingereicht",
    "nach": "genehmigt",
    "rolle": "freigabeverantwortlicher"
   },
   "ablehnen": {
    "von": "eingereicht",
    "nach": "abgelehnt",
    "rolle": "freigabeverantwortlicher"
   }
  },
  "struktur": {
   "antrag": {
    "id": "Vorhandene Antragskennung",
    "betrag": "Positive endliche EUR-Zahl mit höchstens zwei Nachkommastellen; Fehlerbeispiel bleibt erhalten",
    "zustand": "Aktueller Zustand aus zustaende",
    "verantwortlich": "antragsteller; fachlicher Inhaber bleibt unverändert",
    "waehrung": "EUR",
    "antragsteller": "Synthetische Personenkennung; keine Anmeldung oder Identitätsprüfung",
    "ausgangszustand": "Zustand der importierten Momentaufnahme",
    "aenderungen": "Liste ausschließlich der seit dem Import ausgeführten Übergänge"
   },
   "aktion": {
    "art": "einreichen, genehmigen oder ablehnen",
    "person": {
     "kennung": "Nichtleere synthetische Kennung",
     "rolle": "Rolle gemäß Übergang"
    },
    "zeitpunkt": "UTC im Format YYYY-MM-DDTHH:mm:ss.sssZ; nicht vor letzter Änderung",
    "begruendung": "Nichtleerer Text",
    "bedarf_begruendet": "Wahrheitswert, bei Entscheidungen erforderlich",
    "budget_verfuegbar": "Wahrheitswert, bei Entscheidungen erforderlich"
   },
   "aenderung": {
    "von": "Vorheriger Zustand",
    "nach": "Folgezustand",
    "aktion": "Ausgeführte Aktion",
    "person": "Kopie der Kennung und Rolle",
    "zeitpunkt": "Zeitpunkt der lokalen Aktion",
    "betrag": "Betrag bei Ausführung",
    "waehrung": "EUR",
    "begruendung": "Übernommener Begründungstext",
    "entscheidungskriterium": "Aus den fachlichen Regeln abgeleiteter Grund",
    "bedarf_begruendet": "Nur bei Entscheidungen: übernommener Wahrheitswert",
    "budget_verfuegbar": "Nur bei Entscheidungen: übernommener Wahrheitswert"
   }
  },
  "regeln": [
   "Genehmigung nur bis einschließlich 500 EUR bei begründetem Bedarf und verfügbarem Budget.",
   "Ablehnung nur bei Überschreitung der Grenze oder fehlendem Bedarf oder Budget.",
   "Entscheidende Person muss vom Antragsteller verschieden sein; keine Selbstfreigabe.",
   "Genehmigt und abgelehnt sind Endzustände. Ungültiger Betrag verhindert Einreichung.",
   "Importierte Historie wird nicht erfunden. Das Protokoll ist lokal und nicht manipulationssicher."
  ]
 }
};
