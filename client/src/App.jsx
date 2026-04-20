import { useState, useEffect, useCallback, useRef } from "react";
import ProductCarousel from "./components/ProductCarousel";
import ProductForm from "./components/ProductForm";
import ProductFilter from "./components/ProductFilter";
import SupportWindow from "./components/SupportWindow";
import { lazy, Suspense } from "react";
const WebGLBackground = lazy(() => import("./components/WebGLBackground"));
import ReviewsSection from "./components/ReviewsSection";
import ToastContainer from "./components/Toast";
import { useScrollReveal } from "./hooks/useScrollReveal";
import { useCountUp } from "./hooks/useCountUp";
import { toast } from "./utils/toast";

const API_URL = "/api/products";

function StatKarta({ ikona, popis, hodnota, suffix = "" }) {
  const elRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const scrollRevealRef = useScrollReveal();

  // Merge refs
  const setRef = (node) => {
    elRef.current = node;
    scrollRevealRef.current = node;
  };

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const displayNum = typeof hodnota === "number" ? hodnota : 0;
  const counted = useCountUp(displayNum, 1200, visible);

  return (
    <div ref={setRef} className="stat-karta scroll-animovat">
      <span className="stat-ikona">{ikona}</span>
      <span className="stat-cislo">
        {typeof hodnota === "number" ? counted.toLocaleString("cs-CZ") : hodnota}
        {suffix && <span className="stat-mena"> {suffix}</span>}
      </span>
      <span className="stat-popis">{popis}</span>
    </div>
  );
}

