// Seznam produktů – zobrazuje skeleton karty při načítání, jinak grid karet
import ProductCard from "./ProductCard";
import SkeletonCard from "./SkeletonCard";

function ProductList({ produkty, nacitani, onUpravit, onSmazat }) {
  // Skeleton – zobrazíme 6 placeholder karet aby layout nevyskakoval
  if (nacitani) {
    return (
      <div className="produkty-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
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
    <div className="produkty-grid">
      {produkty.map((produkt, index) => (
        <ProductCard
          key={produkt.id}
          produkt={produkt}
          index={index}
          onUpravit={onUpravit}
          onSmazat={onSmazat}
        />
      ))}
    </div>
  );
}

export default ProductList;
