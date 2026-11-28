// Server-side helpers for page wiring: previous/next day, the belt handoff card, and the Practice index.
import fs from "fs";
import path from "path";
import { TOOLS, TRACKS, getModule } from "./content";
import { moduleShort } from "./nav";
import type { Module, TrackSummary } from "./types";

export function neighbours(trackId: string, moduleId: string, dayId: string) {
  const t = TRACKS.find((x) => x.id === trackId)!;
  const flat: { href: string; label: string }[] = [];
  for (const m of t.modules) for (const d of m.days) flat.push({ href: `/${t.id}/${m.id}/${d.id}`, label: `${moduleShort(m)} · ${d.label}` });
  const i = flat.findIndex((x) => x.href === `/${trackId}/${moduleId}/${dayId}`);
  return { prev: i > 0 ? flat[i - 1] : undefined, next: i >= 0 && i < flat.length - 1 ? flat[i + 1] : undefined };
}

const BELT_NAME: Record<string, string> = { white: "White Belt", blue: "Blue Belt", brown: "Brown Belt", black: "Black Belt" };

/** The last card of each capstone hands the person to the next belt, and Black Belt hands them to the Living Loop. */
export function handoffFor(trackId: string, mod: Module, dayId: string) {
  if (mod.kind !== "capstone" || !mod.handoffTo) return undefined;
  if (mod.days[mod.days.length - 1]?.id !== dayId) return undefined;
  const from = BELT_NAME[mod.belt || ""] || "This belt";
  if (mod.handoffTo === "loop") {
    return {
      title: `${from} complete → The Living Loop`,
      body: "Every belt now runs together in one loop before and after a real conversation: prepare, read, respond, debrief.",
      href: `/${trackId}/practice/loop`,
      cta: "Open the Living Loop",
    };
  }
  const next = getModule(trackId, `${mod.handoffTo}-overview`) as (Module & { question?: string }) | undefined;
  const name = BELT_NAME[mod.handoffTo] || mod.handoffTo;
  return {
    title: `${from} complete → ${name}`,
    body: [next?.subtitle, next?.question].filter(Boolean).join(" · ") || `Carry what you built into ${name}.`,
    href: `/${trackId}/${mod.handoffTo}-overview`,
    cta: `Start ${name}`,
  };
}

export interface PracticeItem { id: string; type: string; title: string; where: string; href: string; belt: string }

export const PRACTICE_TYPES = new Set(["deck", "drill", "timer", "linter", "faceweight", "radar", "bodymap"]);
const DRILL_TITLE: Record<string, string> = {
  B1_clusters: "Baseline or cluster?",
  B2_drills: "Read the currency",
  B3_drills: "The need beneath the position",
  B4_drills: "Which conversation is this?",
  B5_prompts: "Label prompts",
  B6_drills: "Ping and return",
  BR2_SCENARIOS: "Message or metamessage?",
  BR3_WORDS: "Weight of the word",
  BR5_QDRILL: "Why → What",
  BR6_RENO_SIM: "Renovation simulator",
};

/** Every practice tool in a track, with the card it lives on. */
export function practiceIndex(trackId: string): PracticeItem[] {
  const t = TRACKS.find((x) => x.id === trackId) as TrackSummary;
  const out: PracticeItem[] = [];
  const seen = new Set<string>();
  for (const ms of t.modules) {
    const file = path.join(process.cwd(), "src", "content", "modules", t.id, `${ms.id}.json`);
    const mod = JSON.parse(fs.readFileSync(file, "utf8")) as Module;
    for (const d of mod.days)
      for (const c of d.cards)
        for (const id of c.tools || []) {
          const spec = TOOLS[id];
          if (!spec || !PRACTICE_TYPES.has(spec.type) || seen.has(id)) continue;
          seen.add(id);
          const title =
            spec.type === "drill" ? spec.title || DRILL_TITLE[spec.set] || "Drill" :
            spec.type === "faceweight" ? "Face-Weight Calculator" :
            spec.type === "radar" ? "Safety vs. Candor Radar" :
            spec.type === "bodymap" ? "Somatic Body Map" : spec.title || spec.type;
          out.push({ id, type: spec.type, title, where: `${moduleShort(ms)} · ${d.label}`, href: `/${t.id}/${ms.id}/${d.id}`, belt: ms.belt || "" });
        }
  }
  return out;
}

export function markerIndex(trackId: string) {
  const t = TRACKS.find((x) => x.id === trackId) as TrackSummary;
  const out: { id: string; text: string; where: string; href: string; module: string }[] = [];
  for (const ms of t.modules) {
    const mod = getModule(t.id, ms.id)!;
    for (const d of mod.days)
      for (const c of d.cards)
        for (const id of c.tools || []) if (TOOLS[id]?.type === "marker") out.push({ id: TOOLS[id].id, text: TOOLS[id].text, where: `${moduleShort(ms)} · ${d.label}`, href: `/${t.id}/${ms.id}/${d.id}`, module: ms.title });
  }
  return out;
}