function App() {
  const [produkty, setProdukty] = useState([]);
  const [chyba, setChyba]       = useState(null);
  const [nacitani, setNacitani] = useState(true);
  const [filtry, setFiltry]     = useState({ hledat: "", kategorie: "", minCena: "", maxCena: "" });
  const [zobrazitFormular, setZobrazitFormular] = useState(false);
  const [upravovanyProdukt, setUpravovanyProdukt] = useState(null);

  const statistikyRef = useScrollReveal();
  const reviewsRef    = useScrollReveal();

  // Custom cursor
  useEffect(() => {
    const dot  = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0, rafId;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
    };

    const onEnter = () => ring.classList.add("cursor-ring-hover");
    const onLeave = () => ring.classList.remove("cursor-ring-hover");

    const animRing = () => {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;
      rafId = requestAnimationFrame(animRing);
    };

    document.querySelectorAll("button, a, input, select, textarea").forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    window.addEventListener("mousemove", onMove);
    animRing();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  const nactiProdukty = useCallback(async () => {
    setNacitani(true);
    setChyba(null);
    try {
      const params = new URLSearchParams();
      if (filtry.hledat)    params.append("hledat",    filtry.hledat);
      if (filtry.kategorie) params.append("kategorie", filtry.kategorie);
      if (filtry.minCena)   params.append("minCena",   filtry.minCena);
      if (filtry.maxCena)   params.append("maxCena",   filtry.maxCena);
      const resp = await fetch(`${API_URL}?${params.toString()}`);
      if (!resp.ok) throw new Error("Nepodařilo se načíst produkty");
      setProdukty(await resp.json());
    } catch (err) {
      setChyba(err.message);
    } finally {
      setNacitani(false);
    }
  }, [filtry]);

  useEffect(() => { nactiProdukty(); }, [nactiProdukty]);

  const ulozProdukt = async (data) => {
    const jeUprava = !!upravovanyProdukt;
    const resp = await fetch(
      jeUprava ? `${API_URL}/${upravovanyProdukt.id}` : API_URL,
      { method: jeUprava ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }
    );
    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.chyba || "Chyba při ukládání");
    }
    setZobrazitFormular(false);
    setUpravovanyProdukt(null);
    nactiProdukty();
    toast.success(jeUprava ? `„${data.nazev}" byl upraven` : `„${data.nazev}" byl přidán do katalogu`);
  };

  const smazProdukt = async (id) => {
    try {
      const resp = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Nepodařilo se smazat produkt");
      nactiProdukty();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const celkemKusu   = produkty.reduce((s, p) => s + p.mnozstvi, 0);
  const prumerCena   = produkty.length > 0 ? Math.round(produkty.reduce((s, p) => s + p.cena, 0) / produkty.length) : 0;
  const pocetKategorii = [...new Set(produkty.map((p) => p.kategorie))].length;
  const maloNaSklade = produkty.filter((p) => p.mnozstvi > 0 && p.mnozstvi < 5).length;

  return (
    <>
      <Suspense fallback={null}>
        <WebGLBackground />
      </Suspense>

      {/* Custom cursor */}
      <div className="cursor-dot" />
      <div className="cursor-ring" />

      <div className="app">
        <header className="header">
          <div className="header-obsah">
            <div className="header-nazev">
              <span className="header-ikona">📦</span>
              <div>
                <h1 className="header-titul">Správce produktů</h1>
                <p>Přehled a správa vašeho skladu</p>
              </div>
            </div>
            <div className="header-akce">
              {maloNaSklade > 0 && (
                <div className="nizky-sklad-alert">
                  ⚠️ {maloNaSklade} {maloNaSklade === 1 ? "produkt" : "produkty"} s nízkým skladem
                </div>
              )}
              <button
                className="btn btn-primary"
                onClick={() => { setUpravovanyProdukt(null); setZobrazitFormular(true); }}
              >
                + Přidat produkt
              </button>
            </div>
          </div>
        </header>

        <main className="hlavni-obsah">
          {chyba && (
            <div className="alert alert-chyba">
              ⚠️ {chyba}
              <button onClick={() => setChyba(null)}>✕</button>
            </div>
          )}

          {zobrazitFormular && (
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && (() => { setZobrazitFormular(false); setUpravovanyProdukt(null); })()}>
              <div className="modal">
                <ProductForm
                  produkt={upravovanyProdukt}
                  onUloz={ulozProdukt}
                  onZavrit={() => { setZobrazitFormular(false); setUpravovanyProdukt(null); }}
                />
              </div>
            </div>
          )}

          {/* Přehled */}
          <div className="sekce-hlavicka">
            <div className="sekce-meta">
              <span className="sekce-tag">Přehled</span>
              <h2 className="sekce-nadpis">Přehled skladu</h2>
            </div>
          </div>

          <div ref={statistikyRef} className="statistiky scroll-stat-kontejner">
            <StatKarta ikona="📦" popis="Produktů celkem"  hodnota={produkty.length} />
            <StatKarta ikona="🏷️" popis="Kusů na skladě"  hodnota={celkemKusu} />
            <StatKarta ikona="💰" popis="Průměrná cena"    hodnota={prumerCena} suffix="Kč" />
            <StatKarta ikona="🗂️" popis="Kategorií"        hodnota={pocetKategorii} />
          </div>

          {/* Filtr */}
          <div className="sekce-hlavicka">
            <div className="sekce-meta">
              <span className="sekce-tag">Vyhledávání</span>
              <h2 className="sekce-nadpis">Filtrovat produkty</h2>
            </div>
          </div>

          <ProductFilter filtry={filtry} onZmenaFiltru={setFiltry} />

          {/* Produkty */}
          <div className="sekce-hlavicka">
            <div className="sekce-meta">
              <span className="sekce-tag">Katalog</span>
              <h2 className="sekce-nadpis">
                Produkty
                {!nacitani && <span className="sekce-pocet">{produkty.length}</span>}
              </h2>
            </div>
          </div>

          <ProductCarousel
            produkty={produkty}
            nacitani={nacitani}
            onUpravit={(p) => { setUpravovanyProdukt(p); setZobrazitFormular(true); }}
            onSmazat={smazProdukt}
          />

          {/* Recenze */}
          <div className="sekce-hlavicka" ref={reviewsRef} style={{ marginTop: "4rem" }}>
            <div className="sekce-meta">
              <span className="sekce-tag">Hodnocení</span>
              <h2 className="sekce-nadpis">Co říkají uživatelé</h2>
            </div>
          </div>

          <ReviewsSection />
        </main>

        <footer className="footer">
          <div className="footer-obsah">
            <span>© 2025 Správce produktů</span>
            <span className="footer-oddelovac">·</span>
            <span>Vytvořeno s ❤️</span>
            <span className="footer-oddelovac">·</span>
            <span className="footer-verze">v2.0</span>
          </div>
        </footer>

        <SupportWindow />
      </div>

      <ToastContainer />
    </>
  );
}

export default App;
