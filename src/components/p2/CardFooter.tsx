"use client";
// The footer of a Focus Card: colour-coded pills to the same idea in the other doors, and the Theme Thread
// this day belongs to (with ‹ › when the person is walking a thread).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import JumpLink from "./JumpLink";
import { withThread } from "@/lib/jump";

export interface Pill { href: string; code: string; title: string; colour: string; door: string }
export interface PillGroup { id: string; label: string; pills: Pill[] }
export interface DayThread { id: string; label: string; index: number; total: number; prev?: string; next?: string }

export function useThreadParam(): [string | undefined, (t?: string) => void] {
  const [t, setT] = useState<string | undefined>();
  useEffect(() => {
    const read = () => setT(new URLSearchParams(window.location.search).get("thread") || undefined);
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  const set = (next?: string) => {
    const u = new URL(window.location.href);
    if (next) u.searchParams.set("thread", next);
    else u.searchParams.delete("thread");
    history.replaceState(history.state, "", u.pathname + u.search + u.hash);
    setT(next);
  };
  return [t, set];
}

export default function CardFooter({ groups, threads, quiet }: { groups: PillGroup[]; threads: DayThread[]; quiet?: boolean }) {
  const [active, setActive] = useThreadParam();
  const router = useRouter();
  const walking = threads.find((t) => t.id === active);
  if (!groups.length && !threads.length) return null;
  return (
    <div className="card-foot no-print" data-noswipe>
      {groups.length > 0 && (
        <div className="xrow" aria-label="The same idea in the other doors">
          <span className="xk">Across the doors</span>
          <div className="xpills">
            {groups.flatMap((g) =>
              g.pills.map((p) => (
                <JumpLink key={g.id + p.href} href={p.href} className="xpill" data-c={p.colour} title={`${g.label} · ${p.code} · ${p.title}`}>
                  <span className="xdot" aria-hidden="true" />
                  {quiet || p.door === "presence" ? p.title : p.code}
                </JumpLink>
              )),
            )}
          </div>
        </div>
      )}
      {walking ? (
        <div className="thread-nav" role="navigation" aria-label={`${walking.label} thread`}>
          <button type="button" className="btn sm" disabled={!walking.prev} onClick={() => walking.prev && router.push(withThread(walking.prev, walking.id))} aria-label="Previous stop on this thread">‹</button>
          <span className="flex-1 min-w-0 text-center">
            <span className="block text-xs font-bold uppercase tracking-wide muted">Thread</span>
            <span className="block text-sm font-semibold truncate">{walking.label}{quiet ? "" : ` · ${walking.index} of ${walking.total}`}</span>
          </span>
          <button type="button" className="btn sm" disabled={!walking.next} onClick={() => walking.next && router.push(withThread(walking.next, walking.id))} aria-label="Next stop on this thread">›</button>
          <button type="button" className="btn sm" onClick={() => setActive(undefined)} aria-label="Stop walking this thread">×</button>
        </div>
      ) : threads.length > 0 ? (
        <div className="xrow">
          <span className="xk">Thread</span>
          <div className="xpills">
            {threads.map((t) => (
              <button key={t.id} type="button" className="thread-pill" onClick={() => setActive(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
