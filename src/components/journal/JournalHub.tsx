"use client";
import Link from "next/link";
import type { JournalMap } from "@/lib/types";
import { useMaster, useReady, useSettings } from "@/lib/store";
import type { GridMap } from "@/components/tools/types";
import Grid from "@/components/tools/Grid";
import { filledCount } from "./filled";

export const GOLDEN_THREAD: { from: string; to: string; label: string }[] = [
  { from: "white.w3", to: "white.w5", label: "W3 column 4 → W5" },
  { from: "blue.B1", to: "blue.B2", label: "B1 → B2" },
  { from: "blue.B3", to: "blue.B5", label: "B3 → B5" },
  { from: "blue.B5", to: "brown.Br1", label: "B5 → Br1" },
  { from: "brown.Br1", to: "brown.Br4", label: "Br1 → Br4" },
  { from: "brown.Br4", to: "brown.Br5", label: "Br4 → Br5" },
];

const GROUPS: { id: string; title: string; sub: string; ids: string[] }[] = [
  { id: "inner", title: "Inner Floor", sub: "White Belt W1–W3: your body, your home base, your hooks.", ids: ["white.w1", "white.w2", "white.w3"] },
  { id: "field", title: "Field Tools", sub: "The cards and files you carry into real conversations.", ids: ["blue.B1", "blue.B2", "blue.B3", "blue.B6", "brown.Br3", "black.Bk5", "black.Bk6"] },
  { id: "sanctuary", title: "Sanctuary Journal", sub: "The 3-line I-Thou journal and the S1.3 Relational Immunity Map.", ids: ["sanctuary.journal", "sanctuary.rim"] },
];

export default function JournalHub({ trackId, journal, grids, only }: { trackId: string; journal: JournalMap; grids: GridMap; only?: "sanctuary" }) {
  const m = useMaster();
  const ready = useReady();
  const { demo } = useSettings();
  const quiet = trackId === "presence";
  const groups = only ? GROUPS.filter((g) => g.id === only) : GROUPS;
  const grouped = new Set(GROUPS.flatMap((g) => g.ids));
  const rest = only ? [] : Object.values(journal).filter((s) => !grouped.has(s.id));
  const Row = ({ id }: { id: string }) => {
    const s = journal[id];
    if (!s) return null;
    const n = ready ? filledCount(s, m) : 0;
    return (
      <Link href={`/${trackId}/journal/${encodeURIComponent(id)}`} className="row-link">
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold uppercase tracking-wide muted">{labelOf(s.store)} · {s.module}</span>
          <span className="block font-semibold leading-snug">{s.title}</span>
        </span>
        {!quiet && n > 0 && <span className="badge flex-none">{n}</span>}
        <span aria-hidden="true" className="muted">›</span>
      </Link>
    );
  };
  return (
    <div>
      <h1 className="display text-[28px]">Journal</h1>
      <p className="muted mt-1 mb-5">
        {demo ? "Demo Mode is on: every entry is hidden and nothing you type is kept." : "Everything here saves in this browser. Back it up with Export JSON in the ⋯ menu."}
      </p>

      {!only && (
        <section className="jgroup" aria-label="Golden Thread">
          <h2>Golden Thread</h2>
          <p className="text-sm muted mb-3">One running project, carried from belt to belt.</p>
          <div className="flex flex-wrap gap-2">
            {GOLDEN_THREAD.map((g) => (
              <Link key={g.label} href={`/${trackId}/journal/${encodeURIComponent(g.to)}`} className="thread-pill">{g.label}</Link>
            ))}
          </div>
        </section>
      )}

      {!only && (
        <section className="jgroup" aria-label="Master Grid">
          <h2>Master Grid</h2>
          <p className="text-sm muted mb-3">Home, Fallback and Edge for each belt&apos;s column.</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {Object.entries(grids).map(([belt, g]) => (
              <details key={belt} className="surface p-3">
                <summary className="cursor-pointer font-bold" style={{ minHeight: 36 }}>{labelOf(belt)} · {g.column}</summary>
                <div className="mt-3"><Grid belt={belt} grid={g} /></div>
              </details>
            ))}
          </div>
        </section>
      )}

      {groups.map((g) => (
        <section key={g.id} className="jgroup" aria-label={g.title}>
          <h2>{g.title}</h2>
          <p className="text-sm muted mb-3">{g.sub}</p>
          <div className="grid gap-2 lg:grid-cols-2">{g.ids.map((id) => <Row key={id} id={id} />)}</div>
        </section>
      ))}

      {rest.length > 0 && (
        <section className="jgroup" aria-label="Every belt journal">
          <h2>Every belt journal</h2>
          <p className="text-sm muted mb-3">The rest of each belt&apos;s deliverables, in order.</p>
          <div className="grid gap-2 lg:grid-cols-2">{rest.map((s) => <Row key={s.id} id={s.id} />)}</div>
        </section>
      )}
    </div>
  );
}

export function labelOf(store: string) {
  return store === "sanctuary" ? "Sanctuary" : `${store[0].toUpperCase()}${store.slice(1)} Belt`;
}
