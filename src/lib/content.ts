// Server-side content access. Pages read only the module they show, so each page ships only its own text.
import fs from "fs";
import path from "path";
import manifestJson from "@/content/manifest.json";
import toolsJson from "@/content/tools.json";
import journalJson from "@/content/journal.json";
import extrasJson from "@/content/extras.json";
import type { GridMap } from "@/components/tools/types";
import type { JournalMap, Module, ModuleSummary, PocketCard, ToolMap, TrackId, TrackSummary } from "./types";

export const TRACKS = manifestJson as unknown as TrackSummary[];
export const TOOLS = toolsJson as unknown as ToolMap;
export const JOURNAL = journalJson as unknown as JournalMap;
export const EXTRAS = extrasJson as unknown as {
  pockets: Record<string, PocketCard>;
  grids: GridMap;
  codex: unknown;
  pitStages: unknown;
  blackStarterCodex: unknown;
};

export function getTrack(id: string): TrackSummary | undefined {
  return TRACKS.find((t) => t.id === id);
}

export function getModuleSummary(track: string, id: string): ModuleSummary | undefined {
  return getTrack(track)?.modules.find((m) => m.id === id);
}

export function getModule(track: string, id: string): Module | undefined {
  if (!getModuleSummary(track, id)) return undefined;
  const file = path.join(process.cwd(), "src", "content", "modules", track, `${id}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as Module;
}

/** The tool specs (and the journal specs and grid stages they point to) that a set of cards uses. */
export function toolsFor(ids: string[]): { tools: ToolMap; journal: JournalMap; grids: typeof EXTRAS.grids } {
  const tools: ToolMap = {};
  const journal: JournalMap = {};
  const grids: typeof EXTRAS.grids = {};
  for (const id of ids) {
    const t = TOOLS[id];
    if (!t) continue;
    tools[id] = t;
    if (t.type === "form" && JOURNAL[t.journal]) journal[t.journal] = JOURNAL[t.journal];
    if (t.type === "grid" && EXTRAS.grids[t.belt]) grids[t.belt] = EXTRAS.grids[t.belt];
  }
  return { tools, journal, grids };
}

export const BELT_OF_MODULE: Record<string, string> = {};
for (const t of TRACKS) for (const m of t.modules) if (m.belt) BELT_OF_MODULE[m.id] = m.belt;

/** Which belt or layer's pocket card the top bar offers for a route. */
export function pocketFor(track: TrackId | string, moduleId?: string): string {
  if (track === "presence") return "sanctuary";
  if (track === "communication") {
    const b = moduleId ? BELT_OF_MODULE[moduleId] : undefined;
    return b && EXTRAS.pockets[b] ? b : "white";
  }
  return "white";
}

export function allDayRoutes() {
  const out: { track: string; module: string; day: string }[] = [];
  for (const t of TRACKS) for (const m of t.modules) for (const d of m.days) out.push({ track: t.id, module: m.id, day: d.id });
  return out;
}
