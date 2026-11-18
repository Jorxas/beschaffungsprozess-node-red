"""Kleine lokale Datenprüfung für P12-T01; keine Prozessanwendung."""

import hashlib
import json
import platform
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path


def pruefen():
    projektordner = Path(__file__).resolve().parents[1]
    datei = projektordner / "beispieldaten" / "antraege.json"
    inhalt = datei.read_bytes()
    pruefsumme = hashlib.sha256(inhalt).hexdigest()
    assert pruefsumme == "3a32b603fa52824ed32e0483c576398737f050e6a46effa2ce367ccbab438fb8", "Originalbeispiele wurden verändert"
    antraege = json.loads(inhalt.decode("utf-8-sig"), parse_float=Decimal)
    assert len(antraege) == 5, "Genau fünf Originalbeispiele erwartet"
    assert [antrag["id"] for antrag in antraege] == ["A01", "A02", "A03", "A04", "A05"], "Kennungen oder Reihenfolge abweichend"
    erwartete_zustaende = ["entwurf", "eingereicht", "genehmigt", "abgelehnt", "entwurf"]
    erwartete_einstufungen = ["innerhalb", "innerhalb", "innerhalb", "oberhalb", "ungueltig"]
    anzahl = {"innerhalb": 0, "oberhalb": 0, "ungueltig": 0}
    print("P12-T01: lokale Datenprüfung; keine Zustandsübergänge ausgeführt")
    print(f"Prüfzeit UTC: {datetime.now(timezone.utc).isoformat()}")
    print(f"Python: {platform.python_version()}")
    print(f"Eingabe: beispieldaten/antraege.json; SHA256: {pruefsumme}")
    for antrag, zustand, erwartung in zip(antraege, erwartete_zustaende, erwartete_einstufungen):
        assert set(antrag) == {"id", "betrag", "zustand", "verantwortlich"}, "Unerwartete Datenfelder"
        assert antrag["zustand"] == zustand, "Momentaufnahme abweichend"
        assert antrag["verantwortlich"] == "antragsteller", "Fachlicher Inhaber abweichend"
        assert type(antrag["betrag"]) in (int, Decimal), "Betrag muss eine Zahl sein"
        betrag = Decimal(antrag["betrag"])
        gueltig = betrag.is_finite() and betrag > 0 and betrag == betrag.quantize(Decimal("0.01"))
        einstufung = "ungueltig" if not gueltig else "innerhalb" if betrag <= 500 else "oberhalb"
        assert einstufung == erwartung, f"Unerwartete Betragseinstufung: {antrag['id']}"
        anzahl[einstufung] += 1
        print(f"{antrag['id']}: {betrag:.2f} EUR; Zustand {zustand}; Betragseinstufung {einstufung}")
    assert anzahl == {"innerhalb": 3, "oberhalb": 1, "ungueltig": 1}, "Fallverteilung abweichend"
    assert antraege[2]["betrag"] == 500, "Beispiel für inklusive Grenze fehlt"
    print("BESTANDEN: 5 unveränderte Anträge; 3 innerhalb, 1 oberhalb, 1 beabsichtigt ungültig.")
    print("A03: inklusive 500-Euro-Grenze bestätigt. A05: Einreichung wegen negativem Betrag verhindern.")
    print("Freigabe bei A01–A03 setzt zusätzlich Bedarf/Budget und eine andere entscheidende Person voraus.")


if __name__ == "__main__":
    pruefen()
