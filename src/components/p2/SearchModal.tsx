"use client";
// Global search over every card in all three doors (titles, authors, tactics and body text), plus the six
// Theme Threads as cross-door playlists. The index loads the first time search opens, then works offline.
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { recordJump, withThread } from "@/lib/jump";
import { IconClose, IconSearch } from "@/components/shell/icons";

interface Doc { id: string; h: string; d: string; t: string; w: string; a: string; b: string; x: string; c: string }
interface Stop { href: string; code: string; title: string; colour: string; door: string }
interface Thread { id: string; label: string; stops: Stop[] }
interface Index { docs: (Doc & { lt: string; la: string; lb: string; lx: string })[]; threads: Thread[] }

let loaded: Promise<Index> | null = null;
function loadIndex(): Promise<Index> {
  if (!loaded) {
    loaded = fetch("/search-index.json")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j: { docs: Doc[]; threads: Thread[] }) => ({
        threads: j.threads,
        docs: j.docs.map((d) => ({ ...d, lt: d.t.toLowerCase(), la: d.a.toLowerCase(), lb: d.b.toLowerCase(), lx: d.x.toLowerCase() })),
      }))
      .catch((e) => {
        loaded = null;
        throw e;
      });
  }
  return loaded;
}

const DOOR: Record<string, string> = { profiling: "Profiling", communication: "Mastery", presence: "Presence" };

function snippet(x: string, terms: string[]) {
  const lx = x.toLowerCase();
  let at = -1;
  for (const t of terms) {
    const i = lx.indexOf(t);
    if (i >= 0 && (at < 0 || i < at)) at = i;
  }
  if (at < 0) return x.slice(0, 120);
  const s = Math.max(0, at - 50);
  return (s > 0 ? "…" : "") + x.slice(s, s + 150) + (s + 150 < x.length ? "…" : "");
}

export default function SearchModal({ onClose, quiet }: { onClose: () => void; quiet?: boolean }) {
  const router = useRouter();
  const [idx, setIdx] = useState<Index | null>(null);
  const [err, setErr] = useState(false);
  const [q, setQ] = useState("");
  const [thread, setThread] = useState<string | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadIndex().then(setIdx, () => setErr(true));
    input.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const terms = useMemo(() => q.toLowerCase().split(/\s+/).filter((t) => t.length > 1), [q]);
  const results = useMemo(() => {
    if (!idx || !terms.length) return [];
    const t0 = performance.now();
    const out: { d: Index["docs"][number]; s: number }[] = [];
    for (const d of idx.docs) {
      let s = 0;
      let all = true;
      for (const t of terms) {
        const hit = (d.lt.includes(t) ? 8 : 0) + (d.la.includes(t) ? 5 : 0) + (d.lb.includes(t) ? 3 : 0) + (d.lx.includes(t) ? 1 : 0);
        if (!hit) {
          all = false;
          break;
        }
        s += hit;
      }
      if (all) out.push({ d, s });
    }
    out.sort((a, b) => b.s - a.s);
    setTimeout(() => setMs(Math.round(performance.now() - t0)), 0);
    return out.slice(0, 40);
  }, [idx, terms]);

  const go = (href: string) => {
    recordJump(href);
    onClose();
    router.push(href);
  };
  const active = idx?.threads.find((t) => t.id === thread);

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal search-modal" role="dialog" aria-modal="true" aria-label="Search all three doors">
        <div className="surface p-3 grid gap-3">
          <div className="flex items-center gap-2">
            <span className="muted"><IconSearch /></span>
            <input
              ref={input}
              className="input flex-1"
              type="search"
              placeholder="Search titles, authors, tactics, text"
              value={q}
              onChange={(e) => { setQ(e.target.value); setThread(null); }}
              aria-label="Search"
            />
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search"><IconClose /></button>
          </div>

          <div className="xpills wrap" aria-label="Theme Threads">
            {(idx?.threads || []).map((t) => (
              <button key={t.id} type="button" className="thread-pill" aria-pressed={thread === t.id} onClick={() => { setThread(thread === t.id ? null : t.id); setQ(""); }}>
                {t.label}
              </button>
            ))}
          </div>

          {err && <p className="text-sm" style={{ color: "var(--action-red)" }}>Search couldn&apos;t load. Check your connection and open it again.</p>}
          {!idx && !err && <p className="text-sm muted">Loading the index…</p>}

          <div className="search-results">
            {active ? (
              <>
                <p className="xk mb-1">{active.label} · {quiet ? "" : `${active.stops.length} stops · `}across the doors</p>
                <ol className="grid gap-1">
                  {active.stops.map((s, i) => (
                    <li key={s.href}>
                      <button type="button" className="row-link w-full text-left" onClick={() => go(withThread(s.href, active.id))}>
                        <span className="xdot big" data-c={s.colour} aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold uppercase tracking-wide muted">{quiet ? DOOR[s.door] : `${i + 1}. ${DOOR[s.door]} · ${s.code}`}</span>
                          <span className="block text-sm font-semibold leading-snug">{s.title}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </>
            ) : terms.length ? (
              <>
                <p className="text-xs muted mb-1" aria-live="polite">
                  {results.length === 40 ? "Top 40" : results.length} result{results.length === 1 ? "" : "s"}{ms != null ? ` · ${ms} ms` : ""}
                </p>
                <div className="grid gap-1">
                  {results.map(({ d }) => (
                    <button key={d.id} type="button" className="row-link w-full text-left" onClick={() => go(d.h)}>
                      <span className="xdot big" data-c={d.c} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold uppercase tracking-wide muted truncate">{DOOR[d.d]} · {d.d === "presence" ? "" : d.w}{d.a ? `${d.d === "presence" ? "" : " · "}${d.a}` : ""}</span>
                        <span className="block text-sm font-semibold leading-snug">{d.t}</span>
                        <span className="block text-xs muted leading-snug mt-0.5">{snippet(d.x, terms)}</span>
                      </span>
                    </button>
                  ))}
                  {idx && !results.length && <p className="text-sm muted">Nothing matches every word. Try fewer words.</p>}
                </div>
              </>
            ) : (
              idx && <p className="text-sm muted">Type to search {idx.docs.length} cards, or open a thread above.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
