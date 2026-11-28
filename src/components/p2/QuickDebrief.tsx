"use client";
// The 30-second Quick Debrief: context, what showed up, triage, one sentence. Saving appends to the debrief log,
// adds to today's Evidence row where you ticked a counter, and offers one tap to promote it (a Tactic to the
// Bk5 Codex, a Sanctuary moment to the 3-line Sanctuary Journal). Everything stays in this browser; in Demo Mode
// it goes to the blank demo state and is never kept.
import { useMemo, useState } from "react";
import Link from "next/link";
import { getAt, setAt, updateMaster, updateP2, useMaster, useSettings, type Debrief, type DebriefCtx } from "@/lib/store";
import { IconClose, IconMic } from "@/components/shell/icons";
import { CTX, TRIAGE, normTag, type DebriefData } from "./types";
import { useDictation } from "./useDictation";

const LANGS = [
  { id: "en-US", label: "English" },
  { id: "es-AR", label: "Español (AR)" },
  { id: "es-ES", label: "Español (ES)" },
];
const langFor = (d: string) => (d === "rioplatense" ? "es-AR" : d === "espana" ? "es-ES" : "en-US");
const BELTS = [
  { id: "white", label: "White" },
  { id: "blue", label: "Blue" },
  { id: "brown", label: "Brown" },
  { id: "black", label: "Black" },
];
const today = () => new Date().toISOString().slice(0, 10);

function Chips({ items, value, onPick, multi }: { items: string[]; value: string[] | string | undefined; onPick: (v: string) => void; multi?: boolean }) {
  const on = (v: string) => (multi ? ((value as string[]) || []).includes(v) : value === v);
  return (
    <div className="chips">
      {items.map((v) => (
        <button key={v} type="button" className="chip" aria-pressed={on(v)} onClick={() => onPick(v)}>{v}</button>
      ))}
    </div>
  );
}

/** Person tags already in use: debriefs plus the B1 and B2 cards. */
export function knownPeople(m: ReturnType<typeof useMaster>): string[] {
  const seen = new Map<string, string>();
  const add = (p?: string) => {
    const k = normTag(p);
    if (k && !seen.has(k)) seen.set(k, (p || "").trim());
  };
  for (const d of m.p2?.debriefs || []) add(d.person);
  for (const path of ["belts.blue.b1Cards", "belts.blue.b2Cards"]) {
    const rows = getAt(m, path);
    if (Array.isArray(rows)) for (const r of rows) add(r?.person);
  }
  return Array.from(seen.values());
}

