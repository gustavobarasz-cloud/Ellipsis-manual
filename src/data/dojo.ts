export type ManualId = "white" | "blue" | "brown" | "black" | "sanctuary";

export interface DojoManual {
  id: ManualId;
  name: string;
  subtitle: string;
  version: string;
  href: string;
  pocketQuestion: string;
  /** Curriculum modules this manual is practised alongside. */
  linkedModules: string[];
  /** Sanctuary layer paired with this belt (belts only). */
  sanctuaryLayer?: string;
  /** Pit stage paired with this belt (belts only). */
  pitStage?: string;
  dot: string;
  ring: string;
}

export const DOJO_MANUALS: DojoManual[] = [
  {
    id: "white",
    name: "White Belt",
    subtitle: "Guard & Regulate · W1–W6",
    version: "v4.4",
    href: "/dojo/white-belt.html",
    pocketQuestion: "Would I accept their no?",
    linkedModules: ["M01", "M02", "M03", "M04"],
    sanctuaryLayer: "L1 · The Inner Sanctuary",
    pitStage: "Stage 1 · Telemetry & Authority",
    dot: "bg-stone-300",
    ring: "ring-stone-400",
  },
  {
    id: "blue",
    name: "Blue Belt",
    subtitle: "Read & Bond · B1–B6",
    version: "v4.4",
    href: "/dojo/blue-belt.html",
    pocketQuestion: "Which conversation are they in?",
    linkedModules: ["M05", "M06", "M07", "M08"],
    sanctuaryLayer: "L2 · The I-Thou Encounter",
    pitStage: "Stage 2 · Profiling & Elicitation",
    dot: "bg-blue-600",
    ring: "ring-blue-600",
  },
  {
    id: "brown",
    name: "Brown Belt",
    subtitle: "Word, Reveal & Steer · Br1–Br6",
    version: "v4.3",
    href: "/dojo/brown-belt.html",
    pocketQuestion: "What reality are my words building?",
    linkedModules: ["M09", "M10"],
    sanctuaryLayer: "L3 · The Poetics of Connection",
    pitStage: "Stage 3 · Covert Syntax",
    dot: "bg-amber-800",
    ring: "ring-amber-800",
  },
  {
    id: "black",
    name: "Black Belt",
    subtitle: "Systems & Bridges · Bk1–Bk6",
    version: "v4.3",
    href: "/dojo/black-belt.html",
    pocketQuestion: "Am I a bridge here, or a code-switcher?",
    linkedModules: ["M11", "M12"],
    sanctuaryLayer: "L4 · The Relational Ecosystem",
    pitStage: "Stage 4 · Compliance Chains & Space",
    dot: "bg-stone-900",
    ring: "ring-stone-900",
  },
  {
    id: "sanctuary",
    name: "The Sanctuary",
    subtitle: "Parallel I-Thou Track · S1–S4",
    version: "v4.4",
    href: "/dojo/sanctuary.html",
    pocketQuestion: "Am I here, and are they?",
    linkedModules: [],
    dot: "bg-emerald-700",
    ring: "ring-emerald-700",
  },
];

export const BELTS = DOJO_MANUALS.filter((m) => m.id !== "sanctuary");

export function beltForModule(moduleId: string): DojoManual | undefined {
  return BELTS.find((b) => b.linkedModules.includes(moduleId));
}
