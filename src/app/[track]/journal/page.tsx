import { notFound } from "next/navigation";
import { EXTRAS, JOURNAL, TRACKS, getTrack } from "@/lib/content";
import JournalHub from "@/components/journal/JournalHub";
import DemoGuard from "@/components/journal/DemoGuard";
import { PitPostMortemView } from "@/components/pit/PitOpsViews";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRACKS.map((t) => ({ track: t.id }));
}
export const metadata = { title: "Journal · The Dojo" };

export default function JournalPage({ params }: { params: { track: string } }) {
  const t = getTrack(params.track);
  if (!t) notFound();
  if (t.id === "profiling") {
    return (
      <div>
        <h1 className="display text-[28px]">Journal</h1>
        <p className="muted mt-1 mb-5">Post-mortems from real rooms: the signal, your move, the pull you resisted.</p>
        <DemoGuard what="Your post-mortem log">
          <PitPostMortemView />
        </DemoGuard>
      </div>
    );
  }
  return <JournalHub trackId={t.id} journal={JOURNAL} grids={EXTRAS.grids} only={t.id === "presence" ? "sanctuary" : undefined} />;
}
