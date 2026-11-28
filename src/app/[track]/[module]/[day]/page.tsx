import { notFound } from "next/navigation";
import { allDayRoutes, getModule, getTrack, toolsFor } from "@/lib/content";
import { moduleShort } from "@/lib/nav";
import { handoffFor, neighbours } from "@/lib/routes";
import FocusCardDeck from "@/components/reader/FocusCardDeck";
import { PITCH_TOOLS, lensesFor, pillsFor, pitchSpecs, threadsFor } from "@/lib/phase2";
import { PRACTICE_TYPES } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return allDayRoutes();
}

export function generateMetadata({ params }: { params: { track: string; module: string; day: string } }) {
  const m = getModule(params.track, params.module);
  const d = m?.days.find((x) => x.id === params.day);
  return { title: d ? `${d.title} · ${m!.title}` : "The Dojo" };
}

export default function DayPage({ params }: { params: { track: string; module: string; day: string } }) {
  const t = getTrack(params.track);
  const m = getModule(params.track, params.module);
  const found = m?.days.find((d) => d.id === params.day);
  if (!t || !m || !found) notFound();
  // Pillar 2: the live pitch check joins the W6 and Br4 practice cards.
  const pitch = pitchSpecs();
  const day = { ...found, cards: found.cards.map((c) => (PITCH_TOOLS[c.id] ? { ...c, tools: [...(c.tools || []), PITCH_TOOLS[c.id].tool] } : c)) };
  const ids = day.cards.flatMap((c) => c.tools || []);
  const { tools, journal, grids } = toolsFor(ids);
  for (const id of ids) if (pitch[id]) tools[id] = pitch[id];
  const lenses: Record<string, ReturnType<typeof lensesFor>> = {};
  for (const c of day.cards) {
    const l = lensesFor(c.id);
    if (l.length) lenses[c.id] = l;
  }
  const drill = ids.find((id) => tools[id] && PRACTICE_TYPES.has(tools[id].type));
  const { prev, next } = neighbours(t.id, m.id, day.id);
  return (
    <FocusCardDeck
      trackId={t.id}
      moduleId={m.id}
      moduleTitle={`${moduleShort(m)} · ${m.title}`}
      day={day}
      tools={tools}
      journal={journal}
      grids={grids}
      prev={prev}
      next={next}
      handoff={handoffFor(t.id, m, day.id)}
      quiet={t.id === "presence"}
      pills={pillsFor(t.id, m.id, day.id)}
      threads={threadsFor(t.id, m.id, day.id)}
      lenses={lenses}
      drill={drill}
      where={`${moduleShort(m)} · ${day.label}`}
      outline={m.days.length > 1 ? m.days.map((d) => ({ href: `/${t.id}/${m.id}/${d.id}`, label: d.label, title: d.title, current: d.id === day.id })) : undefined}
    />
  );
}
