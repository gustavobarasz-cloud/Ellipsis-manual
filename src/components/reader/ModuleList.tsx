"use client";
import Link from "next/link";
import { useMaster, useReady } from "@/lib/store";

interface G { key: string; title: string; sub?: string; modules: { id: string; short: string; title: string; subtitle?: string; days: { id: string }[] }[] }

export default function ModuleList({ trackId, groups, quiet }: { trackId: string; groups: G[]; quiet?: boolean }) {
  const m = useMaster();
  const ready = useReady();
  return (
    <div className="grid gap-7">
      {groups.map((g) => (
        <section key={g.key} aria-label={g.title}>
          <h2 className="display text-[20px]" data-accent-belt={g.key}>{g.title}</h2>
          {g.sub && <p className="text-sm muted">{g.sub}</p>}
          <div className="grid gap-2 mt-3 lg:grid-cols-2">
            {g.modules.map((mod) => {
              const done = mod.days.filter((d) => m.app.done[`${trackId}/${mod.id}/${d.id}`]).length;
              const all = mod.days.length;
              return (
                <Link key={mod.id} href={`/${trackId}/${mod.id}`} className="row-link">
                  {!quiet && <span className={`dot ${ready && done === all && all > 0 ? "done" : "todo"}`} aria-hidden="true" />}
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase tracking-wide muted">{mod.short}</span>
                    <span className="block font-semibold leading-snug">{mod.title}</span>
                  </span>
                  {!quiet && ready && done > 0 && <span className="badge flex-none">{done}/{all}</span>}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
