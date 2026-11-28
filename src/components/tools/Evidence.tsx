"use client";
// Evidence log: one row per episode, one count per column of the belt's evidence bar.
import type { ToolSpec } from "@/lib/types";
import { updateMaster, useMaster } from "@/lib/store";

export default function Evidence({ spec }: { spec: ToolSpec }) {
  const m = useMaster();
  const belt: string = spec.belt;
  const cols: string[] = spec.cols || [];
  const dateFirst = /date|episode/i.test(cols[0] || "");
  const numCols = dateFirst ? cols.slice(1) : cols;
  const rows = m.app.evidence[belt] || [];
  const old = (m.belts as any)[belt]?.evidence;
  const oldCounts = old && typeof old === "object" && !Array.isArray(old) ? Object.entries(old).filter(([, v]) => typeof v === "number" && v > 0) : [];
  const save = (next: Record<string, string>[]) => updateMaster((s) => ({ ...s, app: { ...s.app, evidence: { ...s.app.evidence, [belt]: next } } }));
  const add = () => save([...rows, { date: new Date().toISOString().slice(0, 10) }]);
  const set = (r: number, k: string, v: string) => save(rows.map((row, i) => (i === r ? { ...row, [k]: v } : row)));
  const del = (r: number) => save(rows.filter((_, i) => i !== r));
  const totals = numCols.map((_, c) => rows.reduce((a, row) => a + (Number(row[`c${c}`]) || 0), 0));
  return (
    <section className="tool">
      <h3>Evidence log</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {numCols.map((c, i) => <span key={c} className="badge">{c}: <strong>{totals[i]}</strong></span>)}
      </div>
      {oldCounts.length > 0 && (
        <p className="text-sm muted mb-2">From the original manual: {oldCounts.map(([k, v]) => `${k} ${v}`).join(" · ")}</p>
      )}
      <div className="grid gap-3">
        {rows.map((row, r) => (
          <div key={r} className="surface p-3 grid gap-2">
            <div className="flex gap-2 items-end">
              <label className="field flex-1"><span>{dateFirst ? cols[0] : "Date"}</span>
                <input className="input" value={row.date || ""} onChange={(e) => set(r, "date", e.target.value)} />
              </label>
              <button type="button" className="btn sm danger" onClick={() => del(r)} aria-label="Delete this row">Delete</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {numCols.map((c, i) => (
                <label key={c} className="field"><span className="text-xs">{c}</span>
                  <input className="input" inputMode="numeric" value={row[`c${i}`] || ""} onChange={(e) => set(r, `c${i}`, e.target.value.replace(/[^\d]/g, ""))} />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="btn sm mt-3" onClick={add}>Add an episode</button>
    </section>
  );
}
