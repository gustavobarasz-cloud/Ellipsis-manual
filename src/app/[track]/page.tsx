import { notFound } from "next/navigation";
import { TRACKS, getTrack } from "@/lib/content";
import ModuleList from "@/components/reader/ModuleList";
import { moduleShort } from "@/lib/nav";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRACKS.map((t) => ({ track: t.id }));
}

export function generateMetadata({ params }: { params: { track: string } }) {
  const t = getTrack(params.track);
  return { title: t ? `${t.title} · The Dojo` : "The Dojo" };
}

export default function TrackPage({ params }: { params: { track: string } }) {
  const t = getTrack(params.track);
  if (!t) notFound();
  const groups: { key: string; title: string; sub?: string; modules: { id: string; short: string; title: string; subtitle?: string; days: { id: string }[] }[] }[] = [];
  for (const m of t.modules) {
    const key =
      t.id === "profiling" ? `tier-${m.tier}` : t.id === "communication" ? `belt-${m.belt}` : "layers";
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = {
        key,
        title: t.id === "profiling" ? `Tier ${m.tier} · ${m.tierTitle || ""}` : t.id === "communication" ? `${(m.belt || "").replace(/^./, (c) => c.toUpperCase())} Belt` : "The four layers",
        sub: t.id === "profiling" ? m.tierSubtitle : undefined,
        modules: [],
      };
      groups.push(g);
    }
    g.modules.push({ id: m.id, short: moduleShort(m), title: m.title, subtitle: m.subtitle, days: m.days.map((d) => ({ id: d.id })) });
  }
  return (
    <div>
      <p className="kicker">Door {t.door}</p>
      <h1 className="display text-[28px] sm:text-[36px] mt-1">{t.title}</h1>
      <p className="muted mt-1 mb-5">{t.subtitle}</p>
      <ModuleList trackId={t.id} groups={groups} quiet={t.id === "presence"} />
    </div>
  );
}
