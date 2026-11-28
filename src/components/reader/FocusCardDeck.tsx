"use client";
// One card at a time: Core Idea → In Action → Go Deeper → Check & Apply.
// Swipe left/right (never from the screen edges, where the system back gesture lives), arrow keys,
// or the thumb-height Prev/Next buttons.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Card, Day, JournalMap, ToolMap } from "@/lib/types";
import { setAppKey, useMaster, useReady } from "@/lib/store";
import EditableCardBody from "./EditableCardBody";
import ToolView from "@/components/tools/ToolView";
import type { GridMap } from "@/components/tools/types";
import CardFooter, { type DayThread, type PillGroup } from "@/components/p2/CardFooter";
import LensFlipper, { type LensView } from "@/components/p2/LensFlipper";
import PinShare from "@/components/p2/PinShare";
import Companion from "@/components/p2/Companion";

export interface Handoff { title: string; body: string; href: string; cta: string }

interface Props {
  trackId: string;
  moduleId: string;
  moduleTitle: string;
  day: Day;
  tools: ToolMap;
  journal: JournalMap;
  grids: GridMap;
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
  handoff?: Handoff;
  quiet?: boolean; // Intimacy & Presence: no progress or badges
  outline?: { href: string; label: string; title: string; current: boolean }[];
  pills?: PillGroup[];
  threads?: DayThread[];
  lenses?: Record<string, LensView[]>;
  drill?: string;
  where?: string;
}

const EDGE = 28;

export default function FocusCardDeck({ trackId, moduleId, moduleTitle, day, tools, journal, grids, prev, next, handoff, quiet, outline, pills = [], threads = [], lenses = {}, drill, where = "" }: Props) {
  const router = useRouter();
  const ready = useReady();
  const master = useMaster();
  const cards: (Card | { id: "__handoff"; kind: "handoff" })[] = [...day.cards, ...(handoff ? [{ id: "__handoff" as const, kind: "handoff" as const }] : [])];
  const total = cards.length;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const top = useRef<HTMLDivElement>(null);
  const doneKey = `${trackId}/${moduleId}/${day.id}`;
  const done = !!master.app.done[doneKey];

  // keep the card position in the URL hash so a reload returns to the same card
  useEffect(() => {
    const n = parseInt((window.location.hash || "").replace("#", ""), 10);
    if (n >= 1 && n <= total) setI(n - 1);
  }, [total]);

  const go = useCallback(
    (to: number) => {
      if (to < 0) {
        if (prev) router.push(prev.href);
        return;
      }
      if (to >= total) {
        if (next) router.push(next.href);
        return;
      }
      setDir(to > i ? 1 : -1);
      setI(to);
      history.replaceState(null, "", `#${to + 1}`);
      top.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    },
    [i, total, prev, next, router],
  );

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.closest("input, textarea, select, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey)) return;
      if (e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowLeft") go(i - 1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [go, i]);

  const touch = useRef<{ x: number; y: number; ok: boolean } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const el = e.target as HTMLElement;
    const blocked = el.closest("input, textarea, select, .tbl, [data-editing], [data-noswipe]");
    const edge = t.clientX < EDGE || t.clientX > window.innerWidth - EDGE;
    touch.current = { x: t.clientX, y: t.clientY, ok: !blocked && !edge };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current;
    touch.current = null;
    if (!s || !s.ok) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    if (dx < 0 && i < total - 1) go(i + 1);
    if (dx > 0 && i > 0) go(i - 1);
  };

  const card = cards[Math.min(i, total - 1)];
  const isLast = i === total - 1;

  return (
    <div className="split">
      <div ref={top} style={{ scrollMarginTop: 72 }}>
        <div className="deck-head">
          <div className="min-w-0">
            <p className="kicker truncate">{moduleTitle}</p>
            <p className="font-bold leading-snug">{day.label === day.title ? day.title : `${day.label} · ${day.title}`}</p>
          </div>
          {!quiet && ready && done && <span className="badge accent flex-none">Done</span>}
        </div>
        <div className="steps mb-3" aria-hidden="true">
          {cards.map((c, n) => (
            <i key={c.id} className={n <= i ? "on" : ""} />
          ))}
        </div>

        <div className="deck" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {card.kind === "handoff" && handoff ? (
            <article key="handoff" className={`fcard ${dir < 0 ? "from-left" : ""}`}>
              <p className="label">Belt handoff</p>
              <h1>{handoff.title}</h1>
              <div className="prose-card"><p>{handoff.body}</p></div>
              <div className="btn-row mt-5">
                <Link href={handoff.href} className="btn primary">{handoff.cta}</Link>
              </div>
            </article>
          ) : (
            <article key={card.id} className={`fcard ${dir < 0 ? "from-left" : ""}`} aria-roledescription="card">
              <div className="card-head">
                <p className="label">{(card as Card).label}</p>
                <PinShare cardId={card.id} title={(card as Card).title} where={where} href={`/${trackId}/${moduleId}/${day.id}${i > 0 ? `#${i + 1}` : ""}`} />
              </div>
              <h1>{(card as Card).title}</h1>
              <EditableCardBody cardId={card.id} title={(card as Card).title} md={(card as Card).md} />
              {lenses[card.id]?.length ? <LensFlipper key={card.id} lenses={lenses[card.id]} cardId={card.id} door={trackId as "profiling" | "communication" | "presence"} /> : null}
              {(card as Card).tools?.length ? (
                <div className="tool-stack" data-noswipe>
                  {(card as Card).tools!.map((tid) =>
                    tools[tid] ? <ToolView key={tid} id={tid} spec={tools[tid]} journal={journal} grids={grids} quiet={quiet} /> : null,
                  )}
                </div>
              ) : null}
              {isLast && !quiet && (
                <div className="mt-6 no-print">
                  <button
                    type="button"
                    className={`btn ${done ? "" : "primary"}`}
                    onClick={() => setAppKey("done", doneKey, !done)}
                    aria-pressed={done}
                  >
                    {done ? "Marked done · undo" : "Mark this day done"}
                  </button>
                </div>
              )}
              <CardFooter groups={pills} threads={threads} quiet={quiet} />
            </article>
          )}
        </div>

        <div className="deck-nav no-print">
          <button type="button" className="btn" onClick={() => go(i - 1)} disabled={i === 0 && !prev} aria-label={i === 0 && prev ? `Previous: ${prev.label}` : "Previous card"}>
            ‹ {i === 0 && prev ? "Back" : "Prev"}
          </button>
          <span className="count" aria-live="polite">{i + 1} of {total}</span>
          <button type="button" className="btn primary" onClick={() => go(i + 1)} disabled={isLast && !next} aria-label={isLast && next ? `Next: ${next.label}` : "Next card"}>
            {isLast && next ? "Next day" : "Next"} ›
          </button>
        </div>
      </div>

      <Companion
        md={card.kind === "handoff" ? "" : (card as Card).md}
        groups={pills}
        threads={threads}
        drill={drill}
        tools={tools}
        journal={journal}
        grids={grids}
        quiet={quiet}
        outline={outline}
        cards={cards.map((c) => ({ id: c.id, label: c.kind === "handoff" ? "Belt handoff" : (c as Card).label }))}
        current={i}
        onCard={go}
      />
    </div>
  );
}
