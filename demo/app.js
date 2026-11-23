(function () {
  "use strict";
  var TEXT = window.TEXT, LAUF = window.LAUF, P = window.ProzessEcht;
  var vertrag = LAUF.vertrag;
  var lang = "de";
  var antrag = null;          // aktueller Antrag, wie ihn der echte Prozesscode zurückgibt
  var meldung = null;         // letzte Rückmeldung: { art: "ok"|"fehler", von, nach, text }
  var $ = function (id) { return document.getElementById(id); };

  function t(key, vars) {
    var s = TEXT[lang][key] !== undefined ? TEXT[lang][key] : TEXT.de[key];
    if (s === undefined) s = key;
    if (typeof s === "string" && vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  // Texte aus dem Prozesscode (Meldungen, Kriterien) sind deutsch; für Französisch übersetzen.
  function code(text) {
    var m = TEXT[lang].codeTexte || {};
    if (m[text]) return m[text];
    if (lang === "fr" && text.indexOf("; ") > 0) {
      var teile = text.split("; ").map(function (x) { return m[x] || x; });
      return teile.join(" ; ");
    }
    return text;
  }
  function el(tag, attrs, kinder) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") e.textContent = attrs[k]; else if (k === "class") e.className = attrs[k]; else e.setAttribute(k, attrs[k]);
    });
    (kinder || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }
  function euro(n) {
    if (typeof n !== "number") return String(n);
    return new Intl.NumberFormat(TEXT[lang].htmlLang, { style: "currency", currency: "EUR" }).format(n);
  }
  function zeit(iso) {
    return new Intl.DateTimeFormat(TEXT[lang].htmlLang, { dateStyle: "medium", timeStyle: "medium", timeZone: "UTC" }).format(new Date(iso));
  }
  function zustandName(z) { return t("zustand_" + z); }

  // ---------- Antrag laden ----------
  function original(id) { return JSON.parse(JSON.stringify(LAUF.antraege.filter(function (a) { return a.id === id; })[0])); }
  function parseBetrag(text) {
    var s = String(text).trim().replace(/\s/g, "").replace(",", ".");
    return /^[-+−]?\d+(\.\d+)?$/.test(s) ? Number(s.replace("−", "-")) : text;
  }
  function laden() {
    var wahl = $("antrag").value;
    var basis = wahl === "eigen"
      ? { id: "EIGEN", betrag: parseBetrag($("eigen-betrag").value), zustand: $("eigen-zustand").value, verantwortlich: "antragsteller" }
      : original(wahl);
    antrag = P.ausMomentaufnahme(basis);
    personOption();
    meldung = null;
    vorschlag();
    zeichnen();
  }

  function vorschlag() {
    var z = antrag.zustand;
    var art = z === "eingereicht" ? (typeof antrag.betrag === "number" && antrag.betrag <= vertrag.betragsgrenze_euro ? "genehmigen" : "ablehnen") : "einreichen";
    $("aktion").value = art;
    var einreichen = art === "einreichen";
    $("person").value = einreichen ? "antragsteller" : "pruefer";
    $("rolle").value = einreichen ? "antragsteller" : "freigabeverantwortlicher";
    $("begruendung").value = t("standardBegruendung");
    $("bedarf").checked = true;
    $("budget").checked = true;
    entscheidungsfelder();
  }
  function entscheidungsfelder() {
    var entscheidung = $("aktion").value !== "einreichen";
    $("bedarf").disabled = !entscheidung;
    $("budget").disabled = !entscheidung;
  }

  // ---------- Aktion ausführen (ruft den echten Code auf) ----------
  function ausfuehren(ev) {
    ev.preventDefault();
    var art = $("aktion").value;
    var kennung = $("person").value === "antragsteller" ? antrag.antragsteller : "synthetisch-pruefer";
    var aktion = { art: art, zeitpunkt: new Date().toISOString(), person: { kennung: kennung, rolle: $("rolle").value },
      begruendung: $("begruendung").value };
    if (art !== "einreichen") { aktion.bedarf_begruendet = $("bedarf").checked; aktion.budget_verfuegbar = $("budget").checked; }
    var vorher = antrag.zustand;
    try {
      antrag = P.uebergang(antrag, aktion);
      meldung = { art: "ok", von: vorher, nach: antrag.zustand };
      vorschlag();
      $("begruendung").value = t("standardBegruendung");
    } catch (e) {
      meldung = { art: "fehler", text: e.message };
    }
    zeichnen();
  }

  // ---------- Darstellung ----------
  function optionen(select, liste, auswahl) {
    var alt = select.value;
    select.textContent = "";
    liste.forEach(function (o) { select.appendChild(el("option", { value: o[0], text: o[1] })); });
    select.value = auswahl || alt || liste[0][0];
  }
  function auswahlLeeren() {
    optionen($("antrag"), LAUF.antraege.map(function (a) {
      return [a.id, a.id + " · " + euro(a.betrag) + " · " + zustandName(a.zustand)];
    }).concat([["eigen", t("eigener")]]));
    optionen($("eigen-zustand"), vertrag.zustaende.slice(0, 2).map(function (z) { return [z, zustandName(z)]; }));
    optionen($("aktion"), Object.keys(vertrag.uebergaenge).map(function (a) {
      return [a, t("aktion" + a.charAt(0).toUpperCase() + a.slice(1))];
    }));
    personOption();
    optionen($("rolle"), [["antragsteller", t("rolleAntragsteller")], ["freigabeverantwortlicher", t("rolleFreigabe")]]);
  }

  function personOption() {
    optionen($("person"), [["antragsteller", t("personAntragsteller", { k: antrag ? antrag.antragsteller : "" })], ["pruefer", t("personPruefer")]]);
  }

  function antragsdaten() {
    var dl = $("antragsdaten");
    dl.textContent = "";
    function z(k, v) { dl.appendChild(el("div", {}, [el("dt", { text: t(k) }), el("dd", { text: v })])); }
    z("antragsteller", antrag.antragsteller);
    z("betrag", euro(antrag.betrag));
    z("ausgangszustand", zustandName(antrag.ausgangszustand));
    z("zustandJetzt", zustandName(antrag.zustand));
  }

  function zustandsbild() {
    var box = $("zustaende");
    box.textContent = "";
    box.setAttribute("aria-label", t("zustaendeLabel") + ": " + zustandName(antrag.zustand));
    function knoten(z) {
      var k = el("div", { class: "z-knoten" + (antrag.zustand === z ? " aktiv" : ""), text: zustandName(z) });
      if (antrag.zustand === z) k.setAttribute("data-aktuell", "ja");
      return k;
    }
    function pfeil(art) {
      return el("div", { class: "z-pfeil", text: t("aktion" + art.charAt(0).toUpperCase() + art.slice(1)).split(" ")[0] + " →" });
    }
    var rechts = el("div", { class: "z-ziele" }, [
      el("div", { class: "z-zeile" }, [pfeil("genehmigen"), knoten("genehmigt")]),
      el("div", { class: "z-zeile" }, [pfeil("ablehnen"), knoten("abgelehnt")])
    ]);
    box.appendChild(el("div", { class: "z-reihe" }, [knoten("entwurf"), pfeil("einreichen"), knoten("eingereicht"), rechts]));
  }

  function meldungZeichnen() {
    var m = $("meldung");
    m.textContent = "";
    m.className = "meldung";
    if (!meldung) { m.textContent = t("nochNichts"); m.classList.add("leise"); return; }
    if (meldung.art === "ok") {
      m.classList.add("ok");
      m.appendChild(el("strong", { text: t("erfolg", { von: zustandName(meldung.von), nach: zustandName(meldung.nach) }) }));
    } else {
      m.classList.add("fehler");
      m.appendChild(el("strong", { text: t("abweisung", { text: code(meldung.text) }) }));
      if (lang === "fr") m.appendChild(el("div", { class: "klein", text: t("codeMeldung", { text: meldung.text }) }));
    }
  }

  function protokollZeichnen() {
    var ol = $("protokoll");
    ol.textContent = "";
    if (!antrag.aenderungen.length) { ol.appendChild(el("li", { class: "leer", text: t("protokollLeer") })); }
    antrag.aenderungen.forEach(function (a) {
      var zeilen = [
        [t("person"), a.person.kennung + " (" + a.person.rolle + ")"],
        [t("zeitpunkt"), zeit(a.zeitpunkt)],
        [t("betrag"), euro(a.betrag)],
        [t("begruendung"), code(a.begruendung)],
        [t("kriterium"), code(a.entscheidungskriterium)]
      ];
      if (a.bedarf_begruendet !== undefined) {
        zeilen.push([t("bedarf"), String(a.bedarf_begruendet)]);
        zeilen.push([t("budget"), String(a.budget_verfuegbar)]);
      }
      var dl = el("dl");
      zeilen.forEach(function (z) { dl.appendChild(el("div", {}, [el("dt", { text: z[0] }), el("dd", { text: z[1] })])); });
      ol.appendChild(el("li", {}, [
        el("div", { class: "p-kopf" }, [el("strong", { text: zustandName(a.von) + " → " + zustandName(a.nach) }), el("code", { text: a.aktion })]),
        dl
      ]));
    });
    $("roh").textContent = JSON.stringify(antrag, null, 2);
  }

  function alleBeispiele() {
    var kopie = JSON.parse(JSON.stringify(LAUF.antraege));
    var erg = P.beispieleDurchlaufen(kopie);
    var tb = document.querySelector("#alle tbody");
    tb.textContent = "";
    erg.forEach(function (r) {
      var a = r.antrag;
      var tr = el("tr", { class: r.fehler ? "falsch" : "" });
      [[t("colId"), a.id], [t("colBetrag"), euro(a.betrag)],
       [t("colVerlauf"), zustandName(a.ausgangszustand) + " → " + zustandName(a.zustand)],
       [t("colAenderungen"), String(a.aenderungen.length)],
       [t("colHinweis"), code(r.fehler || r.hinweis)]].forEach(function (c) {
        tr.appendChild(el("td", { "data-l": c[0], text: c[1] }));
      });
      tb.appendChild(tr);
    });
  }

  function schritte() {
    var box = $("schritte");
    box.textContent = "";
    LAUF.schritte.forEach(function (s) {
      box.appendChild(el("details", { class: "schritt" }, [
        el("summary", {}, [el("code", { text: s.befehl }), el("span", { class: "rc", text: " · " + t("rueckgabe") + " " + s.rueckgabecode })]),
        el("p", { class: "klein", text: t("ausgabe") }),
        el("pre", { text: s.stdout })
      ]));
    });
  }

  function statischeTexte() {
    document.documentElement.lang = TEXT[lang].htmlLang;
    document.title = t("titel");
    document.querySelectorAll("[data-i]").forEach(function (e) { e.textContent = t(e.getAttribute("data-i")); });
    document.querySelectorAll("[data-aria]").forEach(function (e) { e.setAttribute("aria-label", t(e.getAttribute("data-aria"))); });
    var ul = $("regeln"); ul.textContent = "";
    TEXT[lang].regeln.forEach(function (r) { ul.appendChild(el("li", { text: r })); });
    $("ehrlich").textContent = t("ehrlich", { sha: LAUF.quelleSha256.slice(0, 12) + "…" });
    var datum = new Intl.DateTimeFormat(TEXT[lang].htmlLang, { dateStyle: "long", timeZone: "UTC" }).format(new Date(LAUF.erzeugt));
    $("echt-lead").textContent = t("echtLead", { datum: datum, node: LAUF.node, py: LAUF.python });
    document.querySelectorAll("#sprache button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
  }

  function zeichnen() {
    $("eigen").hidden = $("antrag").value !== "eigen";
    antragsdaten();
    zustandsbild();
    meldungZeichnen();
    protokollZeichnen();
  }

  function alles() {
    var a = $("antrag").value, ez = $("eigen-zustand").value;
    var akt = [$("aktion").value, $("person").value, $("rolle").value];
    var bg = $("begruendung").value, alteStd = TEXT[lang === "de" ? "fr" : "de"].standardBegruendung;
    statischeTexte();
    auswahlLeeren();
    if (a) $("antrag").value = a;
    if (ez) $("eigen-zustand").value = ez;
    if (akt[0]) { $("aktion").value = akt[0]; $("person").value = akt[1]; $("rolle").value = akt[2]; }
    $("begruendung").value = bg === alteStd ? t("standardBegruendung") : bg;
    zeichnen();
    alleBeispiele();
    schritte();
  }

  function spracheSetzen(neu) {
    lang = neu;
    try {
      var url = new URL(location.href);
      if (neu === "de") url.searchParams.delete("lang"); else url.searchParams.set("lang", neu);
      history.replaceState(null, "", url);
    } catch (e) { /* ohne Adressleiste egal */ }
    alles();
  }

  document.querySelectorAll("#sprache button").forEach(function (b) {
    b.addEventListener("click", function () { spracheSetzen(b.getAttribute("data-lang")); });
  });
  $("antrag").addEventListener("change", laden);
  $("eigen-betrag").addEventListener("input", laden);
  $("eigen-zustand").addEventListener("change", laden);
  $("aktion").addEventListener("change", function () {
    var art = $("aktion").value;
    $("rolle").value = art === "einreichen" ? "antragsteller" : "freigabeverantwortlicher";
    $("person").value = art === "einreichen" ? "antragsteller" : "pruefer";
    entscheidungsfelder();
  });
  $("aktionsform").addEventListener("submit", ausfuehren);
  $("reset").addEventListener("click", laden);

  if (new URLSearchParams(location.search).get("lang") === "fr") lang = "fr";
  statischeTexte();
  auswahlLeeren();
  $("antrag").value = "A01";
  $("eigen-zustand").value = "entwurf";
  laden();
  alleBeispiele();
  schritte();
})();
