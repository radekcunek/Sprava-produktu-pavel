import { useState, useRef, useEffect } from "react";

const UVITACI_ZPRAVA = {
  id: 1,
  od: "podpora",
  text: "Ahoj! 👋 Jsem tady, pokud potřebuješ pomoc se správou produktů. Na co se chceš zeptat?",
  cas: new Date(),
};

const RYCHLE_ODPOVEDI = [
  "Jak přidat produkt?",
  "Jak filtrovat produkty?",
  "Jak upravit cenu?",
];

const AUTO_ODPOVEDI = {
  "jak přidat produkt": "Klikni na tlačítko **+ Přidat produkt** v pravém horním rohu. Vyplň název, kategorii, cenu a množství — a hotovo! 🎉",
  "jak filtrovat": "Použij panel nad seznamem produktů — můžeš hledat podle názvu, vybrat kategorii nebo nastavit rozsah cen.",
  "jak upravit cenu": "Na kartě produktu klikni na **✏️ Upravit** a změň cenu v formuláři. Nezapomeň uložit.",
  default: "Díky za zprávu! 🙏 Náš tým ti odpoví co nejdříve. Obvykle odpovídáme do 24 hodin.",
};

function formatCas(date) {
  return date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
}

function najdiOdpoved(text) {
  const lower = text.toLowerCase();
  for (const [klic, odpoved] of Object.entries(AUTO_ODPOVEDI)) {
    if (klic !== "default" && lower.includes(klic)) return odpoved;
  }
  return AUTO_ODPOVEDI.default;
}

function SupportWindow() {
  const [otevreno, setOtevreno] = useState(false);
  const [zpravy, setZpravy] = useState([UVITACI_ZPRAVA]);
  const [vstup, setVstup] = useState("");
  const [piseSe, setPiseSe] = useState(false);
  const [neprecteno, setNeprecteno] = useState(1);
  const konecRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (otevreno) {
      setNeprecteno(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [otevreno]);

  useEffect(() => {
    konecRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [zpravy, piseSe]);

  const odeslat = (text = vstup.trim()) => {
    if (!text) return;

    const novaZprava = { id: Date.now(), od: "uzivatel", text, cas: new Date() };
    setZpravy((prev) => [...prev, novaZprava]);
    setVstup("");
    setPiseSe(true);

    setTimeout(() => {
      setPiseSe(false);
      const odpoved = {
        id: Date.now() + 1,
        od: "podpora",
        text: najdiOdpoved(text),
        cas: new Date(),
      };
      setZpravy((prev) => [...prev, odpoved]);
    }, 1200 + Math.random() * 800);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      odeslat();
    }
  };

  return (
    <>
      {/* Plovoucí tlačítko */}
      <button
        className={`support-fab ${otevreno ? "support-fab-otevreno" : ""}`}
        onClick={() => setOtevreno((o) => !o)}
        aria-label="Otevřít podporu"
      >
        <span className="support-fab-ikona">{otevreno ? "✕" : "💬"}</span>
        {!otevreno && neprecteno > 0 && (
          <span className="support-badge">{neprecteno}</span>
        )}
      </button>

      {/* Chat okno */}
      <div className={`support-okno ${otevreno ? "support-okno-otevreno" : ""}`}>
        {/* Hlavička */}
        <div className="support-hlavicka">
          <div className="support-agent">
            <div className="support-avatar">🎧</div>
            <div>
              <div className="support-agent-jmeno">Podpora</div>
              <div className="support-online">
                <span className="support-dot" />
                Online
              </div>
            </div>
          </div>
          <button className="support-zavrit" onClick={() => setOtevreno(false)}>✕</button>
        </div>

        {/* Zprávy */}
        <div className="support-zpravy">
          {zpravy.map((z) => (
            <div key={z.id} className={`support-zprava support-zprava-${z.od}`}>
              {z.od === "podpora" && <div className="support-avatar-mini">🎧</div>}
              <div className="support-bublina">
                <p dangerouslySetInnerHTML={{
                  __html: z.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                }} />
                <span className="support-cas">{formatCas(z.cas)}</span>
              </div>
            </div>
          ))}

          {piseSe && (
            <div className="support-zprava support-zprava-podpora">
              <div className="support-avatar-mini">🎧</div>
              <div className="support-bublina support-pise">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={konecRef} />
        </div>

        {/* Rychlé odpovědi */}
        {zpravy.length <= 1 && (
          <div className="support-rychle">
            {RYCHLE_ODPOVEDI.map((r) => (
              <button key={r} className="support-rychla-btn" onClick={() => odeslat(r)}>
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="support-input-obal">
          <input
            ref={inputRef}
            className="support-input"
            placeholder="Napiš zprávu..."
            value={vstup}
            onChange={(e) => setVstup(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            className="support-odeslat"
            onClick={() => odeslat()}
            disabled={!vstup.trim()}
          >
            ➤
          </button>
        </div>
      </div>
    </>
  );
}

export default SupportWindow;
