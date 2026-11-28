"use client";
// The side companion in Learn's split view (≥900px): the card's 4-way dialect script, its cross-door links,
// the day's drill, and the outline. On phones it stays hidden; the same links sit in the card footer.
import Link from "next/link";
import { useMemo, useState } from "react";
import { parseMd, type Block, type Inline } from "@/lib/md";
import { DIALECTS, type JournalMap, type ToolMap } from "@/lib/types";
import { Inl } from "@/components/reader/Md";
import ToolView from "@/components/tools/ToolView";
import type { GridMap } from "@/components/tools/types";
import JumpLink from "./JumpLink";
import type { DayThread, PillGroup } from "./CardFooter";
import { withThread } from "@/lib/jump";

type Tab = "script" | "links" | "drill" | "outline";
export interface OutlineItem { href: string; label: string; title: string; current: boolean }

function dialects(blocks: Block[], out: { label: string; lines: Record<string, Inline[]> }[] = []) {
  for (const b of blocks) {
    if (b.t === "dialect") out.push({ label: b.label, lines: b.lines });
    else if (b.t === "note" || b.t === "details" || b.t === "quote") dialects(b.c, out);
  }
  return out;
}

export default function Companion({
  md, groups, threads, drill, tools, journal, grids, quiet, outline, cards, current, onCard,
}: {
  md: string;
  groups: PillGroup[];
  threads: DayThread[];
  drill?: string;
  tools: ToolMap;
  journal: JournalMap;
  grids: GridMap;
  quiet?: boolean;
  outline?: OutlineItem[];
  cards: { id: string; label: string }[];
  current: number;
  onCard: (n: number) => void;
}) {
  const scripts = useMemo(() => dialects(parseMd(md || "")), [md]);
  const has = { script: scripts.length > 0, links: groups.length > 0 || threads.length > 0, drill: !!drill && !!tools[drill] };
  const order: Tab[] = (["script", "links", "drill", "outline"] as Tab[]).filter((t) => t === "outline" || has[t]);
  const [pick, setPick] = useState<Tab | null>(null);
  const tab: Tab = pick && order.includes(pick) ? pick : order[0];
  const NAME: Record<Tab, string> = { script: "Script", links: "Links", drill: "Drill", outline: "Outline" };
  return (
    <aside aria-label="Companion" className="companion" data-noswipe>
      {order.length > 1 && (
        <div className={`seg cols-${Math.min(order.length, 4)} mb-3`} role="tablist">
          {order.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={t === tab} aria-pressed={t === tab} onClick={() => setPick(t)}>{NAME[t]}</button>
          ))}
        </div>
      )}

      {tab === "script" && (
        <div className="grid gap-3">
          {scripts.map((s, i) => (
            <div key={i} className="surface p-3">
              <p className="xk mb-2">{s.label.replace(/\s·\s[A-Za-z0-9_]+$/, "") || "Script"}</p>
              <div className="grid gap-2">
                {DIALECTS.filter((d) => s.lines[d.id]).map((d) => (
                  <p key={d.id} className="text-[15px] leading-snug"><span className="badge mr-1">{d.short}</span><Inl c={s.lines[d.id]} /></p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "links" && (
        <div className="grid gap-3">
          {groups.map((g) => (
            <div key={g.id} className="surface p-3">
              <p className="xk mb-2">{g.label}</p>
              <div className="grid gap-1">
                {g.pills.map((p) => (
                  <JumpLink key={p.href} href={p.href} className="row-link">
                    <span className="xdot big" data-c={p.colour} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      {!(quiet || p.door === "presence") && <span className="block text-xs font-bold muted">{p.code}</span>}
                      <span className="block text-sm leading-snug">{p.title}</span>
                    </span>
                  </JumpLink>
                ))}
              </div>
            </div>
          ))}
          {threads.length > 0 && (
            <div className="surface p-3">
              <p className="xk mb-2">Theme Threads</p>
              <div className="grid gap-1">
                {threads.map((t) => (
                  <div key={t.id} className="flex items-center gap-2">
                    <span className="flex-1 text-sm font-semibold">{t.label}{quiet ? "" : ` · ${t.index} of ${t.total}`}</span>
                    {t.prev && <Link className="btn sm" href={withThread(t.prev, t.id)} aria-label={`Previous on ${t.label}`}>‹</Link>}
                    {t.next && <Link className="btn sm" href={withThread(t.next, t.id)} aria-label={`Next on ${t.label}`}>›</Link>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "drill" && drill && tools[drill] && <ToolView id={drill} spec={tools[drill]} journal={journal} grids={grids} quiet={quiet} />}

      {tab === "outline" && (
        <div className="grid gap-3">
          {outline && (
            <div className="surface p-3">
              <p className="kicker mb-2">In this module</p>
              <div className="grid gap-1">
                {outline.map((o) => (
                  <Link key={o.href} href={o.href} className="row-link" style={o.current ? { borderColor: "var(--track-accent)" } : undefined} aria-current={o.current ? "page" : undefined}>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold muted">{o.label}</span>
                      <span className="block text-sm leading-snug">{o.title}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="surface p-3">
            <p className="kicker mb-2">Cards</p>
            <div className="grid gap-1">
              {cards.map((c, n) => (
                <button key={c.id} type="button" className="row-link text-left" style={n === current ? { borderColor: "var(--track-accent)" } : undefined} onClick={() => onCard(n)}>
                  <span className="text-sm">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
