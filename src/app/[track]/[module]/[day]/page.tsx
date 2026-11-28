import { notFound } from "next/navigation";
import { allDayRoutes, getModule, getTrack, toolsFor } from "@/lib/content";
import { moduleShort } from "@/lib/nav";
import { handoffFor, neighbours } from "@/lib/routes";
import FocusCardDeck from "@/components/reader/FocusCardDeck";

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
  const day = m?.days.find((d) => d.id === params.day);
  if (!t || !m || !day) notFound();
  const ids = day.cards.flatMap((c) => c.tools || []);
  const { tools, journal, grids } = toolsFor(ids);
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
      outline={m.days.length > 1 ? m.days.map((d) => ({ href: `/${t.id}/${m.id}/${d.id}`, label: d.label, title: d.title, current: d.id === day.id })) : undefined}
    />
  );
}
