"use client";
// The Master Grid: mark each stage of a belt's column as Home, Fallback or Edge.
import { useMaster, updateMaster } from "@/lib/store";
import { InlineMd } from "@/components/reader/Md";
import type { GridMap } from "./types";

const MARKS = [["home", "Home"], ["fallback", "Fallback"], ["edge", "Edge"]] as const;

export default function Grid({ belt, grid }: { belt: string; grid: GridMap[string] }) {
  const m = useMaster();
  const marks = m.app.grid[belt] || {};
  const set = (stage: string, v: string) =>
    updateMaster((s) => {
      const cur = { ...(s.app.grid[belt] || {}) };
      if (cur[stage] === v) delete cur[stage];
      else cur[stage] = v;
      return { ...s, app: { ...s.app, grid: { ...s.app.grid, [belt]: cur } } };
    });
  return (
    <section className="tool">
      <h3>Master Grid · {grid.column} column</h3>
      <p className="help">Mark where you live most days (Home), where you drop under stress (Fallback) and the stage you are growing into (Edge).</p>
      <div className="grid gap-2">
        {grid.stages.map((st) => (
          <div key={st.n} className="stage-row">
            <details>
              <summary className="cursor-pointer font-bold" style={{ minHeight: 32 }}>{st.n}</summary>
              <div className="grid gap-1 mt-2 text-[15px]">
                {st.t && <p className="muted">{st.t}</p>}
                {(["sig", "gift", "shadow", "tell", "move"] as const).map((k) =>
                  st[k] ? (
                    <p key={k}><strong>{{ sig: "Signature", gift: "Gift", shadow: "Shadow", tell: "Tell", move: "Move" }[k]}:</strong> <InlineMd text={st[k]!} /></p>
                  ) : null,
                )}
              </div>
            </details>
            <div className="seg cols-3" role="group" aria-label={`Mark ${st.n}`}>
              {MARKS.map(([k, lbl]) => (
                <button key={k} type="button" aria-pressed={marks[st.n] === k} onClick={() => set(st.n, k)}>{lbl}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
