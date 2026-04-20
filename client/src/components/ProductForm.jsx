// Formulář pro přidání nebo úpravu produktu
// Pokud prop 'produkt' není null, jde o editaci – předvyplníme pole
// Obsahuje klientskou validaci před odesláním na server

import { useState, useEffect } from "react";

const KATEGORIE = ["Elektronika", "Příslušenství", "Komponenty", "Audio", "Ostatní"];

// Výchozí prázdný stav formuláře
const PRAZDNY_FORMULAR = {
  nazev: "",
  kategorie: "Elektronika",
  cena: "",
  mnozstvi: "",
  popis: "",
};

function ProductForm({ produkt, onUloz, onZavrit }) {
  // Stav formulářových dat
  const [formData, setFormData] = useState(PRAZDNY_FORMULAR);

  // Stav chyb validace – objekt { nazev: "chyba", cena: "chyba", ... }
  const [chybyValidace, setChybyValidace] = useState({});

  // Stav odesílání – zabraňuje dvojitému odeslání
  const [odesilani, setOdesilani] = useState(false);

  // Serverová chyba (odlišná od klientské validace)
  const [serverChyba, setServerChyba] = useState(null);

  // Pokud editujeme existující produkt, předvyplníme formulář jeho daty
  useEffect(() => {
    if (produkt) {
      setFormData({
        nazev: produkt.nazev,
        kategorie: produkt.kategorie,
        cena: produkt.cena.toString(),
        mnozstvi: produkt.mnozstvi.toString(),
        popis: produkt.popis || "",
      });
    } else {
      setFormData(PRAZDNY_FORMULAR);
    }
    // Reset chyb při otevření formuláře
    setChybyValidace({});
    setServerChyba(null);
  }, [produkt]);

  // Aktualizace jednoho pole a zároveň vymazání jeho chyby
  const zmenPole = (klic, hodnota) => {
    setFormData((pred) => ({ ...pred, [klic]: hodnota }));
    setChybyValidace((pred) => ({ ...pred, [klic]: undefined }));
  };

  // Klientská validace před odesláním – vrátí true pokud je vše v pořádku
  const validuj = () => {
    const chyby = {};

    if (!formData.nazev.trim()) {
      chyby.nazev = "Název produktu je povinný";
    } else if (formData.nazev.trim().length < 3) {
      chyby.nazev = "Název musí mít alespoň 3 znaky";
    }

    if (!formData.kategorie) {
      chyby.kategorie = "Vyberte kategorii";
    }

    if (formData.cena === "" || isNaN(formData.cena)) {
      chyby.cena = "Zadejte platnou cenu";
    } else if (parseFloat(formData.cena) < 0) {
      chyby.cena = "Cena nesmí být záporná";
    }

    if (formData.mnozstvi === "" || isNaN(formData.mnozstvi)) {
      chyby.mnozstvi = "Zadejte platné množství";
    } else if (parseInt(formData.mnozstvi) < 0) {
      chyby.mnozstvi = "Množství nesmí být záporné";
    } else if (!Number.isInteger(parseFloat(formData.mnozstvi))) {
      chyby.mnozstvi = "Množství musí být celé číslo";
    }

    setChybyValidace(chyby);

    // Formulář je validní, pokud objekt chyb neobsahuje žádné klíče
    return Object.keys(chyby).length === 0;
  };

  // Odeslání formuláře
  const odeslat = async (e) => {
    e.preventDefault();
    setServerChyba(null);

    // Pokud validace selže, nepokračujeme
    if (!validuj()) return;

    setOdesilani(true);
    try {
      await onUloz({
        nazev: formData.nazev.trim(),
        kategorie: formData.kategorie,
        cena: parseFloat(formData.cena),
        mnozstvi: parseInt(formData.mnozstvi),
        popis: formData.popis.trim(),
      });
    } catch (err) {
      // Zobrazíme serverovou chybu (např. chyba při ukládání do souboru)
      setServerChyba(err.message);
    } finally {
      setOdesilani(false);
    }
  };

  return (
    <div className="formular-kontejner">
      {/* Záhlaví formuláře se závisí na tom, jestli přidáváme nebo upravujeme */}
      <div className="formular-hlavicka">
        <h2>{produkt ? "✏️ Upravit produkt" : "➕ Nový produkt"}</h2>
        <button className="zavrit-btn" onClick={onZavrit} type="button">
          ✕
        </button>
      </div>

      {/* Serverová chyba */}
      {serverChyba && (
        <div className="alert alert-chyba" style={{ marginBottom: "1rem" }}>
          ⚠️ {serverChyba}
        </div>
      )}

      <form onSubmit={odeslat} noValidate>
        {/* Název */}
        <div className={`formular-skupina ${chybyValidace.nazev ? "ma-chybu" : ""}`}>
          <label className="formular-label">
            Název produktu <span className="povinne">*</span>
          </label>
          <input
            type="text"
            className="formular-input"
            placeholder="Např. Notebook Dell XPS 15"
            value={formData.nazev}
            onChange={(e) => zmenPole("nazev", e.target.value)}
          />
          {chybyValidace.nazev && (
            <span className="chyba-text">{chybyValidace.nazev}</span>
          )}
        </div>

        {/* Kategorie */}
        <div className={`formular-skupina ${chybyValidace.kategorie ? "ma-chybu" : ""}`}>
          <label className="formular-label">
            Kategorie <span className="povinne">*</span>
          </label>
          <select
            className="formular-input"
            value={formData.kategorie}
            onChange={(e) => zmenPole("kategorie", e.target.value)}
          >
            {KATEGORIE.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
          {chybyValidace.kategorie && (
            <span className="chyba-text">{chybyValidace.kategorie}</span>
          )}
        </div>

        {/* Cena a množství vedle sebe */}
        <div className="formular-radek">
          <div className={`formular-skupina ${chybyValidace.cena ? "ma-chybu" : ""}`}>
            <label className="formular-label">
              Cena (Kč) <span className="povinne">*</span>
            </label>
            <input
              type="number"
              className="formular-input"
              placeholder="0"
              min="0"
              step="0.01"
              value={formData.cena}
              onChange={(e) => zmenPole("cena", e.target.value)}
            />
            {chybyValidace.cena && (
              <span className="chyba-text">{chybyValidace.cena}</span>
            )}
          </div>

          <div className={`formular-skupina ${chybyValidace.mnozstvi ? "ma-chybu" : ""}`}>
            <label className="formular-label">
              Množství (ks) <span className="povinne">*</span>
            </label>
            <input
              type="number"
              className="formular-input"
              placeholder="0"
              min="0"
              step="1"
              value={formData.mnozstvi}
              onChange={(e) => zmenPole("mnozstvi", e.target.value)}
            />
            {chybyValidace.mnozstvi && (
              <span className="chyba-text">{chybyValidace.mnozstvi}</span>
            )}
          </div>
        </div>

        {/* Popis – volitelné pole */}
        <div className="formular-skupina">
          <label className="formular-label">Popis</label>
          <textarea
            className="formular-input formular-textarea"
            placeholder="Krátký popis produktu (volitelné)"
            rows={3}
            value={formData.popis}
            onChange={(e) => zmenPole("popis", e.target.value)}
          />
        </div>

        {/* Akční tlačítka */}
        <div className="formular-akce">
          <button
            type="button"
            className="btn btn-sekundarni"
            onClick={onZavrit}
            disabled={odesilani}
          >
            Zrušit
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={odesilani}
          >
            {odesilani
              ? "Ukládám..."
              : produkt
              ? "💾 Uložit změny"
              : "➕ Přidat produkt"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
