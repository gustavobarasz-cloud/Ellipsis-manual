"use client";
import Link from "next/link";
import { useMaster, useReady } from "@/lib/store";

export default function DayList({ trackId, moduleId, days, quiet }: { trackId: string; moduleId: string; days: { id: string; label: string; title: string; cards: number }[]; quiet?: boolean }) {
  const m = useMaster();
  const ready = useReady();
  return (
    <div className="grid gap-2">
      {days.map((d) => {
        const done = !!m.app.done[`${trackId}/${moduleId}/${d.id}`];
        return (
          <Link key={d.id} href={`/${trackId}/${moduleId}/${d.id}`} className="row-link">
            {!quiet && <span className={`dot ${ready && done ? "done" : "todo"}`} aria-hidden="true" />}
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold uppercase tracking-wide muted">{d.label} · {d.cards} card{d.cards === 1 ? "" : "s"}</span>
              <span className="block font-semibold leading-snug">{d.title}</span>
            </span>
            <span aria-hidden="true" className="muted">›</span>
          </Link>
        );
      })}
    </div>
  );
}
