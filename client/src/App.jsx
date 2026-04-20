// Hlavní komponenta aplikace – řídí stav a koordinuje ostatní komponenty
import { useState, useEffect, useCallback } from "react";
import ProductList from "./components/ProductList";
import ProductForm from "./components/ProductForm";
import ProductFilter from "./components/ProductFilter";
import SupportWindow from "./components/SupportWindow";
import { useScrollReveal } from "./hooks/useScrollReveal";

// Základní URL pro všechna API volání – díky Vite proxy stačí relativní cesta
const API_URL = "/api/products";

function App() {
  // Stav pro uchování seznamu produktů načtených z API
  const [produkty, setProdukty] = useState([]);

  // Stav pro zobrazování chybové zprávy (null = žádná chyba)
  const [chyba, setChyba] = useState(null);

  // Stav pro zobrazení načítacího indikátoru
  const [nacitani, setNacitani] = useState(true);

  // Stav pro aktuální filtry – pokud je prázdné, načteme vše
  const [filtry, setFiltry] = useState({ hledat: "", kategorie: "", minCena: "", maxCena: "" });

  // Stav, který určuje, zda zobrazujeme formulář pro přidání/úpravu
  const [zobrazitFormular, setZobrazitFormular] = useState(false);

  const [upravovanyProdukt, setUpravovanyProdukt] = useState(null);
  const statistikyRef = useScrollReveal();

  // useCallback zajistí, že funkce nevznikne znovu při každém renderu
  // Funkce načte produkty z API se zadanými filtry
  const nactiProdukty = useCallback(async () => {
    setNacitani(true);
    setChyba(null);
    try {
      // Sestavíme URL query string z filtrů – vynecháme prázdné hodnoty
      const params = new URLSearchParams();
      if (filtry.hledat) params.append("hledat", filtry.hledat);
      if (filtry.kategorie) params.append("kategorie", filtry.kategorie);
      if (filtry.minCena) params.append("minCena", filtry.minCena);
      if (filtry.maxCena) params.append("maxCena", filtry.maxCena);

      const odpoved = await fetch(`${API_URL}?${params.toString()}`);
      if (!odpoved.ok) throw new Error("Nepodařilo se načíst produkty");

      const data = await odpoved.json();
      setProdukty(data);
    } catch (err) {
      setChyba(err.message);
    } finally {
      // finally se spustí vždy – ať už request uspěl nebo ne
      setNacitani(false);
    }
  }, [filtry]);

  // useEffect spustí načtení produktů pokaždé, když se změní filtry
  useEffect(() => {
    nactiProdukty();
  }, [nactiProdukty]);

  // Funkce pro uložení produktu – rozlišuje mezi přidáním a úpravou
  const ulozProdukt = async (data) => {
    try {
      const jeUprava = !!upravovanyProdukt;

      const odpoved = await fetch(
        jeUprava ? `${API_URL}/${upravovanyProdukt.id}` : API_URL,
        {
          method: jeUprava ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!odpoved.ok) {
        const errData = await odpoved.json();
        throw new Error(errData.chyba || "Chyba při ukládání");
      }

      // Po úspěšném uložení skryjeme formulář a znovu načteme data
      setZobrazitFormular(false);
      setUpravovanyProdukt(null);
      nactiProdukty();
    } catch (err) {
      throw err; // Předáme chybu dál do formuláře, aby ji mohl zobrazit
    }
  };

  // Funkce pro smazání produktu – uživatel musí potvrdit akcí
  const smazProdukt = async (id) => {
    if (!window.confirm("Opravdu chcete tento produkt smazat?")) return;

    try {
      const odpoved = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!odpoved.ok) throw new Error("Nepodařilo se smazat produkt");
      nactiProdukty();
    } catch (err) {
      setChyba(err.message);
    }
  };

  // Otevření formuláře pro úpravu konkrétního produktu
  const otevriUpravu = (produkt) => {
    setUpravovanyProdukt(produkt);
    setZobrazitFormular(true);
  };

  // Zavření formuláře a reset stavu úpravy
  const zavriFormular = () => {
    setZobrazitFormular(false);
    setUpravovanyProdukt(null);
  };

  return (
    <div className="app">
      {/* Hlavička aplikace */}
      <header className="header">
        <div className="header-obsah">
          <div className="header-nazev">
            <span className="header-ikona">📦</span>
            <div>
              <h1>Správce produktů</h1>
              <p>Přehled a správa vašeho skladu</p>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setUpravovanyProdukt(null);
              setZobrazitFormular(true);
            }}
          >
            + Přidat produkt
          </button>
        </div>
      </header>

      <main className="hlavni-obsah">
        {/* Zobrazení chybové zprávy */}
        {chyba && (
          <div className="alert alert-chyba">
            ⚠️ {chyba}
            <button onClick={() => setChyba(null)}>✕</button>
          </div>
        )}

        {/* Formulář pro přidání/úpravu – zobrazí se jen pokud je aktivní */}
        {zobrazitFormular && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && zavriFormular()}>
            <div className="modal">
              <ProductForm
                produkt={upravovanyProdukt}
                onUloz={ulozProdukt}
                onZavrit={zavriFormular}
              />
            </div>
          </div>
        )}

        {/* Filtrovací panel */}
        <ProductFilter filtry={filtry} onZmenaFiltru={setFiltry} />

        {/* Statistiky */}
        <div ref={statistikyRef} className="statistiky scroll-stat-kontejner">
          <div className="stat-karta">
            <span className="stat-cislo">{produkty.length}</span>
            <span className="stat-popis">Produktů celkem</span>
          </div>
          <div className="stat-karta">
            <span className="stat-cislo">
              {produkty.reduce((soucet, p) => soucet + p.mnozstvi, 0)}
            </span>
            <span className="stat-popis">Kusů na skladě</span>
          </div>
          <div className="stat-karta">
            <span className="stat-cislo">
              {produkty.length > 0
                ? Math.round(
                    produkty.reduce((s, p) => s + p.cena, 0) / produkty.length
                  ).toLocaleString("cs-CZ")
                : 0}{" "}
              Kč
            </span>
            <span className="stat-popis">Průměrná cena</span>
          </div>
          <div className="stat-karta">
            <span className="stat-cislo">
              {[...new Set(produkty.map((p) => p.kategorie))].length}
            </span>
            <span className="stat-popis">Kategorií</span>
          </div>
        </div>

        {/* Seznam produktů */}
        <ProductList
          produkty={produkty}
          nacitani={nacitani}
          onUpravit={otevriUpravu}
          onSmazat={smazProdukt}
        />
      </main>
      <SupportWindow />
    </div>
  );
}

export default App;
