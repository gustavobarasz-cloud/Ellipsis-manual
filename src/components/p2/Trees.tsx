"use client";
// Tappable White Triage Tree (W4 → W6) and Brown Ask Tree (Br1). Every node's text is the manual's own sentence;
// the only added words are the button "Run the triage" and the short node titles. Vertical on a phone,
// left-to-right at 900px and wider. Nothing here is saved.
import { useState } from "react";
import Link from "next/link";
import type { ToolSpec } from "@/lib/types";
import { InlineMd } from "@/components/reader/Md";
import Linter from "@/components/tools/Linter";

interface Opt { label: string; to: string }
interface TNode { card: string; title?: string; text: string; options?: Opt[]; outcome?: boolean; warn?: boolean; lead?: { card: string; text: string } }
export interface TriageTreeData { id: string; title: string; start: string; nodes: Record<string, TNode> }

const Src = ({ card, hrefs }: { card: string; hrefs: Record<string, string | undefined> }) =>
  hrefs[card] ? <Link href={hrefs[card]!} className="tsrc">From the card ›</Link> : null;

export function TriageTree({ tree, hrefs }: { tree: TriageTreeData; hrefs: Record<string, string | undefined> }) {
  const [path, setPath] = useState<string[]>([tree.start]);
  const pick = (depth: number, to: string) => setPath([...path.slice(0, depth + 1), to]);
  return (
    <div className="tree" aria-live="polite">
      {path.map((id, depth) => {
        const n = tree.nodes[id];
        if (!n) return null;
        const chosen = path[depth + 1];
        return (
          <div key={`${id}-${depth}`} className="tnode surface" data-outcome={n.outcome || undefined} data-warn={n.warn || undefined}>
            {n.title && <p className="xk">{n.title}</p>}
            {n.lead && <p className="text-[15px] mb-2"><InlineMd text={n.lead.text} /></p>}
            <p className="text-[15px]"><InlineMd text={n.text} /></p>
            {n.options && (
              <div className="grid gap-2 mt-3">
                {n.options.map((o) => (
                  <button key={o.to} type="button" className="topt" aria-pressed={chosen === o.to} onClick={() => pick(depth, o.to)}>
                    <InlineMd text={o.label} />
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 mt-3">
              <Src card={n.card} hrefs={hrefs} />
              {n.outcome && <button type="button" className="btn sm" onClick={() => setPath([tree.start])}>Start over</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface Band { strategy: string; weight: string; min: number; max: number; best: string; risk: string }
export interface AskTreeData {
  card: string; intro: string;
  factors: { k: string; label: string }[];
  faces: { card: string; text: string };
  bands: Band[];
  heads: { weight: string; best: string; risk: string };
  surviving: { card: string; title: string; text: string };
}

// The 1–5 scale words are the manual's own Br1 calculator labels.
const SCALE: Record<string, [string, string]> = { D: ["close", "stranger"], P: ["low", "high"], R: ["tiny", "major"] };

export function AskTree({ tree, hrefs, linter }: { tree: AskTreeData; hrefs: Record<string, string | undefined>; linter?: ToolSpec }) {
  const [v, setV] = useState<Record<string, number>>({});
  const all = tree.factors.every((f) => v[f.k]);
  const W = tree.factors.reduce((a, f) => a + (v[f.k] || 0), 0);
  const band = all ? tree.bands.find((b) => W >= b.min && W <= b.max) : undefined;
  return (
    <div className="tree">
      <div className="tnode surface">
        <p className="text-[15px]"><InlineMd text={tree.intro} /></p>
        <div className="grid gap-3 mt-3">
          {tree.factors.map((f) => (
            <div key={f.k}>
              <p className="xk">{f.label} ({f.k}) · 1={SCALE[f.k]?.[0]}, 5={SCALE[f.k]?.[1]}</p>
              <div className="seg cols-5" role="group" aria-label={f.label}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" aria-pressed={v[f.k] === n} onClick={() => setV({ ...v, [f.k]: n })}>{n}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3"><Src card={tree.card} hrefs={hrefs} /></div>
      </div>

      {all && (
        <div className="tnode surface" data-outcome>
          <p className="xk">{tree.heads.weight} = {W}</p>
          <ol className="grid gap-2 mt-2">
            {tree.bands.map((b) => (
              <li key={b.strategy} className="band" aria-current={band === b || undefined}>
                <span className="block font-bold">{b.strategy} · {b.weight}</span>
                {band === b && (
                  <>
                    <span className="block text-sm mt-1"><strong>{tree.heads.best}:</strong> <InlineMd text={b.best} /></span>
                    <span className="block text-sm"><strong>{tree.heads.risk}:</strong> <InlineMd text={b.risk} /></span>
                  </>
                )}
              </li>
            ))}
          </ol>
          <p className="text-sm muted mt-3"><InlineMd text={tree.faces.text} /></p>
        </div>
      )}

      {all && (
        <div className="tnode surface">
          <p className="xk">{tree.surviving.title}</p>
          <p className="text-[15px]"><InlineMd text={tree.surviving.text} /></p>
          <div className="mt-2"><Src card={tree.surviving.card} hrefs={hrefs} /></div>
          {linter && <div className="mt-3"><Linter spec={linter} /></div>}
        </div>
      )}
    </div>
  );
}
