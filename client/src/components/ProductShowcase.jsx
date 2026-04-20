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

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function ShowcaseItem({ produkt, index, onUpravit, onSmazat }) {
  const containerRef = useRef(null);
  const [prog, setProg] = useState(0);
  const rafRef = useRef(null);
  const isLeft = index % 2 === 0;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      setProg(clamp(-rect.top / scrollable, 0, 1));
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const E = 0.28, X = 0.72;
  let opacity, objX, objRotY, objScale, textX, textY;

  if (prog <= E) {
    const t = easeOut(prog / E);
    opacity  = t;
    objX     = lerp(isLeft ? 220 : -220, 0, t);
    objRotY  = lerp(isLeft ? -45 : 45, isLeft ? -10 : 10, t);
    objScale = lerp(0.72, 1, t);
    textX    = lerp(isLeft ? -90 : 90, 0, t);
    textY    = lerp(30, 0, t);
  } else if (prog >= X) {
    const t = easeOut((prog - X) / (1 - X));
    opacity  = 1 - t;
    objX     = lerp(0, isLeft ? -220 : 220, t);
    objRotY  = lerp(isLeft ? -10 : 10, isLeft ? 35 : -35, t);
    objScale = lerp(1, 0.78, t);
    textX    = lerp(0, isLeft ? 90 : -90, t);
    textY    = lerp(0, -30, t);
  } else {
    opacity = 1; objX = 0; objRotY = isLeft ? -10 : 10; objScale = 1; textX = 0; textY = 0;
  }

  const pal  = PALETY[produkt.kategorie] || PALETY.Ostatní;
  const stav = produkt.mnozstvi === 0 ? "vyprodano" : produkt.mnozstvi < 5 ? "malo" : "dostupne";
  const stavText  = { vyprodano: "Vyprodáno", malo: "Málo skladem", dostupne: "Skladem" };
  const stavColor = { dostupne: "#10b981", malo: "#f59e0b", vyprodano: "#ef4444" };

  const [potvrzeni, setPotvrzeni] = useState(false);

  const handleSmazat = () => {
    if (!potvrzeni) {
      setPotvrzeni(true);
      toast.warning(`Klikni znovu pro smazání „${produkt.nazev}"`);
      setTimeout(() => setPotvrzeni(false), 3000);
      return;
    }
    onSmazat(produkt.id);
  };

  return (
    <div ref={containerRef} style={{ height: "200vh", position: "relative" }}>
      <div className="sc-sticky">
        <div className={`sc-obsah ${isLeft ? "sc-obsah-l" : "sc-obsah-r"}`}>

          {/* 3D Object */}
          <div
            className="sc-obj-obal"
            style={{
              opacity,
              transform: `translateX(${objX}px) perspective(1400px) rotateY(${objRotY}deg) rotateX(5deg) scale(${objScale})`,
            }}
          >
            <div
              className="sc-obj"
              style={{
                background: `linear-gradient(150deg, ${pal.from} 0%, ${pal.to} 100%)`,
                boxShadow: `
                  ${isLeft ? 50 : -50}px 70px 120px rgba(0,0,0,.85),
                  ${isLeft ? 24 : -24}px 32px 60px rgba(0,0,0,.6),
                  0 0 0 1px rgba(255,255,255,.07),
                  inset 0 1px 0 rgba(255,255,255,.12),
                  inset ${isLeft ? -1 : 1}px 0 0 rgba(0,0,0,.5),
                  0 0 100px rgba(${pal.glow},.18)
                `,
              }}
            >
              <div className="sc-obj-shine-a" />
              <div className="sc-obj-shine-b" />
              <span className="sc-obj-ikona">{IKONY[produkt.kategorie] || "📦"}</span>
              <div className="sc-obj-badge">{produkt.cena.toLocaleString("cs-CZ")} Kč</div>
            </div>
          </div>

          {/* Text side */}
          <div
            className="sc-text"
            style={{
              opacity,
              transform: `translateX(${textX}px) translateY(${textY}px)`,
            }}
          >
            <div className="sc-index">#{String(index + 1).padStart(2, "0")}</div>
            <div className="sc-kat">{produkt.kategorie}</div>
            <h2 className="sc-nazev">{produkt.nazev}</h2>
            {produkt.popis && <p className="sc-popis">{produkt.popis}</p>}

            <div className="sc-row">
              <span className="sc-cena">
                {produkt.cena.toLocaleString("cs-CZ")} <span className="sc-mena">Kč</span>
              </span>
              <span className="sc-stav" style={{ color: stavColor[stav] }}>
                <span className="sc-dot" style={{ background: stavColor[stav] }} />
                {stavText[stav]} · {produkt.mnozstvi} ks
              </span>
            </div>

            <div className="sc-akce">
              <button className="sc-btn-prim" onClick={() => onUpravit(produkt)}>
                Upravit produkt
              </button>
              <button
                className={`sc-btn-sec ${potvrzeni ? "sc-btn-confirm" : ""}`}
                onClick={handleSmazat}
              >
                {potvrzeni ? "⚠️ Potvrdit smazání" : "Smazat"}
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="sc-progressbar">
          <div className="sc-progressfill" style={{ width: `${prog * 100}%` }} />
        </div>

        {/* Item number indicator */}
        <div className="sc-indicator" style={{ opacity: opacity * 0.5 }}>
          <span>{index + 1}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProductShowcase({ produkty, nacitani, onUpravit, onSmazat }) {
  if (nacitani) {
    return (
      <div className="sc-loader">
        <div className="sc-loader-dot" />
        <div className="sc-loader-dot" style={{ animationDelay: ".15s" }} />
        <div className="sc-loader-dot" style={{ animationDelay: ".3s" }} />
      </div>
    );
  }

  if (produkty.length === 0) {
    return (
      <div className="stav-kontejner">
        <span className="prazdny-stav-ikona">🔍</span>
        <h3>Žádné produkty nenalezeny</h3>
        <p>Zkuste změnit filtry nebo přidejte nový produkt.</p>
      </div>
    );
  }

  return (
    <div className="sc-wrap">
      {produkty.map((p, i) => (
        <ShowcaseItem
          key={p.id}
          produkt={p}
          index={i}
          onUpravit={onUpravit}
          onSmazat={onSmazat}
        />
      ))}
    </div>
  );
}
