"use client";
// White Belt W1 somatic map. Saves the chosen zones where the White Belt manual did (w1_zones, comma separated).
import type { ToolSpec } from "@/lib/types";
import { setAt, useMaster } from "@/lib/store";

export default function BodyMap({ spec }: { spec: ToolSpec }) {
  const m = useMaster();
  const zones: string[] = Array.from(new Set<string>(spec.zones || []));
  const active = new Set(String(m.belts.white.w1_zones || "").split(", ").filter(Boolean));
  const toggle = (z: string) => {
    const next = new Set(active);
    next.has(z) ? next.delete(z) : next.add(z);
    setAt("belts.white.w1_zones", Array.from(next).join(", "));
  };
  return (
    <section className="tool">
      <h3>Somatic Body Map</h3>
      <p className="help">Tap where stress shows up first in your body.</p>
      <div className="zone-grid" role="group" aria-label="Body zones">
        {zones.map((z) => (
          <button key={z} type="button" className="choice" aria-pressed={active.has(z)} onClick={() => toggle(z)}>
            {active.has(z) ? "● " : "○ "}{z}
          </button>
        ))}
      </div>
    </section>
  );
}
