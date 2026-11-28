import Link from "next/link";
import { notFound } from "next/navigation";
import { TRACKS, getModule, getTrack } from "@/lib/content";
import { moduleShort } from "@/lib/nav";
import DayList from "@/components/reader/DayList";
import { InlineMdServer } from "@/components/reader/InlineMdServer";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRACKS.flatMap((t) => t.modules.map((m) => ({ track: t.id, module: m.id })));
}

export function generateMetadata({ params }: { params: { track: string; module: string } }) {
  const m = getModule(params.track, params.module);
  return { title: m ? `${m.title} · The Dojo` : "The Dojo" };
}

export default function ModulePage({ params }: { params: { track: string; module: string } }) {
  const t = getTrack(params.track);
  const m = getModule(params.track, params.module);
  if (!t || !m) notFound();
  const meta: [string, string | undefined][] = [
    [m.goldenLabel || "Golden thread", m.golden],
    ["Guardrail", m.guardrail],
    ["Gate", m.gate],
    ["Assembly", m.assembly],
  ];
  return (
    <div>
      <p className="kicker">{m.kicker || moduleShort(m)}</p>
      <h1 className="display text-[27px] sm:text-[34px] mt-1">{m.title}</h1>
      {m.subtitle && <p className="muted mt-2 text-[17px]">{m.subtitle}</p>}
      {m.intro && <div className="prose-card mt-4"><InlineMdServer text={m.intro} /></div>}
      <div className="grid gap-2 mt-4">
        {meta.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="surface p-3 text-[15px]">
            <p className="kicker mb-1">{k}</p>
            <p><InlineMdServer text={v!} /></p>
          </div>
        ))}
      </div>
      <h2 className="display text-[20px] mt-7 mb-3">{m.days.length > 1 ? "Days" : "Start"}</h2>
      <DayList trackId={t.id} moduleId={m.id} days={m.days.map((d) => ({ id: d.id, label: d.label, title: d.title, cards: d.cards.length }))} quiet={t.id === "presence"} />
      <p className="mt-6">
        <Link href={`/${t.id}`} className="btn sm">All modules</Link>
      </p>
    </div>
  );
}
