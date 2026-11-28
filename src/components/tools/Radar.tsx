"use client";
// Black Belt Bk1 Safety vs. Candor radar (Edmondson). Saves where the Black Belt manual saved it.
import { getAt, setAt, useMaster } from "@/lib/store";

export default function Radar() {
  const m = useMaster();
  const s = Number(getAt(m, "belts.black.bk1.radarSafety")) || 3;
  const c = Number(getAt(m, "belts.black.bk1.radarCandor")) || 3;
  let q = "Balanced Learning Zone (High Safety + High Candor)";
  if (s <= 2 && c <= 2) q = "Apathy / Polite Avoidance (Low Safety + Low Candor)";
  else if (s <= 2 && c >= 3) q = "Anxiety / Defense Zone (Low Safety + High Pressure — use narrow low-risk checks & written trail)";
  else if (s >= 3 && c <= 2) q = "Comfort / Minimization Zone (Polite but surface — test candor lightly)";
  return (
    <section className="tool">
      <h3>Safety vs. Candor Radar</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="flex justify-between text-sm font-semibold"><span>Interpersonal Safety (1–5)</span><span>{s}/5</span></span>
          <input className="range" type="range" min={1} max={5} value={s} onChange={(e) => setAt("belts.black.bk1.radarSafety", Number(e.target.value))} />
        </label>
        <label className="grid gap-1">
          <span className="flex justify-between text-sm font-semibold"><span>Performance / Candor Standards (1–5)</span><span>{c}/5</span></span>
          <input className="range" type="range" min={1} max={5} value={c} onChange={(e) => setAt("belts.black.bk1.radarCandor", Number(e.target.value))} />
        </label>
      </div>
      <div className="surface p-3 mt-3">
        <p className="kicker">Edmondson Climate Read</p>
        <p>{q}</p>
      </div>
    </section>
  );
}
