import Link from "next/link";
import { notFound } from "next/navigation";
import { TRACKS, getTrack } from "@/lib/content";
import { markerIndex, practiceIndex } from "@/lib/routes";
import DemoGuard from "@/components/journal/DemoGuard";
import { PitCodexView } from "@/components/pit/PitOpsViews";
import MarkerList from "@/components/tools/MarkerList";
import { TREE_PAGES } from "@/lib/phase2";

export const dynamicParams = false;

const KIND: Record<string, string> = { deck: "Question deck", drill: "Drill", timer: "Timer", linter: "Linter", faceweight: "Calculator", radar: "Radar", bodymap: "Body map" };

export function generateStaticParams() {
  return TRACKS.map((t) => ({ track: t.id }));
}
export const metadata = { title: "Practice · The Dojo" };

const BELTS = ["white", "blue", "brown", "black"];

export default function PracticePage({ params }: { params: { track: string } }) {
  const t = getTrack(params.track);
  if (!t) notFound();
  if (t.id === "profiling") {
    return (
      <div>
        <h1 className="display text-[28px]">Practice</h1>
        <p className="muted mt-1 mb-5">The Pit Codex: field cards for reading and countering pressure in live rooms.</p>
        <DemoGuard what="Your Pit Codex notes">
          <PitCodexView />
        </DemoGuard>
      </div>
    );
  }
  if (t.id === "presence") {
    return (
      <div>
        <h1 className="display text-[28px]">Practice</h1>
        <p className="muted mt-1 mb-5">The markers of each layer. Tick one when you notice it in real life.</p>
        <MarkerList items={markerIndex("presence")} />
      </div>
    );
  }
  const items = practiceIndex(t.id);
  return (
    <div>
      <h1 className="display text-[28px]">Practice</h1>
      <p className="muted mt-1 mb-5">Drills, timers and linters from every belt, plus the Loop and the Kit.</p>
      <section className="jgroup">
        <h2>Before and after a real conversation</h2>
        <div className="grid gap-2 mt-3 lg:grid-cols-2">
          <Link href={`/${t.id}/practice/loop`} className="row-link"><span className="flex-1"><span className="block font-semibold">The Living Loop</span><span className="block text-sm muted">Prepare, read, respond, debrief</span></span><span className="muted">›</span></Link>
          <Link href={`/${t.id}/practice/kit`} className="row-link"><span className="flex-1"><span className="block font-semibold">The Kit</span><span className="block text-sm muted">All your tools in one place</span></span><span className="muted">›</span></Link>
        </div>
      </section>
      <section className="jgroup">
        <h2>Decision trees</h2>
        <div className="grid gap-2 mt-3 lg:grid-cols-2">
          {TREE_PAGES.map((x) => (
            <Link key={x.id} href={`/${t.id}/practice/${x.id}`} className="row-link">
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold uppercase tracking-wide muted">{x.where} · Tree</span>
                <span className="block font-semibold leading-snug">{x.title}</span>
                <span className="block text-sm muted">{x.sub}</span>
              </span>
              <span className="muted">›</span>
            </Link>
          ))}
        </div>
      </section>
      {BELTS.map((b) => {
        const list = items.filter((x) => x.belt === b);
        if (!list.length) return null;
        return (
          <section key={b} className="jgroup">
            <h2>{b[0].toUpperCase() + b.slice(1)} Belt</h2>
            <div className="grid gap-2 mt-3 lg:grid-cols-2">
              {list.map((x) => (
                <Link key={x.id} href={`/${t.id}/practice/${encodeURIComponent(x.id)}`} className="row-link">
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase tracking-wide muted">{x.where} · {KIND[x.type] ?? x.type}</span>
                    <span className="block font-semibold leading-snug">{x.title}</span>
                  </span>
                  <span className="muted">›</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
