"use client";
import type { ToolSpec } from "@/lib/types";
import { updateMaster, useMaster } from "@/lib/store";
import { InlineMd } from "@/components/reader/Md";

/** Socratic rungs. Answers save where the original manuals saved them: Blue in rungNotes, Brown in its rung store. */
export default function Rungs({ spec, quiet }: { spec: ToolSpec; quiet?: boolean }) {
  const m = useMaster();
  const items: { name: string; md: string }[] = spec.items || [];
  const isBrown = spec.belt === "brown";
  const keyOf = (i: number) => (isBrown ? `${spec.key}_r${i}` : `${spec.key}_R${i}`);
  const valueOf = (i: number): string => (isBrown ? m.brownRungs[keyOf(i)] : (m.belts.blue.rungNotes || {})[keyOf(i)]) || "";
  const set = (i: number, v: string) =>
    updateMaster((s) =>
      isBrown
        ? { ...s, brownRungs: { ...s.brownRungs, [keyOf(i)]: v } }
        : { ...s, belts: { ...s.belts, blue: { ...s.belts.blue, rungNotes: { ...(s.belts.blue.rungNotes || {}), [keyOf(i)]: v } } } },
    );
  const answered = items.filter((_, i) => valueOf(i).trim()).length;
  return (
    <section className="tool">
      <div className="flex items-start justify-between gap-2">
        <h3>{spec.title}</h3>
        {!quiet && <span className="badge accent flex-none">{answered}/{items.length}</span>}
      </div>
      <ol className="grid gap-4 mt-2">
        {items.map((it, i) => (
          <li key={i} className="grid gap-2">
            <p><strong>{it.name}</strong> <InlineMd text={it.md} /></p>
            <textarea className="textarea" style={{ minHeight: 76 }} value={valueOf(i)} onChange={(e) => set(i, e.target.value)} aria-label={it.name} placeholder="Your answer" />
          </li>
        ))}
      </ol>
      {spec.foot && <p className="text-sm muted mt-3"><InlineMd text={spec.foot} /></p>}
    </section>
  );
}
