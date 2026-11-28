// The small map of titles the top bar and breadcrumbs need on every page.
import { TRACKS } from "./content";

export interface NavDay { id: string; label: string; title: string }
export interface NavModule { id: string; title: string; short: string; belt?: string; days: NavDay[] }
export interface NavTrack { id: string; title: string; short: string; modules: NavModule[] }

const SHORT: Record<string, string> = { profiling: "Profiling", communication: "Communication", presence: "Presence" };

export function moduleShort(m: { id: string; kind?: string; kicker?: string; belt?: string; title: string }): string {
  if (m.kind === "overview") return `${cap(m.belt || "")} Belt`;
  if (m.kind === "capstone") return `${cap(m.belt || "")} Capstone`;
  const id = m.id.replace(/^(white|blue|brown|black)-/, "");
  if (/^m\d+$/.test(id)) return `Module ${Number(id.slice(1))}`;
  if (id === "cautions") return "Cautions";
  return id.toUpperCase().replace(/^BR/, "Br").replace(/^BK/, "Bk");
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function navMap(): NavTrack[] {
  return TRACKS.map((t) => ({
    id: t.id,
    title: t.title,
    short: SHORT[t.id] || t.title,
    modules: t.modules.map((m) => ({
      id: m.id,
      title: m.title,
      short: moduleShort(m),
      belt: m.belt,
      days: m.days.map((d) => ({ id: d.id, label: d.label, title: d.title })),
    })),
  }));
}
