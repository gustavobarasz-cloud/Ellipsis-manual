"use client";
// Top of every Journal: the Log Encounter button, any stance-switch nudges, the People timeline and the debrief log.
// All of it reads the saved state, so Demo Mode (a blank state) masks it completely; People shows two sample
// personas there instead, marked as samples.
import { useMemo, useState } from "react";
import Link from "next/link";
import { getAt, updateP2, useMaster, useReady, useSettings, type Debrief, type DebriefCtx } from "@/lib/store";
import QuickDebrief from "./QuickDebrief";
import { InlineMd } from "@/components/reader/Md";
import { CTX, DAY, normTag, type DebriefData } from "./types";

const ctxLabel = (c: string) => CTX.find((x) => x.id === c)?.label || c;
const fmt = (iso?: string) => (iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "");

interface Item { kind: string; label: string; text: string; date?: string; href?: string }
interface Person { key: string; name: string; items: Item[]; sample?: boolean }

const SAMPLES: Person[] = [
  {
    key: "sample-manager", name: "Sample Manager", sample: true,
    items: [
      { kind: "debrief", label: "Quick Debrief · Office Dojo · Tactic", text: "Sample entry: your one-sentence takeaway shows here.", date: "2026-01-12" },
      { kind: "b2", label: "B2 Hypothesis card", text: "Sample entry: your working read shows here." },
      { kind: "b1", label: "B1 Baseline card", text: "Sample entry: the setting shows here." },
    ],
  },
  {
    key: "sample-friend", name: "Sample Friend", sample: true,
    items: [
      { kind: "debrief", label: "Quick Debrief · Personal Dojo · Need", text: "Sample entry: your one-sentence takeaway shows here.", date: "2026-01-10" },
      { kind: "sanctuary", label: "Sanctuary Journal", text: "Sample entry: what happened between you shows here.", date: "2026-01-08" },
    ],
  },
];

function useNudges(debriefs: Debrief[], off: Record<string, boolean>) {
  return useMemo(() => {
    const since = Date.now() - 14 * DAY;
    const recent = debriefs.filter((d) => Date.parse(d.at) >= since);
    const stance: { key: string; name: string; n: number }[] = [];
    const byTag = new Map<string, Debrief[]>();
    for (const d of recent) {
      if (d.ctx !== "personal" || !d.person || !["Tactic", "Core Concern", "Need"].includes(d.triage || "")) continue;
      const k = normTag(d.person);
      byTag.set(k, [...(byTag.get(k) || []), d]);
    }
    Array.from(byTag.entries()).forEach(([k, list]) => {
      if (list.length < 2) return;
      const key = `stance:${k}:${list[0].id}`;
      if (!off[key]) stance.push({ key, name: list[0].person!.trim(), n: list.length });
    });
    const crossed = recent.filter((d) => d.ctx === "presence" && d.crossed);
    const boundary = crossed.length >= 2 && !off[`boundary:${crossed[0].id}`] ? { key: `boundary:${crossed[0].id}`, n: crossed.length } : null;
    return { stance, boundary };
  }, [debriefs, off]);
}

