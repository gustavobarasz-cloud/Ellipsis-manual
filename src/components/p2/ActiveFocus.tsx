"use client";
// The slim "Active Focus" strip on Learn: the up-to-three cards the person pinned. Hidden when none are pinned.
import { updateP2, useMaster, useReady } from "@/lib/store";
import JumpLink from "./JumpLink";

export default function ActiveFocus() {
  const m = useMaster();
  const ready = useReady();
  const pins = m.p2?.pins || [];
  if (!ready || !pins.length) return null;
  return (
    <section className="focus-strip no-print" aria-label="Active Focus">
      <span className="xk">Active Focus</span>
      <div className="focus-row">
        {pins.map((p) => (
          <span key={p.id} className="focus-pin">
            <JumpLink href={p.href} className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-wide muted truncate">{p.where}</span>
              <span className="block text-sm font-semibold leading-snug truncate">{p.title}</span>
            </JumpLink>
            <button type="button" className="unpin" aria-label={`Unpin ${p.title}`} onClick={() => updateP2((s) => ({ ...s, pins: s.pins.filter((x) => x.id !== p.id) }))}>×</button>
          </span>
        ))}
      </div>
    </section>
  );
}
