// Karta jednoho produktu – zobrazuje všechny jeho informace a akční tlačítka
// Přijímá produkt jako props a callbacky pro úpravu a smazání

// Mapování kategorií na emoji ikony pro vizuální odlišení
const IKONY_KATEGORII = {
  Elektronika: "💻",
  Příslušenství: "🖱️",
  Komponenty: "⚙️",
  Audio: "🔊",
  Ostatní: "📦",
};

function ProductCard({ produkt, onUpravit, onSmazat }) {
  // Určíme barvu štítku množství podle toho, kolik kusů zbývá
  const stav =
    produkt.mnozstvi === 0
      ? "vyprodano"
      : produkt.mnozstvi < 5
      ? "malo"
      : "dostupne";

  const stavTexty = {
    vyprodano: "Vyprodáno",
    malo: "Málo skladem",
    dostupne: "Skladem",
  };

  return (
    <div className="produkt-karta">
      {/* Horní část karty s ikonou kategorie */}
      <div className="karta-hlavicka">
        <span className="kategorie-ikona">
          {IKONY_KATEGORII[produkt.kategorie] || "📦"}
        </span>
        <span className={`stav-badge stav-${stav}`}>{stavTexty[stav]}</span>
      </div>

      {/* Název a kategorie produktu */}
      <h3 className="produkt-nazev">{produkt.nazev}</h3>
      <span className="produkt-kategorie">{produkt.kategorie}</span>

      {/* Popis je volitelný – zobrazíme jen když existuje */}
      {produkt.popis && <p className="produkt-popis">{produkt.popis}</p>}

      {/* Cena a množství */}
      <div className="produkt-detaily">
        <div className="produkt-cena">
          {produkt.cena.toLocaleString("cs-CZ")} Kč
        </div>
        <div className="produkt-mnozstvi">
          <span className="mnozstvi-ikona">📦</span> {produkt.mnozstvi} ks
        </div>
      </div>

      {/* Datum přidání */}
      <div className="produkt-datum">
        Přidáno: {new Date(produkt.datumPridani).toLocaleDateString("cs-CZ")}
      </div>

      {/* Tlačítka pro akce – úprava a smazání */}
      <div className="karta-akce">
        <button
          className="btn btn-outline"
          onClick={() => onUpravit(produkt)}
        >
          ✏️ Upravit
        </button>
        <button
          className="btn btn-nebezpeci"
          onClick={() => onSmazat(produkt.id)}
        >
          🗑️ Smazat
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
