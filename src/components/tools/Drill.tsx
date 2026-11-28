"use client";
// One drill player for every practice set the manuals ship (B1–B6, Br2, Br3, Br5, Br6, Black drop-the-rope).
import { useState } from "react";
import type { ToolSpec } from "@/lib/types";
import { InlineMd } from "@/components/reader/Md";

type F = [key: string, label: string];
interface Shape { title: string; kicker?: string; prompt: F[]; answer: F[]; pick?: "needOpts" | "choices" }

function shapeOf(spec: ToolSpec, item: any): Shape {
  const has = (k: string) => item && typeof item === "object" && k in item;
  if (has("cue")) return { title: "Baseline or cluster?", prompt: [["cue", "What you see"]], answer: [["ans", "Read"], ["why", "Why"]] };
  if (has("quote")) return { title: "Read the currency", prompt: [["quote", "They say"]], answer: [["curr", "Currency"], ["cb", "Label it back"], ["trap", "Trap"]] };
  if (has("pos")) return { title: "The need beneath the position", prompt: [["pos", "Position"]], answer: [["need", "Need"], ["good", "Honor + hold"], ["bad", "Misses it"]], pick: "needOpts" };
  if (has("lines")) return { title: "Which conversation is this?", prompt: [["lines", "Exchange"]], answer: [["type", "Conversation"], ["shift", "What happened"], ["move", "Better move"]] };
  if (has("ping")) return { title: "Ping and return", prompt: [["setting", "Setting"], ["ping", "Your ping"], ["reply", "Their reply"]], answer: [["light", "Signal"], ["move", "Next move"]] };
  if (has("turn")) return { title: "Message or metamessage?", prompt: [["turn", "Their turn"]], answer: [["type", "Style"], ["msg", "Message"], ["meta", "Metamessage"]], pick: "choices" };
  if (has("word")) return { title: "Weight of the word", prompt: [["word", "Word"]], answer: [["us", "US"], ["rio", "Rioplatense"], ["es", "España"], ["misfire", "Misfire"]] };
  if (has("bad") && has("good")) return { title: "Why → What", prompt: [["bad", "Instead of"]], answer: [["good", "Ask"], ["why", "Why"]] };
  if (has("phase")) return { title: "Renovation simulator", kicker: "phase", prompt: [["prompt", "Situation"]], answer: [], pick: "choices" };
  if (has("tactic")) return { title: spec.title || "Drop the rope", kicker: "tactic", prompt: [["prompt", spec.promptLabel || "Incoming push"]], answer: [["exit", spec.answerLabel || "Exit"]] };
  return { title: "Practice prompts", prompt: [], answer: [] };
}

export default function Drill({ spec, id }: { spec: ToolSpec; id: string }) {
  const items: any[] = spec.items || [];
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ right: 0, done: 0 });
  if (!items.length) return null;

  // a plain list of prompts (B5)
  if (typeof items[0] === "string") {
    return (
      <section className="tool">
        <h3>{spec.title || "Practice prompts"}</h3>
        <ol className="grid gap-2 list-decimal pl-5">
          {items.map((t: string, n) => <li key={n}><InlineMd text={t} /></li>)}
        </ol>
      </section>
    );
  }

  const it = items[i];
  const sh = shapeOf(spec, it);
  const go = (d: number) => {
    setI((i + d + items.length) % items.length);
    setOpen(false);
    setPicked(null);
  };
  const choose = (n: number, ok: boolean | undefined) => {
    if (picked !== null) return;
    setPicked(n);
    setOpen(true);
    if (ok !== undefined) setScore((s) => ({ right: s.right + (ok ? 1 : 0), done: s.done + 1 }));
  };
  const val = (k: string) => (it[k] == null ? "" : String(it[k]));

  return (
    <section className="tool" aria-label={sh.title} data-tool={id}>
      <div className="flex items-start justify-between gap-2">
        <h3>{sh.title}</h3>
        <span className="text-sm muted flex-none">{i + 1} of {items.length}{score.done ? ` · ${score.right}/${score.done} right` : ""}</span>
      </div>
      <div className="surface p-4 grid gap-2">
        {sh.kicker && val(sh.kicker) && <p className="kicker">{val(sh.kicker)}</p>}
        {sh.prompt.map(([k, label]) => val(k) && (
          <p key={k}><span className="text-xs font-bold uppercase tracking-wide muted block">{label}</span><InlineMd text={val(k)} /></p>
        ))}
      </div>

      {sh.pick === "needOpts" && Array.isArray(it.needOpts) && (
        <div className="grid gap-2 mt-3" role="group" aria-label="Which need?">
          {it.needOpts.map((o: string, n: number) => {
            const ok = o === it.need;
            return (
              <button key={n} type="button" className="choice" aria-pressed={picked === n} onClick={() => choose(n, ok)}>
                {o}
                {picked !== null && (ok ? " ✓" : picked === n ? " ✗" : "")}
              </button>
            );
          })}
        </div>
      )}
      {sh.pick === "choices" && Array.isArray(it.choices) && (
        <div className="grid gap-2 mt-3" role="group" aria-label="Choose a response">
          {it.choices.map((c: any, n: number) => (
            <div key={n}>
              <button type="button" className="choice" aria-pressed={picked === n} onClick={() => choose(n, typeof c.ok === "boolean" ? c.ok : undefined)}>
                <span className="block text-xs font-bold uppercase tracking-wide muted">{c.lbl}{picked !== null && c.ok === true ? " ✓" : ""}</span>
                <InlineMd text={c.txt} />
              </button>
              {picked === n && (
                <div className="mt-2 pl-3 grid gap-1 text-[15px]" style={{ borderLeft: "3px solid var(--track-accent)" }}>
                  {c.fb && <p><InlineMd text={c.fb} /></p>}
                  {c.sig && <p><strong>Signal:</strong> {c.sig}</p>}
                  {c.reply && <p><strong>Reply:</strong> <InlineMd text={c.reply} /></p>}
                  {c.note && <p className="muted"><InlineMd text={c.note} /></p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {open && sh.answer.length > 0 && (
        <div className="grid gap-2 mt-3">
          {sh.answer.map(([k, label]) => val(k) && (
            <p key={k}><span className="text-xs font-bold uppercase tracking-wide muted block">{label}</span><InlineMd text={val(k)} /></p>
          ))}
        </div>
      )}

      <div className="btn-row mt-3">
        <button type="button" className="btn sm" onClick={() => go(-1)}>‹ Prev</button>
        {sh.answer.length > 0 && (
          <button type="button" className="btn sm primary" onClick={() => setOpen((o) => !o)}>{open ? "Hide" : "Reveal"}</button>
        )}
        <button type="button" className="btn sm" onClick={() => go(1)}>Next ›</button>
      </div>
    </section>
  );
}
