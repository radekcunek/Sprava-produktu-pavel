// Komponenta pro filtrování produktů – obsahuje vstupy pro hledání a různé filtry
// Změny se ihned propagují do rodičovské komponenty přes callback onZmenaFiltru

const KATEGORIE = ["Elektronika", "Příslušenství", "Komponenty", "Audio", "Ostatní"];

function ProductFilter({ filtry, onZmenaFiltru }) {
  // Pomocná funkce pro aktualizaci jednoho filtru bez přepsání ostatních
  const zmenFiltr = (klic, hodnota) => {
    onZmenaFiltru((predchozi) => ({ ...predchozi, [klic]: hodnota }));
  };

  // Reset všech filtrů na prázdné hodnoty
  const resetFiltry = () => {
    onZmenaFiltru({ hledat: "", kategorie: "", minCena: "", maxCena: "" });
  };

  // Zjistíme, jestli je aktivní alespoň jeden filtr (pro zobrazení tlačítka reset)
  const jaktivniFiltr =
    filtry.hledat || filtry.kategorie || filtry.minCena || filtry.maxCena;

  return (
    <div className="filtr-panel">
      <div className="filtr-radek">
        {/* Textové vyhledávání */}
        <div className="filtr-skupina">
          <label className="filtr-label">Hledat</label>
          <div className="input-ikona">
            <span className="ikona">🔍</span>
            <input
              type="text"
              className="filtr-input"
              placeholder="Název nebo popis..."
              value={filtry.hledat}
              onChange={(e) => zmenFiltr("hledat", e.target.value)}
            />
          </div>
        </div>

        {/* Výběr kategorie z předem definovaného seznamu */}
        <div className="filtr-skupina">
          <label className="filtr-label">Kategorie</label>
          <select
            className="filtr-input"
            value={filtry.kategorie}
            onChange={(e) => zmenFiltr("kategorie", e.target.value)}
          >
            <option value="">Všechny kategorie</option>
            {KATEGORIE.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
        </div>

        {/* Rozsah cen – minimální a maximální */}
        <div className="filtr-skupina">
          <label className="filtr-label">Cena od (Kč)</label>
          <input
            type="number"
            className="filtr-input"
            placeholder="Min. cena"
            min="0"
            value={filtry.minCena}
            onChange={(e) => zmenFiltr("minCena", e.target.value)}
          />
        </div>

        <div className="filtr-skupina">
          <label className="filtr-label">Cena do (Kč)</label>
          <input
            type="number"
            className="filtr-input"
            placeholder="Max. cena"
            min="0"
            value={filtry.maxCena}
            onChange={(e) => zmenFiltr("maxCena", e.target.value)}
          />
        </div>

        {/* Tlačítko pro reset filtrů – zobrazí se jen když je aktivní filtr */}
        {jaktivniFiltr && (
          <div className="filtr-skupina filtr-reset">
            <label className="filtr-label">&nbsp;</label>
            <button className="btn btn-sekundarni" onClick={resetFiltry}>
              ✕ Zrušit filtry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductFilter;
