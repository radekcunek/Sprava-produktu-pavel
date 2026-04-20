// Karta produktu s 3D tilt efektem, obrázkem a pokročilými animacemi
import { useState, useRef } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";

const IKONY_KATEGORII = {
  Elektronika: "💻",
  Příslušenství: "🖱️",
  Komponenty: "⚙️",
  Audio: "🔊",
  Ostatní: "📦",
};

// Gradient pozadí pro případ, že obrázek selže
const GRADIENT_KATEGORII = {
  Elektronika: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  Příslušenství: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  Komponenty: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  Audio: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  Ostatní: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
};

function ProductCard({ produkt, onUpravit, onSmazat, index }) {
  const [obrazekSelhal, setObrazekSelhal] = useState(false);
  const [obrazekNacten, setObrazekNacten] = useState(false);
  const [oblibeny, setOblibeny] = useState(false);

  const kartaRef = useRef(null);
  const scrollRef = useScrollReveal(index * 70);

  const stav =
    produkt.mnozstvi === 0 ? "vyprodano" : produkt.mnozstvi < 5 ? "malo" : "dostupne";

  const stavTexty = { vyprodano: "Vyprodáno", malo: "Málo skladem", dostupne: "Skladem" };

  // 3D tilt – sledujeme pozici myši a rotujeme kartu podle ní
  const handleMouseMove = (e) => {
    const karta = kartaRef.current;
    if (!karta) return;
    const rect = karta.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const stredX = rect.width / 2;
    const stredY = rect.height / 2;
    // Omezíme rotaci na ±8 stupňů aby to nepůsobilo přehnaně
    const rotX = ((y - stredY) / stredY) * -8;
    const rotY = ((x - stredX) / stredX) * 8;
    karta.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.02)`;
    // Posuneme highlight světla podle myši
    karta.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
    karta.style.setProperty("--my", `${(y / rect.height) * 100}%`);
  };

  // Po opuštění karty plynule vrátíme do původní polohy
  const handleMouseLeave = () => {
    const karta = kartaRef.current;
    if (!karta) return;
    karta.style.transform = "";
  };

  // Ripple efekt na tlačítkách – vytvoří kroužek který se rozletí
  const ripple = (e) => {
    const btn = e.currentTarget;
    const kruh = document.createElement("span");
    const prumer = Math.max(btn.offsetWidth, btn.offsetHeight);
    const rect = btn.getBoundingClientRect();
    kruh.style.cssText = `
      position:absolute; width:${prumer}px; height:${prumer}px;
      left:${e.clientX - rect.left - prumer / 2}px;
      top:${e.clientY - rect.top - prumer / 2}px;
      background:rgba(255,255,255,0.35); border-radius:50%;
      transform:scale(0); animation:rippleAnim 0.5s linear; pointer-events:none;
    `;
    btn.style.position = "relative";
    btn.style.overflow = "hidden";
    btn.appendChild(kruh);
    setTimeout(() => kruh.remove(), 500);
  };

  return (
    <div ref={scrollRef} className="scroll-animovat">
    <div
      ref={kartaRef}
      className="produkt-karta"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Světelný highlight efekt který sleduje myš */}
      <div className="karta-highlight" />

      {/* Obrázek produktu */}
      <div className="karta-obrazek-obal">
        {!obrazekSelhal && produkt.obrazek ? (
          <>
            {/* Blur placeholder dokud se obrázek načítá */}
            {!obrazekNacten && (
              <div
                className="obrazek-placeholder"
                style={{ background: GRADIENT_KATEGORII[produkt.kategorie] }}
              />
            )}
            <img
              src={produkt.obrazek}
              alt={produkt.nazev}
              className={`karta-obrazek ${obrazekNacten ? "obrazek-nacten" : ""}`}
              onLoad={() => setObrazekNacten(true)}
              onError={() => setObrazekSelhal(true)}
              loading="lazy"
            />
          </>
        ) : (
          // Fallback – gradient s emoji pokud obrázek selže nebo chybí
          <div
            className="obrazek-fallback"
            style={{ background: GRADIENT_KATEGORII[produkt.kategorie] || GRADIENT_KATEGORII.Ostatní }}
          >
            <span className="fallback-ikona">{IKONY_KATEGORII[produkt.kategorie] || "📦"}</span>
          </div>
        )}

        {/* Badge stavu přes obrázek */}
        <span className={`stav-badge stav-${stav}`}>{stavTexty[stav]}</span>

        {/* Tlačítko oblíbené */}
        <button
          className={`oblibeny-btn ${oblibeny ? "oblibeny-aktivni" : ""}`}
          onClick={() => setOblibeny(!oblibeny)}
          title={oblibeny ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
        >
          {oblibeny ? "❤️" : "🤍"}
        </button>

        {/* Overlay s tlačítky při hoveru obrázku */}
        <div className="obrazek-overlay">
          <button
            className="overlay-btn"
            onClick={(e) => { ripple(e); onUpravit(produkt); }}
          >
            ✏️ Upravit
          </button>
        </div>
      </div>

      {/* Tělo karty */}
      <div className="karta-telo">
        <span className="produkt-kategorie">{IKONY_KATEGORII[produkt.kategorie]} {produkt.kategorie}</span>
        <h3 className="produkt-nazev">{produkt.nazev}</h3>
        {produkt.popis && <p className="produkt-popis">{produkt.popis}</p>}

        <div className="produkt-detaily">
          <div className="produkt-cena">
            {produkt.cena.toLocaleString("cs-CZ")} <span className="mena">Kč</span>
          </div>
          <div className={`produkt-mnozstvi mnozstvi-${stav}`}>
            📦 {produkt.mnozstvi} ks
          </div>
        </div>

        <div className="produkt-datum">
          Přidáno {new Date(produkt.datumPridani).toLocaleDateString("cs-CZ")}
        </div>

        <div className="karta-akce">
          <button
            className="btn btn-outline"
            onClick={(e) => { ripple(e); onUpravit(produkt); }}
          >
            ✏️ Upravit
          </button>
          <button
            className="btn btn-nebezpeci"
            onClick={(e) => { ripple(e); onSmazat(produkt.id); }}
          >
            🗑️ Smazat
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

export default ProductCard;