export default function QuickDebrief({ data, quiet, onClose, startCtx }: { data: DebriefData; quiet?: boolean; onClose: () => void; startCtx?: DebriefCtx }) {
  const m = useMaster();
  const { dialect } = useSettings();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Partial<Debrief>>({ ctx: startCtx || (quiet ? "presence" : undefined), tells: [], evidence: [] });
  const [lang, setLang] = useState(langFor(dialect));
  const [saved, setSaved] = useState<Debrief | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const people = useMemo(() => knownPeople(m), [m]);
  const set = (patch: Partial<Debrief>) => setD((x) => ({ ...x, ...patch }));
  const toggle = (k: "tells" | "evidence", v: string) =>
    setD((x) => {
      const cur = x[k] || [];
      return { ...x, [k]: cur.includes(v) ? cur.filter((y) => y !== v) : [...cur, v] };
    });
  const dict = useDictation(lang, (t) => setD((x) => ({ ...x, takeaway: x.takeaway ? `${x.takeaway} ${t}` : t })));
  const sanctuary = d.ctx === "presence";
  const layer = data.layers.find((l) => l.id === d.layer);
  const detailList = d.triage === "Tactic" ? data.families : d.triage === "Core Concern" ? data.concerns : d.triage === "Need" ? data.needs : [];
  const evCols = d.belt ? data.evidence[d.belt] || [] : [];
  const steps = ["Context", sanctuary ? "Armor" : "Tells", sanctuary ? "Layer" : "Triage", "Takeaway"];
  const canNext = step === 0 ? !!d.ctx : step === 3 ? !!(d.takeaway || "").trim() : true;

  const save = () => {
    const entry: Debrief = {
      id: `d${Date.now().toString(36)}`,
      at: new Date().toISOString(),
      ctx: d.ctx as DebriefCtx,
      person: (d.person || "").trim() || undefined,
      tells: sanctuary ? [] : d.tells || [],
      takeaway: (d.takeaway || "").trim(),
      ...(sanctuary
        ? { armor: d.armor, crossed: !!d.crossed, layer: d.layer, marker: d.marker }
        : { stage: d.stage, triage: d.triage, detail: d.detail, belt: d.belt, evidence: quiet ? [] : d.evidence || [] }),
    };
    updateMaster((s) => {
      const p2 = s.p2 || { pins: [], debriefs: [], nudgeOff: {} };
      let app = s.app;
      const ev = entry.evidence || [];
      if (!sanctuary && entry.belt && ev.length) {
        const cols = data.evidence[entry.belt] || [];
        const rows = [...(s.app.evidence[entry.belt] || [])];
        let r = rows.findIndex((row) => row.date === today());
        if (r < 0) {
          rows.push({ date: today() });
          r = rows.length - 1;
        }
        const row = { ...rows[r] };
        for (const c of ev) {
          const i = cols.indexOf(c);
          if (i >= 0) row[`c${i}`] = String((Number(row[`c${i}`]) || 0) + 1);
        }
        rows[r] = row;
        app = { ...s.app, evidence: { ...s.app.evidence, [entry.belt]: rows } };
      }
      return { ...s, app, p2: { ...p2, debriefs: [entry, ...p2.debriefs] } };
    });
    setSaved(entry);
  };

  const promote = (to: "codex" | "sanctuary") => {
    if (!saved) return;
    if (to === "codex") {
      const path = "belts.black.bk5.codex";
      const cur = getAt(m, path);
      const rows: Record<string, any>[] = Array.isArray(cur) ? cur : [];
      if (rows.length >= 20) return setMsg("The Codex already holds its 20 entries.");
      setAt(path, [...rows, { tactic: saved.detail || "", context: saved.takeaway, person: saved.person, date: saved.at.slice(0, 10), from: "Quick Debrief" }]);
    } else {
      const path = "belts.sanctuary.journal";
      const cur = getAt(m, path);
      const rows: Record<string, any>[] = Array.isArray(cur) ? cur : [];
      const lt = data.layers.find((l) => l.id === saved.layer)?.title;
      const layerLine = [lt, saved.armor].filter(Boolean).join(" · ");
      setAt(path, [{ happened: saved.takeaway, layer: layerLine, marker: saved.marker || "", person: saved.person, date: saved.at.slice(0, 10) }, ...rows]);
    }
    updateP2((p) => ({ ...p, debriefs: p.debriefs.map((x) => (x.id === saved.id ? { ...x, promoted: to } : x)) }));
    setSaved({ ...saved, promoted: to });
  };

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal debrief-modal" role="dialog" aria-modal="true" aria-label="Log an encounter">
        <div className="surface p-4 grid gap-4">
          <div className="flex items-center gap-2">
            <h2 className="display text-[20px] flex-1">{saved ? "Logged" : "Log Encounter"}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><IconClose /></button>
          </div>

          {saved ? (
            <div className="grid gap-3">
              <p className="text-[15px]">&ldquo;{saved.takeaway}&rdquo;</p>
              {!quiet && saved.evidence && saved.evidence.length > 0 && (
                <p className="text-sm muted">Added to today&apos;s {BELTS.find((b) => b.id === saved.belt)?.label} Evidence row: {saved.evidence.join(", ")}.</p>
              )}
              {!saved.promoted && saved.triage === "Tactic" && (
                <button type="button" className="btn" onClick={() => promote("codex")}>Add to the Bk5 Codex</button>
              )}
              {!saved.promoted && saved.ctx === "presence" && (
                <button type="button" className="btn" onClick={() => promote("sanctuary")}>Add to the Sanctuary Journal</button>
              )}
              {saved.promoted === "codex" && <p className="text-sm">Added to the Codex. <Link className="link" href="/communication/journal/black.Bk5" onClick={onClose}>Open it ›</Link></p>}
              {saved.promoted === "sanctuary" && <p className="text-sm">Added to the Sanctuary Journal. <Link className="link" href="/presence/journal/sanctuary.journal" onClick={onClose}>Open it ›</Link></p>}
              {msg && <p className="text-sm muted">{msg}</p>}
              <button type="button" className="btn primary" onClick={onClose}>Done</button>
            </div>
          ) : (
            <>
              <ol className="debrief-steps" aria-label="Steps">
                {steps.map((s, i) => <li key={s} aria-current={i === step ? "step" : undefined} data-done={i < step || undefined}>{s}</li>)}
              </ol>

              {step === 0 && (
                <div className="grid gap-3">
                  <div className="seg cols-3" role="group" aria-label="Context">
                    {CTX.map((c) => (
                      <button key={c.id} type="button" aria-pressed={d.ctx === c.id} onClick={() => set({ ctx: c.id })}>{c.label}</button>
                    ))}
                  </div>
                  <label className="field"><span>Person (optional)</span>
                    <input className="input" list="dojo-people" value={d.person || ""} onChange={(e) => set({ person: e.target.value })} placeholder="A tag only you will see" autoComplete="off" />
                    <datalist id="dojo-people">{people.map((p) => <option key={p} value={p} />)}</datalist>
                  </label>
                </div>
              )}

              {step === 1 && !sanctuary && (
                <div className="grid gap-3">
                  <p className="xk">Tells</p>
                  <Chips items={data.zones} value={d.tells} multi onPick={(v) => toggle("tells", v)} />
                  <p className="xk">Stage you dropped to</p>
                  <Chips items={data.stages} value={d.stage} onPick={(v) => set({ stage: d.stage === v ? undefined : v })} />
                </div>
              )}
              {step === 1 && sanctuary && (
                <div className="grid gap-3">
                  <p className="xk">Which armor showed up</p>
                  <Chips items={data.armors} value={d.armor} onPick={(v) => set({ armor: d.armor === v ? undefined : v })} />
                  <label className="flex items-center gap-3 text-[15px]" style={{ minHeight: 44 }}>
                    <input type="checkbox" checked={!!d.crossed} onChange={(e) => set({ crossed: e.target.checked })} style={{ width: 22, height: 22, accentColor: "var(--track-accent)" }} />
                    A boundary was crossed
                  </label>
                </div>
              )}

              {step === 2 && !sanctuary && (
                <div className="grid gap-3">
                  <Chips items={[...TRIAGE]} value={d.triage} onPick={(v) => set({ triage: d.triage === v ? undefined : v, detail: undefined })} />
                  {detailList.length > 0 && <Chips items={detailList} value={d.detail} onPick={(v) => set({ detail: d.detail === v ? undefined : v })} />}
                  {!quiet && (
                    <>
                      <p className="xk">Count it toward a belt (optional)</p>
                      <Chips items={BELTS.map((b) => b.label)} value={BELTS.find((b) => b.id === d.belt)?.label} onPick={(v) => {
                        const id = BELTS.find((b) => b.label === v)!.id;
                        set({ belt: d.belt === id ? undefined : id, evidence: [] });
                      }} />
                      {evCols.length > 0 && <Chips items={evCols} value={d.evidence} multi onPick={(v) => toggle("evidence", v)} />}
                    </>
                  )}
                </div>
              )}
              {step === 2 && sanctuary && (
                <div className="grid gap-3">
                  <Chips items={data.layers.map((l) => l.title)} value={layer?.title} onPick={(v) => {
                    const id = data.layers.find((l) => l.title === v)!.id;
                    set({ layer: d.layer === id ? undefined : id, marker: undefined });
                  }} />
                  {layer && layer.markers.length > 0 && (
                    <>
                      <p className="xk">Marker, if there was one</p>
                      <Chips items={layer.markers} value={d.marker} onPick={(v) => set({ marker: d.marker === v ? undefined : v })} />
                    </>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-3">
                  <label className="field"><span>One-sentence takeaway</span>
                    <textarea className="input" rows={3} value={d.takeaway || ""} onChange={(e) => set({ takeaway: e.target.value })} />
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {dict.supported && (
                      <button type="button" className="btn sm" aria-pressed={dict.listening} onClick={dict.listening ? dict.stop : dict.start}>
                        <IconMic /> {dict.listening ? "Stop" : "Dictate"}
                      </button>
                    )}
                    <div className="chips" role="group" aria-label="Dictation language">
                      {LANGS.map((l) => (
                        <button key={l.id} type="button" className="chip" aria-pressed={lang === l.id} onClick={() => setLang(l.id)}>{l.label}</button>
                      ))}
                    </div>
                  </div>
                  {!dict.supported && <p className="text-xs muted">Dictation isn&apos;t available in this browser, so type it instead.</p>}
                  {dict.error && <p className="text-xs muted" aria-live="polite">{dict.error}</p>}
                </div>
              )}

              <div className="flex gap-2">
                {step > 0 && <button type="button" className="btn flex-1" onClick={() => setStep(step - 1)}>Back</button>}
                {step < 3 && <button type="button" className="btn primary flex-1" disabled={!canNext} onClick={() => setStep(step + 1)}>Next</button>}
                {step === 3 && <button type="button" className="btn primary flex-1" disabled={!canNext} onClick={save}>Save</button>}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
