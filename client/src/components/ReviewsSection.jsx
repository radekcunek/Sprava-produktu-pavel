import { useState, useRef, useEffect } from "react";

const REVIEWS = [
  { id: 1, jmeno: "Jan Novák", avatar: "👨‍💼", firma: "TechStore s.r.o.", hodnoceni: 5, text: "Nejlepší nástroj pro správu skladu, který jsem kdy používal. Přehledné rozhraní šetří hodiny práce týdně. Vřele doporučuji!", datum: "15. 3. 2025", tag: "Verified" },
  { id: 2, jmeno: "Petra Svobodová", avatar: "👩‍💻", firma: "E-shop CZ", hodnoceni: 5, text: "Filtrování produktů je naprosto geniální. Hledám zboží za zlomek sekundy. Animace jsou navíc neskutečně plynulé.", datum: "2. 4. 2025", tag: "Top recenzent" },
  { id: 3, jmeno: "Martin Krejčí", avatar: "👨‍🔧", firma: "Elektro Praha", hodnoceni: 4, text: "Solidní aplikace. Oceňuji přidání podpory pro velké sklady. Design je moderní a přehledný. Chybělo by mi jen mobilní app.", datum: "18. 4. 2025", tag: "Verified" },
  { id: 4, jmeno: "Lucie Horáková", avatar: "👩‍🎨", firma: "Design Hub", hodnoceni: 5, text: "Estetika i funkcionalita na jednom místě. Náš tým přešel na tento systém a produktivita vzrostla o 40 %. Paráda!", datum: "5. 3. 2025", tag: "Verified" },
  { id: 5, jmeno: "Tomáš Blaha", avatar: "👨‍💻", firma: "StartupXYZ", hodnoceni: 5, text: "Jako vývojář oceňuji čistý kód a rychlost aplikace. WebGL animace jsou prostě wow. Žádné jiné řešení nenabídne tohle.", datum: "10. 4. 2025", tag: "Developer" },
  { id: 6, jmeno: "Eva Nováčková", avatar: "👩‍💼", firma: "MegaSklad a.s.", hodnoceni: 4, text: "Přesně to, co jsem hledala pro správu 500+ produktů. Intuitivní, rychlé a spolehlivé. Podpora je taky výborná.", datum: "28. 3. 2025", tag: "Verified" },
];

function Stars({ pocet, max = 5 }) {
  return (
    <div className="stars">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`star ${i < pocet ? "star-fill" : "star-empty"}`}>★</span>
      ))}
    </div>
  );
}

function ReviewCard({ review, index }) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -12;
    el.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
    el.style.setProperty("--rx", `${(e.clientX - rect.left) / rect.width * 100}%`);
    el.style.setProperty("--ry", `${(e.clientY - rect.top)  / rect.height * 100}%`);
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      className="review-karta scroll-animovat"
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="review-shine" />
      <div className="review-hlavicka">
        <div className="review-avatar">{review.avatar}</div>
        <div className="review-info">
          <div className="review-jmeno">{review.jmeno}</div>
          <div className="review-firma">{review.firma}</div>
        </div>
        <span className="review-tag">{review.tag}</span>
      </div>
      <Stars pocet={review.hodnoceni} />
      <p className="review-text">"{review.text}"</p>
      <div className="review-footer">
        <span className="review-datum">{review.datum}</span>
        <div className="review-puntiky">
          {[...Array(review.hodnoceni)].map((_, i) => (
            <span key={i} className="review-dot" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const [aktivni, setAktivni] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAktivni((a) => (a + 1) % REVIEWS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const karta = track.querySelector(".review-karta");
    if (!karta) return;
    const w = karta.offsetWidth + 24;
    track.scrollTo({ left: aktivni * w, behavior: "smooth" });
  }, [aktivni]);

  const prumer = (REVIEWS.reduce((s, r) => s + r.hodnoceni, 0) / REVIEWS.length).toFixed(1);

  return (
    <section className="reviews-sekce">
      <div className="reviews-souhrn">
        <div className="reviews-skore">
          <span className="reviews-cislo">{prumer}</span>
          <Stars pocet={5} />
          <span className="reviews-pocet">{REVIEWS.length} recenzí</span>
        </div>
        <div className="reviews-pruhy">
          {[5,4,3,2,1].map((n) => {
            const count = REVIEWS.filter(r => r.hodnoceni === n).length;
            const pct = (count / REVIEWS.length) * 100;
            return (
              <div key={n} className="reviews-pruh-radek">
                <span className="reviews-pruh-label">{n}★</span>
                <div className="reviews-pruh-bg">
                  <div className="reviews-pruh-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="reviews-pruh-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="reviews-karusel-obal">
        <div ref={trackRef} className="reviews-track">
          {REVIEWS.map((r, i) => (
            <ReviewCard key={r.id} review={r} index={i} />
          ))}
        </div>
      </div>

      <div className="reviews-dots">
        {REVIEWS.map((_, i) => (
          <button
            key={i}
            className={`reviews-dot-btn ${i === aktivni ? "aktivni" : ""}`}
            onClick={() => setAktivni(i)}
          />
        ))}
      </div>
    </section>
  );
}
