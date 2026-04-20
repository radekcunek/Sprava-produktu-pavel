import { useState, useRef, useMemo } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { toast } from "../utils/toast";

const IKONY_KATEGORII = {
  Elektronika: "💻", Příslušenství: "🖱️", Komponenty: "⚙️", Audio: "🔊", Ostatní: "📦",
};

const GRADIENT_KATEGORII = {
  Elektronika:   "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  Příslušenství: "linear-gradient(135deg, #1a0a1e 0%, #2d1b3d 100%)",
  Komponenty:    "linear-gradient(135deg, #0a1628 0%, #1a2a40 100%)",
  Audio:         "linear-gradient(135deg, #0a1e14 0%, #0d2b1a 100%)",
  Ostatní:       "linear-gradient(135deg, #1e1a0a 0%, #2d2610 100%)",
};

// Pseudonáhodný rating vycházející z ID produktu
function getStars(id) {
  const seed = (id * 2654435761) >>> 0;
  return 3.5 + ((seed % 100) / 100) * 1.5;
}
function getReviewCount(id) {
  const seed = (id * 1234567891) >>> 0;
  return 4 + (seed % 47);
}

function StarRating({ rating }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="karta-stars">
      {[...Array(full)].map((_, i)  => <span key={`f${i}`} className="star-f">★</span>)}
      {half && <span className="star-h">★</span>}
      {[...Array(empty)].map((_, i) => <span key={`e${i}`} className="star-e">★</span>)}
    </div>
  );
}

function ProductCard({ produkt, onUpravit, onSmazat, index }) {
  const [obrazekSelhal, setObrazekSelhal] = useState(false);
  const [obrazekNacten, setObrazekNacten] = useState(false);
  const [oblibeny, setOblibeny] = useState(false);
  const [cekaNaSmazani, setCekaNaSmazani] = useState(false);

  const kartaRef = useRef(null);
  const scrollRef = useScrollReveal(index * 65);

  const stars   = useMemo(() => getStars(produkt.id),        [produkt.id]);
  const reviews = useMemo(() => getReviewCount(produkt.id),  [produkt.id]);

  const stav = produkt.mnozstvi === 0 ? "vyprodano" : produkt.mnozstvi < 5 ? "malo" : "dostupne";
  const stavTexty = { vyprodano: "Vyprodáno", malo: "Málo skladem", dostupne: "Skladem" };

  const handleMouseMove = (e) => {
    const k = kartaRef.current;
    if (!k) return;
    const r = k.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const rx = ((y - r.height / 2) / (r.height / 2)) * -7;
    const ry = ((x - r.width  / 2) / (r.width  / 2)) * 7;
    k.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px) scale(1.015)`;
    k.style.setProperty("--mx", `${(x / r.width)  * 100}%`);
    k.style.setProperty("--my", `${(y / r.height) * 100}%`);
  };

  const handleMouseLeave = () => {
    if (kartaRef.current) kartaRef.current.style.transform = "";
  };

  const ripple = (e) => {
    const btn = e.currentTarget;
    const kruh = document.createElement("span");
    const d = Math.max(btn.offsetWidth, btn.offsetHeight);
    const rect = btn.getBoundingClientRect();
    kruh.style.cssText = `position:absolute;width:${d}px;height:${d}px;left:${e.clientX-rect.left-d/2}px;top:${e.clientY-rect.top-d/2}px;background:rgba(255,255,255,.25);border-radius:50%;transform:scale(0);animation:rippleAnim .5s linear;pointer-events:none;`;
    btn.appendChild(kruh);
    setTimeout(() => kruh.remove(), 500);
  };

  const handleOblibeny = () => {
    setOblibeny((v) => {
      toast[v ? "info" : "success"](v ? `${produkt.nazev} odebrán z oblíbených` : `${produkt.nazev} přidán do oblíbených ❤️`);
      return !v;
    });
  };

  const handleSmazat = (e) => {
    ripple(e);
    if (!cekaNaSmazani) {
      setCekaNaSmazani(true);
      toast.warning(`Klikni znovu pro smazání „${produkt.nazev}"`);
      setTimeout(() => setCekaNaSmazani(false), 3000);
      return;
    }
    onSmazat(produkt.id);
    toast.success(`„${produkt.nazev}" byl smazán`);
  };

  return (
    <div ref={scrollRef} className="scroll-animovat">
      <div
        ref={kartaRef}
        className="produkt-karta"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="karta-highlight" />
        <div className="karta-glow" />

        {/* Obrázek */}
        <div className="karta-obrazek-obal">
          {!obrazekSelhal && produkt.obrazek ? (
            <>
              {!obrazekNacten && (
                <div className="obrazek-placeholder" style={{ background: GRADIENT_KATEGORII[produkt.kategorie] }} />
              )}
              <img
                src={produkt.obrazek} alt={produkt.nazev}
                className={`karta-obrazek ${obrazekNacten ? "obrazek-nacten" : ""}`}
                onLoad={() => setObrazekNacten(true)}
                onError={() => setObrazekSelhal(true)}
                loading="lazy"
              />
            </>
          ) : (
            <div className="obrazek-fallback" style={{ background: GRADIENT_KATEGORII[produkt.kategorie] || GRADIENT_KATEGORII.Ostatní }}>
              <span className="fallback-ikona">{IKONY_KATEGORII[produkt.kategorie] || "📦"}</span>
            </div>
          )}

          <span className={`stav-badge stav-${stav}`}>{stavTexty[stav]}</span>

          <button className={`oblibeny-btn ${oblibeny ? "oblibeny-aktivni" : ""}`} onClick={handleOblibeny}>
            {oblibeny ? "❤️" : "🤍"}
          </button>

          <div className="obrazek-overlay">
            <button className="overlay-btn" onClick={(e) => { ripple(e); onUpravit(produkt); }}>
              ✏️ Upravit
            </button>
          </div>
        </div>

        {/* Tělo */}
        <div className="karta-telo">
          <span className="produkt-kategorie">{IKONY_KATEGORII[produkt.kategorie]} {produkt.kategorie}</span>
          <h3 className="produkt-nazev">{produkt.nazev}</h3>

          <div className="karta-rating">
            <StarRating rating={stars} />
            <span className="karta-rating-cislo">{stars.toFixed(1)}</span>
            <span className="karta-rating-pocet">({reviews} recenzí)</span>
          </div>

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
            <button className="btn btn-outline" onClick={(e) => { ripple(e); onUpravit(produkt); }}>
              ✏️ Upravit
            </button>
            <button
              className={`btn ${cekaNaSmazani ? "btn-nebezpeci-aktivni" : "btn-nebezpeci"}`}
              onClick={handleSmazat}
            >
              {cekaNaSmazani ? "⚠️ Potvrdit" : "🗑️ Smazat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
