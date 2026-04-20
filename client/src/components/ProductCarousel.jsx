import { useEffect, useRef, useState } from "react";
import { toast } from "../utils/toast";

const IKONY = { Elektronika: "💻", Příslušenství: "🖱️", Komponenty: "⚙️", Audio: "🔊", Ostatní: "📦" };

const PALETY = {
  Elektronika:   { from: "#08081e", to: "#14143a", glow: "99,102,241"  },
  Příslušenství: { from: "#130818", to: "#220e30", glow: "139,92,246"  },
  Komponenty:    { from: "#081218", to: "#0c1e2c", glow: "14,165,233"  },
  Audio:         { from: "#08160c", to: "#0c2414", glow: "16,185,129"  },
  Ostatní:       { from: "#161008", to: "#261a08", glow: "245,158,11"  },
};

const STAV_TEXT  = { dostupne: "Skladem",    malo: "Málo skladem", vyprodano: "Vyprodáno" };
const STAV_COLOR = { dostupne: "#10b981",    malo: "#f59e0b",      vyprodano: "#ef4444"   };

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export default function ProductCarousel({ produkty, nacitani, onUpravit, onSmazat }) {
  const containerRef = useRef(null);
  const [progress, setProgress]   = useState(0);
  const [confirm, setConfirm]     = useState(null);
  const rafRef = useRef(null);
  const N = produkty.length;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || N <= 1) return;

    const update = () => {
      const rect     = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      setProgress(clamp(-rect.top / scrollable, 0, 1));
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafRef.current); };
  }, [N]);

  if (nacitani) {
    return (
      <div className="cr-loader">
        {[0, 1, 2].map(i => <div key={i} className="cr-loader-dot" style={{ animationDelay: `${i * 0.15}s` }} />)}
      </div>
    );
  }
  if (N === 0) {
    return (
      <div className="stav-kontejner">
        <span className="prazdny-stav-ikona">🔍</span>
        <h3>Žádné produkty nenalezeny</h3>
        <p>Zkuste změnit filtry nebo přidejte nový produkt.</p>
      </div>
    );
  }

  // Derived values
  const stepAngle   = 360 / N;
  const ringRot     = -(N === 1 ? 0 : progress * (N - 1) * stepAngle);
  const activeIdx   = N === 1 ? 0 : Math.round(progress * (N - 1));
  const activeP     = produkty[activeIdx];
  const radius      = clamp(N * 68, 260, 620);
  const stav        = activeP.mnozstvi === 0 ? "vyprodano" : activeP.mnozstvi < 5 ? "malo" : "dostupne";

  const handleSmazat = () => {
    if (confirm !== activeP.id) {
      setConfirm(activeP.id);
      toast.warning(`Klikni znovu pro smazání „${activeP.nazev}"`);
      setTimeout(() => setConfirm(null), 3000);
      return;
    }
    setConfirm(null);
    onSmazat(activeP.id);
  };

  return (
    <div
      ref={containerRef}
      style={{ height: N === 1 ? "100vh" : `${N * 100}vh`, position: "relative" }}
    >
      <div className="cr-sticky">

        {/* 3D ring */}
        <div className="cr-scene">
          <div className="cr-ring" style={{ transform: `rotateY(${ringRot}deg)` }}>
            {produkty.map((p, i) => {
              const angle    = i * stepAngle;
              const isActive = i === activeIdx;
              const pal      = PALETY[p.kategorie] || PALETY.Ostatní;
              // How far from active (0 = active, 1 = neighbour, etc.)
              let diff = Math.abs(i - activeIdx);
              if (diff > N / 2) diff = N - diff; // wrap for circle
              const distFade = Math.max(0.28, 1 - diff * 0.22);

              return (
                <div
                  key={p.id}
                  className="cr-item"
                  style={{ transform: `rotateY(${angle}deg) translateZ(${radius}px)` }}
                >
                  <div
                    className={`cr-card ${isActive ? "cr-card-active" : ""}`}
                    style={{
                      background: `linear-gradient(150deg, ${pal.from} 0%, ${pal.to} 100%)`,
                      opacity: distFade,
                      boxShadow: isActive
                        ? `0 50px 100px rgba(0,0,0,.9), 0 0 80px rgba(${pal.glow},.35), 0 0 0 1px rgba(255,255,255,.12), inset 0 1px 0 rgba(255,255,255,.15)`
                        : `0 16px 40px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.05), inset 0 1px 0 rgba(255,255,255,.06)`,
                    }}
                    onClick={() => isActive && onUpravit(p)}
                  >
                    <div className="cr-card-shine-a" />
                    <div className="cr-card-shine-b" />
                    <span className="cr-ikona">{IKONY[p.kategorie] || "📦"}</span>
                    <div className="cr-card-label">{p.nazev}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active product info */}
        <div className="cr-info" key={activeP.id}>
          <span className="cr-info-kat">{activeP.kategorie}</span>
          <h2 className="cr-info-nazev">{activeP.nazev}</h2>
          {activeP.popis && <p className="cr-info-popis">{activeP.popis}</p>}
          <div className="cr-info-row">
            <span className="cr-info-cena">
              {activeP.cena.toLocaleString("cs-CZ")} <span>Kč</span>
            </span>
            <span className="cr-info-stav" style={{ color: STAV_COLOR[stav] }}>
              <span className="cr-dot" style={{ background: STAV_COLOR[stav] }} />
              {STAV_TEXT[stav]} · {activeP.mnozstvi} ks
            </span>
          </div>
          <div className="cr-info-akce">
            <button className="cr-btn-prim" onClick={() => onUpravit(activeP)}>
              Upravit produkt
            </button>
            <button
              className={`cr-btn-sec ${confirm === activeP.id ? "cr-btn-danger" : ""}`}
              onClick={handleSmazat}
            >
              {confirm === activeP.id ? "⚠️ Potvrdit" : "Smazat"}
            </button>
          </div>
        </div>

        {/* Dots */}
        {N > 1 && (
          <div className="cr-dots">
            {produkty.map((_, i) => (
              <div key={i} className={`cr-dot-btn ${i === activeIdx ? "cr-dot-active" : ""}`} />
            ))}
          </div>
        )}

        {/* Scroll hint */}
        {N > 1 && (
          <div className="cr-hint" style={{ opacity: progress < 0.04 ? 1 : 0 }}>
            Scrolluj pro procházení ↓
          </div>
        )}

        {/* Counter */}
        <div className="cr-counter">
          <span className="cr-counter-cur">{String(activeIdx + 1).padStart(2, "0")}</span>
          <span className="cr-counter-sep">/</span>
          <span className="cr-counter-tot">{String(N).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}
