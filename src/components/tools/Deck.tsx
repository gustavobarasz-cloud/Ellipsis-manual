"use client";
import { useState } from "react";
import type { ToolSpec } from "@/lib/types";
import { InlineMd } from "@/components/reader/Md";

/** Socratic flip deck: question first, answer on tap. */
export default function Deck({ spec }: { spec: ToolSpec }) {
  const items: { q: string; a: string }[] = spec.items || [];
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  const it = items[i];
  const go = (d: number) => { setI((i + d + items.length) % items.length); setOpen(false); };
  return (
    <section className="tool">
      <h3>{spec.title}</h3>
      <p className="text-sm muted mb-2">{i + 1} of {items.length}</p>
      <div className="surface p-4">
        <p className="font-semibold"><InlineMd text={it.q} /></p>
        {open && <p className="mt-3"><InlineMd text={it.a} /></p>}
      </div>
      <div className="btn-row mt-3">
        <button type="button" className="btn sm" onClick={() => go(-1)}>‹ Prev</button>
        <button type="button" className="btn sm primary" onClick={() => setOpen((o) => !o)}>{open ? "Hide answer" : "Show answer"}</button>
        <button type="button" className="btn sm" onClick={() => go(1)}>Next ›</button>
      </div>
    </section>
  );
}