export default function DebriefPanel({ data, trackId }: { data: DebriefData; trackId: string }) {
  const m = useMaster();
  const ready = useReady();
  const { demo } = useSettings();
  const quiet = trackId === "presence";
  const [open, setOpen] = useState(false);
  const debriefs = m.p2?.debriefs || [];
  const { stance, boundary } = useNudges(debriefs, m.p2?.nudgeOff || {});
  const dismiss = (key: string) => updateP2((p) => ({ ...p, nudgeOff: { ...p.nudgeOff, [key]: true } }));
  const remove = (id: string) => updateP2((p) => ({ ...p, debriefs: p.debriefs.filter((x) => x.id !== id) }));

  const people = useMemo<Person[]>(() => {
    const map = new Map<string, Person>();
    const add = (name: string | undefined, it: Item) => {
      const key = normTag(name);
      if (!key) return;
      const p = map.get(key) || { key, name: name!.trim(), items: [] };
      p.items.push(it);
      map.set(key, p);
    };
    for (const d of debriefs) {
      if (quiet && d.ctx !== "presence") continue;
      add(d.person, { kind: "debrief", label: `Quick Debrief · ${ctxLabel(d.ctx)}${!quiet && d.triage ? ` · ${d.triage}` : ""}`, text: d.takeaway, date: d.at });
    }
    if (!quiet) {
      const list = (path: string) => (Array.isArray(getAt(m, path)) ? (getAt(m, path) as Record<string, any>[]) : []);
      for (const r of list("belts.blue.b1Cards")) add(r?.person, { kind: "b1", label: "B1 Baseline card", text: r?.setting || r?.posture || "", href: "/communication/journal/blue.B1" });
      for (const r of list("belts.blue.b2Cards")) add(r?.person, { kind: "b2", label: "B2 Hypothesis card", text: r?.currency || "", href: "/communication/journal/blue.B2" });
      for (const r of list("belts.black.bk5.codex")) add(r?.person, { kind: "codex", label: "Bk5 Codex", text: r?.tactic || r?.context || "", date: r?.date, href: "/communication/journal/black.Bk5" });
    }
    const sj = getAt(m, "belts.sanctuary.journal");
    if (Array.isArray(sj)) for (const r of sj) add(r?.person, { kind: "sanctuary", label: "Sanctuary Journal", text: r?.happened || "", date: r?.date, href: "/presence/journal/sanctuary.journal" });
    const out = Array.from(map.values());
    for (const p of out) p.items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    out.sort((a, b) => (b.items[0]?.date || "").localeCompare(a.items[0]?.date || ""));
    return out;
  }, [m, debriefs, quiet]);

  if (!ready) return null;
  const shownPeople = demo ? SAMPLES : people;
  const log = quiet ? debriefs.filter((d) => d.ctx === "presence") : debriefs;

  return (
    <section className="jgroup debrief-panel" aria-label="Quick Debrief">
      <button type="button" className="btn primary w-full" style={{ minHeight: 52 }} onClick={() => setOpen(true)}>Log Encounter</button>
      <p className="text-xs muted mt-2">Thirty seconds: context, what showed up, triage, one sentence.</p>

      {stance.map((s) => (
        <div key={s.key} className="nudge surface p-3 mt-3">
          <p className="text-sm"><strong>{s.name}</strong>{quiet ? "" : `: ${s.n} tactical or profiling reads in 14 days`}. Time to switch stance?</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.nudge.stance.map((l) => <Link key={l.href} href={l.href} className="thread-pill">{l.code} · {l.title}</Link>)}
          </div>
          <button type="button" className="btn sm mt-2" onClick={() => dismiss(s.key)}>Dismiss</button>
        </div>
      ))}
      {boundary && (
        <div className="nudge surface p-3 mt-3">
          <p className="text-sm">{quiet ? "Boundary crossings keep showing up in your Sanctuary log." : `${boundary.n} Sanctuary boundary crossings in 14 days.`}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.nudge.boundary.map((l) => <Link key={l.href} href={l.href} className="thread-pill">{l.code} · {l.title}</Link>)}
          </div>
          {data.nudge.rule9 && (
            <p className="text-sm mt-2"><InlineMd text={data.nudge.rule9} />{data.nudge.rule9Href && <> <Link className="link" href={data.nudge.rule9Href}>Open ›</Link></>}</p>
          )}
          <button type="button" className="btn sm mt-2" onClick={() => dismiss(boundary.key)}>Dismiss</button>
        </div>
      )}

      <details className="surface p-3 mt-3">
        <summary className="cursor-pointer font-bold" style={{ minHeight: 32 }}>People{demo ? " · samples" : ""}</summary>
        {demo && <p className="text-xs muted mt-2">Demo Mode is on, so your own people are hidden. These two are samples.</p>}
        {shownPeople.length === 0 && <p className="text-sm muted mt-2">Add a person tag to a debrief, a B1 or B2 card or a journal entry and they appear here.</p>}
        <div className="grid gap-3 mt-2">
          {shownPeople.map((p) => (
            <details key={p.key} className="person">
              <summary className="cursor-pointer font-semibold" style={{ minHeight: 32 }}>{p.name}{!quiet && <span className="muted text-xs"> · {p.items.length}</span>}</summary>
              <ol className="timeline">
                {p.items.map((it, i) => (
                  <li key={i}>
                    <span className="block text-xs font-bold uppercase tracking-wide muted">{it.label}{it.date ? ` · ${fmt(it.date)}` : ""}</span>
                    {it.href && !p.sample ? <Link href={it.href} className="block text-sm">{it.text || "Open ›"}</Link> : <span className="block text-sm">{it.text}</span>}
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </details>

      {log.length > 0 && (
        <details className="surface p-3 mt-3">
          <summary className="cursor-pointer font-bold" style={{ minHeight: 32 }}>Debrief log</summary>
          <ol className="grid gap-2 mt-2">
            {log.map((d) => (
              <li key={d.id} className="flex gap-2 items-start">
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold uppercase tracking-wide muted">
                    {fmt(d.at)} · {ctxLabel(d.ctx)}{d.person ? ` · ${d.person}` : ""}{!quiet && d.triage ? ` · ${d.triage}` : ""}
                  </span>
                  <span className="block text-sm">{d.takeaway}</span>
                </span>
                <button type="button" className="btn sm danger" onClick={() => remove(d.id)} aria-label="Delete this debrief">Delete</button>
              </li>
            ))}
          </ol>
        </details>
      )}

      {open && <QuickDebrief data={data} quiet={quiet} startCtx={quiet ? ("presence" as DebriefCtx) : undefined} onClose={() => setOpen(false)} />}
    </section>
  );
}
