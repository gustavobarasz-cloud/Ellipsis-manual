// Phase 2 server helpers: cross-door links, the Lens Flipper, Theme Threads, the search index and the card map.
// Every quote comes from src/content/phase2/*.json, which holds the manuals' own sentences word for word.
import fs from "fs";
import path from "path";
import lensJson from "@/content/phase2/lens.json";
import linksJson from "@/content/phase2/crosslinks.json";
import themesJson from "@/content/phase2/themes.json";
import treesJson from "@/content/phase2/trees.json";
import resetJson from "@/content/phase2/reset.json";
import { EXTRAS, TOOLS, TRACKS } from "./content";
import { moduleShort } from "./nav";
import type { Module } from "./types";

export type DoorId = "profiling" | "communication" | "presence";
export const DOOR_NAME: Record<DoorId, string> = { profiling: "Profiling", communication: "Mastery", presence: "Presence" };

interface Member { track: string; module: string; day: string; scope: "module" | "day" }
interface Basis { card: string; quote: string }
interface Bridge { id: string; label: string; by: "Gus" | "text"; members: Member[]; basis: Basis[] }
interface LensConcept { id: string; label: string; stances: Partial<Record<DoorId, Basis>> }
interface Theme { id: string; label: string; days: string[] }

export const BRIDGES = linksJson as unknown as Bridge[];
export const LENSES = lensJson as unknown as LensConcept[];
export const THEMES = themesJson as unknown as Theme[];
export const TREES = treesJson as any;
export const RESET = resetJson as any;

// ---------------------------------------------------------------- module cache
const cache = new Map<string, Module>();
function mod(track: string, id: string): Module | undefined {
  const k = `${track}/${id}`;
  if (cache.has(k)) return cache.get(k);
  const file = path.join(process.cwd(), "src", "content", "modules", track, `${id}.json`);
  if (!fs.existsSync(file)) return undefined;
  const m = JSON.parse(fs.readFileSync(file, "utf8")) as Module;
  cache.set(k, m);
  return m;
}

interface CardInfo { id: string; track: string; module: string; day: string; n: number; title: string; label: string; dayLabel: string; dayTitle: string; author?: string | null; short: string; belt?: string; md: string }
let CARDS: Map<string, CardInfo> | null = null;
function cards(): Map<string, CardInfo> {
  if (CARDS) return CARDS;
  CARDS = new Map();
  for (const t of TRACKS)
    for (const ms of t.modules) {
      const m = mod(t.id, ms.id);
      if (!m) continue;
      for (const d of m.days)
        d.cards.forEach((c, i) =>
          CARDS!.set(c.id, {
            id: c.id, track: t.id, module: m.id, day: d.id, n: i + 1, title: c.title, label: c.label,
            dayLabel: d.label, dayTitle: d.title, author: d.author, short: moduleShort(m), belt: m.belt, md: c.md,
          }),
        );
    }
  return CARDS;
}

export const dayHref = (track: string, module: string, day: string, n = 1) => `/${track}/${module}/${day}${n > 1 ? `#${n}` : ""}`;
export function cardHref(cardId: string): string | undefined {
  const c = cards().get(cardId);
  return c ? dayHref(c.track, c.module, c.day, c.n) : undefined;
}

/** The colour key a link to this place carries: a belt for Mastery, the door otherwise. */
function colourOf(track: string, moduleId: string): string {
  if (track === "communication") return mod(track, moduleId)?.belt || "white";
  return track;
}

function dayTitle(track: string, moduleId: string, dayId: string) {
  const m = mod(track, moduleId);
  const d = m?.days.find((x) => x.id === dayId);
  return { m, d };
}

// ---------------------------------------------------------------- cross-door pills
export interface Pill { href: string; code: string; title: string; colour: string; door: DoorId }
export interface PillGroup { id: string; label: string; pills: Pill[] }

function memberMatches(mb: Member, track: string, moduleId: string, dayId: string) {
  if (mb.track !== track || mb.module !== moduleId) return false;
  return mb.scope === "module" || mb.day === dayId;
}

function memberPill(b: Bridge, mb: Member): Pill {
  const { m, d } = dayTitle(mb.track, mb.module, mb.day);
  // Open the member's day at the card the link rests on, when that card is on it.
  const hit = b.basis.map((x) => cards().get(x.card)).find((c) => c && c.track === mb.track && c.module === mb.module && c.day === mb.day);
  const n = hit ? hit.n : 1;
  const short = m ? moduleShort(m) : mb.module;
  const code = mb.scope === "day" && d ? d.label : short;
  const title = mb.scope === "day" && d ? d.title : m?.title || "";
  return { href: dayHref(mb.track, mb.module, mb.day, n), code, title, colour: colourOf(mb.track, mb.module), door: mb.track as DoorId };
}

