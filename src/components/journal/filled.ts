import type { JournalSpec } from "@/lib/types";
import { getAt, type MasterState } from "@/lib/store";

const nonEmpty = (v: any): number => {
  if (v == null) return 0;
  if (typeof v === "string") return v.trim() ? 1 : 0;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (Array.isArray(v)) return v.reduce((a, x) => a + nonEmpty(x), 0);
  if (typeof v === "object") return Object.values(v).reduce((a: number, x) => a + nonEmpty(x), 0);
  return 0;
};

/** How many answers a journal holds (for the hub's counts). */
export function filledCount(spec: JournalSpec, m: MasterState): number {
  const b = `belts.${spec.store}`;
  if (spec.list) return (getAt(m, `${b}.${spec.list}`) || []).length;
  let n = 0;
  if (spec.tests) for (const t of spec.tests) n += nonEmpty(getAt(m, spec.store === "white" ? `${b}.chk_${t.k}` : `${b}.capstone.${t.k}`));
  if (spec.sections) {
    for (const s of spec.sections) {
      if (s.repeat) n += nonEmpty(getAt(m, `${b}.${s.repeat}`));
      else for (const f of s.fields) n += nonEmpty(getAt(m, `${b}.${f.k}`));
    }
  } else if (!spec.tests || spec.store === "white") {
    const base = spec.path ? `${b}.${spec.path}` : b;
    for (const f of spec.fields || []) n += nonEmpty(getAt(m, `${base}.${f.k}`));
  }
  return n;
}
