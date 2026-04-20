import { useState, useEffect } from "react";
import { onToast } from "../utils/toast";

const IKONY = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };

export default function ToastContainer() {
  const [toasty, setToasty] = useState([]);

  useEffect(() => {
    return onToast((t) => {
      setToasty((prev) => [...prev, { ...t, odchazi: false }]);
      setTimeout(() => {
        setToasty((prev) => prev.map((x) => x.id === t.id ? { ...x, odchazi: true } : x));
        setTimeout(() => {
          setToasty((prev) => prev.filter((x) => x.id !== t.id));
        }, 400);
      }, 3200);
    });
  }, []);

  return (
    <div className="toast-kontejner">
      {toasty.map((t) => (
        <div key={t.id} className={`toast toast-${t.type} ${t.odchazi ? "toast-out" : "toast-in"}`}>
          <span className="toast-ikona">{IKONY[t.type]}</span>
          <span className="toast-text">{t.message}</span>
          <button
            className="toast-zavrit"
            onClick={() => setToasty((p) => p.filter((x) => x.id !== t.id))}
          >✕</button>
        </div>
      ))}
    </div>
  );
}