export function pillsFor(track: string, moduleId: string, dayId: string): PillGroup[] {
  const out: PillGroup[] = [];
  for (const b of BRIDGES) {
    if (!b.members.some((mb) => memberMatches(mb, track, moduleId, dayId))) continue;
    const pills = b.members.filter((mb) => !memberMatches(mb, track, moduleId, dayId)).map((mb) => memberPill(b, mb));
    if (pills.length) out.push({ id: b.id, label: b.label, pills });
  }
  return out;
}

// ---------------------------------------------------------------- Lens Flipper
export interface LensStance { door: DoorId; card?: string; quote?: string; href?: string; where?: string }
export interface LensView { id: string; label: string; stances: LensStance[] }

export function lensesFor(cardId: string): LensView[] {
  const out: LensView[] = [];
  for (const L of LENSES) {
    const doors: DoorId[] = ["profiling", "communication", "presence"];
    if (!doors.some((d) => L.stances[d]?.card === cardId)) continue;
    out.push({
      id: L.id,
      label: L.label,
      stances: doors.map((door) => {
        const s = L.stances[door];
        const c = s ? cards().get(s.card) : undefined;
        // A stance with no source text stays an empty slot the person can fill with Edit (key lens.<concept>.<door>).
        return s && c ? { door, card: s.card, quote: s.quote, href: dayHref(c.track, c.module, c.day, c.n), where: `${c.short} · ${c.dayLabel}` } : { door };
      }),
    });
  }
  return out;
}

export function emptyLensSlots(): string[] {
  const out: string[] = [];
  for (const L of LENSES) for (const d of ["profiling", "communication", "presence"] as DoorId[]) if (!L.stances[d]) out.push(`lens.${L.id}.${d}`);
  return out;
}

// ---------------------------------------------------------------- Theme Threads
export interface ThreadStop { href: string; code: string; title: string; colour: string; door: DoorId }
export interface ThreadView { id: string; label: string; stops: ThreadStop[] }

export function threadViews(): ThreadView[] {
  return THEMES.map((t) => ({
    id: t.id,
    label: t.label,
    stops: t.days.map((ref) => {
      const [track, moduleId, dayId] = ref.split("/");
      const { m, d } = dayTitle(track, moduleId, dayId);
      return { href: dayHref(track, moduleId, dayId), code: `${m ? moduleShort(m) : moduleId} · ${d?.label || dayId}`, title: d?.title || "", colour: colourOf(track, moduleId), door: track as DoorId };
    }),
  }));
}

export interface DayThread { id: string; label: string; index: number; total: number; prev?: string; next?: string }
export function threadsFor(track: string, moduleId: string, dayId: string): DayThread[] {
  const ref = `${track}/${moduleId}/${dayId}`;
  const out: DayThread[] = [];
  for (const t of THEMES) {
    const i = t.days.indexOf(ref);
    if (i < 0) continue;
    const href = (r?: string) => (r ? dayHref(...(r.split("/") as [string, string, string])) : undefined);
    out.push({ id: t.id, label: t.label, index: i + 1, total: t.days.length, prev: href(t.days[i - 1]), next: href(t.days[i + 1]) });
  }
  return out;
}

