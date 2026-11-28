"use client";
// A Sanctuary marker you can tick when you notice it. The presence layers save where the Sanctuary manual saved them.
import type { ToolSpec } from "@/lib/types";
import { setAppKey, updateMaster, useMaster } from "@/lib/store";
import { InlineMd } from "@/components/reader/Md";

function sanctuaryKey(id: string): string | null {
  const m = /^s(\d)\.s\d-(\d+)$/.exec(id);
  return m ? `S${m[1]}.${m[2]}` : null;
}

export default function Marker({ spec }: { spec: ToolSpec }) {
  const m = useMaster();
  const sk = sanctuaryKey(spec.id);
  const on = sk ? !!(m.belts.sanctuary.markers || {})[sk] : !!m.app.markers[spec.id];
  const toggle = () => {
    if (sk) updateMaster((s) => ({ ...s, belts: { ...s.belts, sanctuary: { ...s.belts.sanctuary, markers: { ...(s.belts.sanctuary.markers || {}), [sk]: !on } } } }));
    else setAppKey("markers", spec.id, !on);
  };
  return (
    <section className="tool">
      <label className="flex gap-3 items-start cursor-pointer" style={{ minHeight: 44 }}>
        <input type="checkbox" checked={on} onChange={toggle} style={{ width: 22, height: 22, marginTop: 3, flex: "none", accentColor: "var(--track-accent)" }} />
        <span className="prose-card" style={{ fontSize: 16 }}><InlineMd text={spec.text} /></span>
      </label>
    </section>
  );
}
