import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, getTrack, toolsFor } from "@/lib/content";
import { practiceIndex } from "@/lib/routes";
import ToolView from "@/components/tools/ToolView";
import DemoGuard from "@/components/journal/DemoGuard";
import LoopView from "@/components/LoopView";
import KitView from "@/components/KitView";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ tool: "loop" }, { tool: "kit" }, ...practiceIndex("communication").map((x) => ({ tool: x.id }))].map((p) => ({ track: "communication", ...p }));
}

export function generateMetadata({ params }: { params: { tool: string } }) {
  const id = decodeURIComponent(params.tool);
  return { title: id === "loop" ? "The Living Loop" : id === "kit" ? "The Kit" : `${TOOLS[id]?.title || "Practice"} · The Dojo` };
}

export default function PracticeToolPage({ params }: { params: { track: string; tool: string } }) {
  const t = getTrack(params.track);
  const id = decodeURIComponent(params.tool);
  if (!t) notFound();
  if (id === "loop" || id === "kit") {
    return (
      <div className="-mx-4">
        <DemoGuard what={id === "loop" ? "The Living Loop" : "The Kit"}>
          {id === "loop" ? <LoopView /> : <KitView />}
        </DemoGuard>
      </div>
    );
  }
  const item = practiceIndex(t.id).find((x) => x.id === id);
  if (!item) notFound();
  const { tools, journal, grids } = toolsFor([id]);
  return (
    <div className="max-w-[760px]">
      <p className="kicker">{item.where}</p>
      <h1 className="display text-[26px] mt-1 mb-4">{item.title}</h1>
      <ToolView id={id} spec={tools[id]} journal={journal} grids={grids} />
      <p className="mt-5"><Link href={item.href} className="btn">Read the lesson card ›</Link></p>
    </div>
  );
}