// ---------------------------------------------------------------- search index + card map
function plain(md: string): string {
  return md
    .replace(/^:::.*$/gm, " ")
    .replace(/^@\w+\s*/gm, "")
    .replace(/[|#>*_`~]/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
function bolds(md: string): string {
  return Array.from(md.matchAll(/\*\*(.+?)\*\*/g)).map((m) => m[1].replace(/[*_`]/g, "")).join(" · ");
}

export interface SearchDoc { id: string; h: string; d: DoorId; t: string; w: string; a: string; b: string; x: string; c: string }

export function searchIndex(): SearchDoc[] {
  return Array.from(cards().values()).map((c) => ({
    id: c.id,
    h: dayHref(c.track, c.module, c.day, c.n),
    d: c.track as DoorId,
    t: c.title,
    w: `${c.short} · ${c.dayLabel}`,
    a: c.author || "",
    b: bolds(c.md),
    x: plain(c.md),
    c: c.track === "communication" ? c.belt || "white" : c.track,
  }));
}

/** cardId → [href, title, where]: the Share Card links (?card=) and pins resolve through this. */
export function cardMap(): Record<string, [string, string, string]> {
  const out: Record<string, [string, string, string]> = {};
  for (const c of Array.from(cards().values())) out[c.id] = [dayHref(c.track, c.module, c.day, c.n), c.title, `${c.short} · ${c.dayLabel}`];
  return out;
}

// ---------------------------------------------------------------- Pillar 2–3 data for pages
export const PITCH_TOOLS: Record<string, { card: string; tool: string }> = {
  // Live pitch check: the W6 FM DJ voice and the Br4 45-second four-part pitch.
  "w6.lab.tool1": { card: "w6.tue.deeper", tool: "pitch.white.w6" },
  "br4.thu.main": { card: "br4.mon.action", tool: "pitch.brown.br4" },
};

function sentence(cardId: string, start: string, end: string): string {
  const md = cards().get(cardId)?.md || "";
  const i = md.indexOf(start);
  const j = i >= 0 ? md.indexOf(end, i) : -1;
  return i >= 0 && j >= 0 ? md.slice(i, j + end.length) : "";
}

export function pitchSpecs() {
  return {
    "pitch.white.w6": {
      type: "pitch",
      title: "Pitch check · Late-Night FM DJ Voice",
      prompt: sentence("w6.tue.deeper", "Voss's **Late-Night FM DJ Voice**", "into silence."),
      source: cardHref("w6.tue.deeper"),
      seconds: 0,
    },
    "pitch.brown.br4": {
      type: "pitch",
      title: "Pitch check · 45-Second Four-Part Pitch",
      prompt: sentence("br4.mon.action", "**The 45-Second Compression Rule:**", "per part)."),
      source: cardHref("br4.mon.action"),
      seconds: 45,
    },
  } as Record<string, any>;
}

/** The Sanctuary markers, by layer, for the Quick Debrief's Layer + Marker step. */
export function sanctuaryLayers(): { id: string; title: string; markers: string[] }[] {
  const t = TRACKS.find((x) => x.id === "presence")!;
  const out: { id: string; title: string; markers: string[] }[] = [];
  for (const ms of t.modules) {
    if (ms.kind !== "layer") continue;
    const m = mod(t.id, ms.id)!;
    const markers: string[] = [];
    for (const d of m.days) for (const c of d.cards) for (const id of c.tools || []) if (TOOLS[id]?.type === "marker" && TOOLS[id].text) markers.push(TOOLS[id].text);
    out.push({ id: ms.id, title: m.title, markers });
  }
  return out;
}

export function nudgeLinks() {
  const day = (track: string, m: string, d: string) => {
    const x = dayTitle(track, m, d);
    return { href: dayHref(track, m, d), code: x.d?.label || d, title: x.d?.title || x.m?.title || "" };
  };
  return {
    stance: [day("presence", "s2", "s2-1"), day("presence", "s3", "s3-4")],
    boundary: [
      { href: dayHref("communication", "w5", "mon"), code: "W5", title: mod("communication", "w5")?.title || "" },
      { href: dayHref("communication", "w6", "mon"), code: "W6", title: mod("communication", "w6")?.title || "" },
    ],
    rule9: sentence("w6.mon.core", "And remember Safety Rule #9:", "everyday dojo scripts."),
    rule9Href: cardHref("w6.mon.core"),
  };
}

/** Everything the Quick Debrief, nudges, People timeline and heatmap need, all taken from the manuals' own lists. */
export function debriefData() {
  const grids = EXTRAS.grids;
  const stages = grids.white.stages.map((s) => s.n.replace(/\s*\[Edge\]\s*$/, ""));
  const zones = Array.from(new Set<string>((TOOLS["bodymap.white"]?.zones as string[]) || []));
  const evidence: Record<string, string[]> = {};
  for (const b of ["white", "blue", "brown", "black"]) {
    const cols: string[] = TOOLS[`evidence.${b}`]?.cols || [];
    evidence[b] = /date|episode/i.test(cols[0] || "") ? cols.slice(1) : cols;
  }
  return {
    stages,
    zones,
    armors: ["Expert", "Achiever", "Diplomat", "Observer"], // s1.s1-2.core: the action-logics that "operate as relational armor"
    families: ["Reality Distortion", "Attention & Blame", "Moral & Emotional Hooks", "Direct & Sweetened Leverage"], // w4.wed.core
    concerns: ["Appreciation", "Affiliation", "Autonomy", "Status", "Role"], // b3.mon.core (Fisher & Shapiro)
    needs: ["Significance", "Approval", "Acceptance", "Intelligence", "Pity", "Strength / Power"], // b3.wed.deeper (Hughes)
    layers: sanctuaryLayers(),
    evidence,
    nudge: nudgeLinks(),
  };
}
export type DebriefData = ReturnType<typeof debriefData>;

/** Links back to every card a practice tree quotes. */
export function treeHrefs(): Record<string, string | undefined> {
  const ids = new Set<string>();
  for (const n of Object.values(TREES.triage.nodes as Record<string, any>)) {
    ids.add(n.card);
    if (n.lead?.card) ids.add(n.lead.card);
  }
  for (const c of [TREES.ask.card, TREES.ask.faces?.card, TREES.ask.surviving?.card]) if (c) ids.add(c);
  const out: Record<string, string | undefined> = {};
  Array.from(ids).forEach((id) => (out[id] = cardHref(id)));
  return out;
}
export const TREE_PAGES = [
  { id: "triage-tree", title: "White Triage Tree", where: "W4 → W6", sub: "Style, Blind Spot or Tactic, then the move" },
  { id: "ask-tree", title: "Brown Ask Tree", where: "Br1", sub: "Weigh D, P and R, then wrap the ask" },
];
