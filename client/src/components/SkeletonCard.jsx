// Skeleton placeholder – zobrazí se místo karet dokud se data načítají
// Animovaný shimmer efekt dává uživateli pocit, že se obsah "tvoří"
function SkeletonCard() {
  return (
    <div className="skeleton-karta">
      <div className="skeleton-obrazek" />
      <div className="skeleton-telo">
        <div className="skeleton-radek skeleton-nadpis" />
        <div className="skeleton-radek skeleton-kratky" />
        <div className="skeleton-radek skeleton-dlouhy" />
        <div className="skeleton-radek skeleton-stredni" />
        <div className="skeleton-cena-radek">
          <div className="skeleton-radek skeleton-cena" />
          <div className="skeleton-radek skeleton-mnozstvi" />
        </div>
        <div className="skeleton-tlacitka">
          <div className="skeleton-btn" />
          <div className="skeleton-btn" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;
