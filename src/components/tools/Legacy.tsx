"use client";
import type { ToolSpec } from "@/lib/types";

/** Labs too intricate to rebuild here open in the original manual, which ships with this app. */
export default function Legacy({ spec }: { spec: ToolSpec }) {
  return (
    <section className="tool">
      <h3>Interactive lab</h3>
      <p className="help">This lab runs in the original manual. What you type there saves in that manual on this site; bring it into your journal later with its backup and Import JSON in the ⋯ menu.</p>
      <a className="btn" href={spec.href} target="_blank" rel="noopener">{spec.label} ↗</a>
    </section>
  );
}
