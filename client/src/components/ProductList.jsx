// Komponenta pro zobrazení seznamu produktů jako grid karet
// Zobrazuje loading spinner, prázdný stav nebo mřížku karet

import ProductCard from "./ProductCard";

function ProductList({ produkty, nacitani, onUpravit, onSmazat }) {
  // Zobrazíme animovaný spinner dokud se data načítají
  if (nacitani) {
    return (
      <div className="stav-kontejner">
        <div className="spinner" />
        <p>Načítám produkty...</p>
      </div>
    );
  }

  // Pokud jsou data prázdná, zobrazíme přátelskou zprávu
  if (produkty.length === 0) {
    return (
      <div className="stav-kontejner">
        <span className="prazdny-stav-ikona">🔍</span>
        <h3>Žádné produkty nenalezeny</h3>
        <p>Zkuste změnit filtry nebo přidejte nový produkt.</p>
      </div>
    );
  }

  // Renderujeme mřížku karet – každá karta dostane produkt a callback funkce
  return (
    <div className="produkty-grid">
      {produkty.map((produkt) => (
        <ProductCard
          key={produkt.id}
          produkt={produkt}
          onUpravit={onUpravit}
          onSmazat={onSmazat}
        />
      ))}
    </div>
  );
}

export default ProductList;
