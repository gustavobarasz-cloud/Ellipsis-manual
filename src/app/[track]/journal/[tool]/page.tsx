import Link from "next/link";
import { notFound } from "next/navigation";
import { JOURNAL, getTrack } from "@/lib/content";
import JournalForm from "@/components/journal/JournalForm";
import { GOLDEN_THREAD, labelOf } from "@/components/journal/JournalHub";

export const dynamicParams = false;

export function generateStaticParams() {
  const ids = Object.keys(JOURNAL);
  return [
    ...ids.map((id) => ({ track: "communication", tool: id })),
    ...ids.filter((id) => JOURNAL[id].store === "sanctuary").map((id) => ({ track: "presence", tool: id })),
  ];
}

export function generateMetadata({ params }: { params: { tool: string } }) {
  const s = JOURNAL[decodeURIComponent(params.tool)];
  return { title: s ? `${s.title} · Journal` : "Journal" };
}

export default function JournalEntryPage({ params }: { params: { track: string; tool: string } }) {
  const t = getTrack(params.track);
  const id = decodeURIComponent(params.tool);
  const spec = JOURNAL[id];
  if (!t || !spec) notFound();
  const from = GOLDEN_THREAD.find((g) => g.to === id);
  const to = GOLDEN_THREAD.find((g) => g.from === id);
  const prev = from ? JOURNAL[from.from] : undefined;
  return (
    <div className="max-w-[760px]">
      <p className="kicker">{labelOf(spec.store)} · {spec.module}</p>
      <h1 className="display text-[26px] mt-1 mb-4">{spec.title}</h1>
      {prev && (
        <details className="surface p-3 mb-4">
          <summary className="cursor-pointer font-bold" style={{ minHeight: 36 }}>
            <span className="thread-pill mr-2">Golden Thread</span> From {labelOf(prev.store)} {prev.module}: {prev.title}
          </summary>
          <div className="mt-3"><JournalForm spec={prev} bare /></div>
        </details>
      )}
      <JournalForm spec={spec} bare />
      {to && JOURNAL[to.to] && (
        <p className="mt-6">
          <Link href={`/${t.id}/journal/${encodeURIComponent(to.to)}`} className="btn">Next on the Golden Thread: {JOURNAL[to.to].module} ›</Link>
        </p>
      )}
    </div>
  );
}
