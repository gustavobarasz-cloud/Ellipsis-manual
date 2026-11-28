"use client";
import { useEffect, useRef, useState } from "react";
import type { ToolSpec } from "@/lib/types";
import { getAt, setAt, useMaster } from "@/lib/store";
import { analyzeAsk, analyzeCamera, analyzeLabel, analyzePeriodBut, analyzeRepair, type Seg } from "./linters";

function Highlighted({ segs }: { segs: Seg[] }) {
  return (
    <p className="surface p-3 whitespace-pre-wrap" aria-label="Your text with flagged words highlighted">
      {segs.map((s, i) => (s.cls ? <mark key={i} className={s.cls} title={s.title} style={{ color: "inherit" }}>{s.text}</mark> : <span key={i}>{s.text}</span>))}
    </p>
  );
}

function Score({ value, label }: { value: number; label: string }) {
  return (
    <div className="grid gap-1">
      <div className="flex items-baseline justify-between"><span className="text-sm font-semibold">{label}</span><span className="font-bold">{value}%</span></div>
      <div className="meter"><i style={{ width: `${value}%` }} /></div>
    </div>
  );
}

const REPAIR_CHECKS: [string, string][] = [["act", "Specific Act"], ["own", "Full Ownership"], ["mech", "Accountable Mechanism"], ["offer", "Offer of Repair"], ["affirm", "Affirm Bond"]];

export default function Linter({ spec }: { spec: ToolSpec }) {
  const m = useMaster();
  const savedAsk = spec.kind === "ask" ? (getAt(m, "belts.brown.br1.linterText") as string | undefined) : undefined;
  const [text, setText] = useState(spec.kind === "ask" ? savedAsk ?? "" : "");
  const change = (v: string) => {
    setText(v);
    if (spec.kind === "ask") setAt("belts.brown.br1.linterText", v);
  };

  if (spec.kind === "labelMinute") return <LabelMinute spec={spec} />;

  return (
    <section className="tool">
      <h3>{spec.title}</h3>
      {spec.help && <p className="help">{spec.help}</p>}
      <textarea className="textarea" value={text} placeholder={spec.placeholder || ""} onChange={(e) => change(e.target.value)} aria-label={spec.title} />
      <div className="grid gap-3 mt-3" aria-live="polite">
        {spec.kind === "camera" && text.trim() && (() => {
          const r = analyzeCamera(text);
          return (
            <>
              <Score value={r.score} label="Camera-clean score" />
              <Highlighted segs={r.segs} />
              <p className="text-sm">{r.count ? `${r.count} word${r.count > 1 ? "s" : ""} a camera could never record. Describe what you saw and heard instead.` : "Camera-clean: every word describes something a camera could record."}</p>
            </>
          );
        })()}
        {spec.kind === "periodBut" && text.trim() && (() => {
          const r = analyzePeriodBut(text);
          return <p className={`badge ${r.tone === "ok" ? "accent" : ""}`} style={r.tone === "bad" ? { color: "var(--action-red)" } : undefined}>{r.text}</p>;
        })()}
        {spec.kind === "ask" && (() => {
          const r = analyzeAsk(text);
          if (r.empty) return <p className="text-sm muted">Type or paste an ask above to check Proposal Strength…</p>;
          return (
            <>
              <Score value={r.score} label="Proposal Strength" />
              <Highlighted segs={r.segs} />
              <ul className="list-disc pl-5 text-[15px] grid gap-1">{r.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </>
          );
        })()}
        {spec.kind === "repair" && (() => {
          const r = analyzeRepair(text);
          if (r.empty) return <p className="text-sm muted">Draft a repair above to check Hicks &amp; Lewicki alignment…</p>;
          return (
            <>
              <Score value={r.score} label="Repair alignment" />
              <Highlighted segs={r.segs} />
              <ul className="grid gap-1 text-[15px]">
                {REPAIR_CHECKS.map(([k, lbl]) => (
                  <li key={k}>{(r.checks as Record<string, boolean>)[k] ? "✓" : "○"} {lbl}</li>
                ))}
              </ul>
            </>
          );
        })()}
      </div>
    </section>
  );
}

/** Voss label minute: a prompt, a label, then a 3-second silence. */
function LabelMinute({ spec }: { spec: ToolSpec }) {
  const prompts: string[] = spec.prompts || [];
  const [p, setP] = useState(0);
  const [text, setText] = useState("");
  const [errs, setErrs] = useState<string[]>([]);
  const [hold, setHold] = useState(0);
  const [held, setHeld] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const send = () => {
    const e = analyzeLabel(text.trim());
    setErrs(e);
    setHeld(false);
    if (e.length) return;
    const start = Date.now();
    setHold(0);
    timer.current = setInterval(() => {
      const ms = Date.now() - start;
      setHold(Math.min(1, ms / 3000));
      if (ms >= 3000) {
        clearInterval(timer.current!);
        timer.current = null;
        setHeld(true);
      }
    }, 50);
  };
  const locked = hold > 0 && hold < 1 && !held;
  return (
    <section className="tool">
      <h3>{spec.title}</h3>
      {spec.help && <p className="help">{spec.help}</p>}
      {prompts.length > 0 && (
        <div className="surface p-3 mb-3">
          <p className="text-xs font-bold uppercase tracking-wide muted">They say</p>
          <p>{prompts[p]}</p>
        </div>
      )}
      <textarea className="textarea" value={text} disabled={locked} placeholder="It sounds like..." onChange={(e) => setText(e.target.value)} aria-label="Your label" />
      {locked && <div className="meter mt-2" aria-label="Holding silence"><i style={{ width: `${hold * 100}%` }} /></div>}
      {errs.length > 0 && (
        <div className="mt-2 text-[15px]" role="alert" style={{ color: "var(--action-red)" }}>
          <p className="font-bold">Blocked — Revise Label</p>
          <ul className="list-disc pl-5">{errs.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}
      {held && <p className="mt-2 font-semibold" role="status">Label delivered and 3 seconds of silence held.</p>}
      <div className="btn-row mt-3">
        <button type="button" className="btn primary" onClick={send} disabled={locked || !text.trim()}>Deliver Label &amp; Hold 3s Silence</button>
        {prompts.length > 1 && (
          <button type="button" className="btn" onClick={() => { setP((p + 1) % prompts.length); setText(""); setErrs([]); setHeld(false); setHold(0); }}>Next prompt</button>
        )}
      </div>
    </section>
  );
}
