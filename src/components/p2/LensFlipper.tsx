"use client";
// The 3-way Lens Flipper on the shared concept cards: the same idea as each door's manual words it.
import { useState } from "react";
import { InlineMd } from "@/components/reader/Md";
import { useContentCard, useSettings } from "@/lib/store";
import JumpLink from "./JumpLink";

export interface LensStance { door: "profiling" | "communication" | "presence"; card?: string; quote?: string; href?: string; where?: string }
export interface LensView { id: string; label: string; stances: LensStance[] }

const DOOR = { profiling: "Profiling", communication: "Mastery", presence: "Presence" } as const;

function EmptySlot({ slot }: { slot: string }) {
  const { content, save } = useContentCard(slot, "");
  const { demo } = useSettings();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  if (editing)
    return (
      <div data-editing="true" className="grid gap-2">
        <textarea className="textarea" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Paste this door's sentence from the manual" autoFocus />
        <div className="btn-row">
          <button type="button" className="btn sm primary" onClick={() => { save(draft); setEditing(false); }}>Save</button>
          <button type="button" className="btn sm" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  return (
    <div className="grid gap-2">
      {content ? <p><InlineMd text={content} /></p> : <p className="muted text-sm">Empty slot: the manuals have no sentence for this door yet.</p>}
      {!demo && <button type="button" className="btn sm justify-self-start" onClick={() => { setDraft(content); setEditing(true); }}>Edit</button>}
    </div>
  );
}

export default function LensFlipper({ lenses, cardId, door }: { lenses: LensView[]; cardId: string; door: LensStance["door"] }) {
  const [li, setLi] = useState(0);
  const lens = lenses[Math.min(li, lenses.length - 1)];
  const [d, setD] = useState<LensStance["door"]>(door);
  if (!lens) return null;
  const s = lens.stances.find((x) => x.door === d) || lens.stances[0];
  return (
    <section className="lens no-print" data-noswipe aria-label={`Lens: ${lens.label}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="xk">Lens · {lens.label}</p>
        {lenses.length > 1 && (
          <div className="flex gap-1">
            {lenses.map((l, i) => (
              <button key={l.id} type="button" className="thread-pill" aria-pressed={i === li} onClick={() => setLi(i)}>{l.label}</button>
            ))}
          </div>
        )}
      </div>
      <div className="seg cols-3" role="tablist" aria-label="Door">
        {lens.stances.map((x) => (
          <button key={x.door} type="button" role="tab" aria-selected={x.door === d} aria-pressed={x.door === d} onClick={() => setD(x.door)}>{DOOR[x.door]}</button>
        ))}
      </div>
      <div className="lens-body" data-door={s.door}>
        {s.quote ? (
          <>
            <blockquote><InlineMd text={s.quote} /></blockquote>
            <p className="text-sm muted mt-2">
              {s.where}
              {s.card !== cardId && s.href && (
                <>
                  {" · "}
                  <JumpLink href={s.href} className="font-semibold" style={{ color: "var(--track-accent)" }}>Open this card ›</JumpLink>
                </>
              )}
              {s.card === cardId && " · this card"}
            </p>
          </>
        ) : (
          <EmptySlot slot={`lens.${lens.id}.${s.door}`} />
        )}
      </div>
    </section>
  );
}
