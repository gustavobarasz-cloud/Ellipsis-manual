// Content schema produced by scripts/content/build.py (src/content/*.json).

export type CardKind = "core" | "action" | "deeper" | "check" | "info";

export interface Card {
  id: string;
  kind: CardKind;
  label: string;
  title: string;
  md: string;
  tools?: string[];
}

export interface Day {
  id: string;
  label: string;
  title: string;
  author?: string | null;
  lab?: boolean;
  cards: Card[];
}

export interface DaySummary {
  id: string;
  label: string;
  title: string;
  lab?: boolean;
  cards: number;
}

export type ModuleKind = "overview" | "week" | "sanctuary" | "capstone" | "module" | "layer" | "cautions";

export interface ModuleMeta {
  id: string;
  belt?: string;
  kind: ModuleKind;
  title: string;
  subtitle?: string;
  kicker?: string;
  guardrail?: string;
  golden?: string;
  goldenLabel?: string;
  assembly?: string;
  gate?: string;
  intro?: string;
  handoffTo?: string;
  tier?: number;
  tierTitle?: string;
  tierSubtitle?: string;
  codexIds?: string[];
}

export interface Module extends ModuleMeta {
  days: Day[];
}

export interface ModuleSummary extends ModuleMeta {
  days: DaySummary[];
}

export type TrackId = "profiling" | "communication" | "presence";

export interface TrackSummary {
  id: TrackId;
  door: number;
  title: string;
  subtitle: string;
  modules: ModuleSummary[];
}

export type Dialect = "office_us" | "personal_us" | "rioplatense" | "espana";

export const DIALECTS: { id: Dialect; label: string; short: string }[] = [
  { id: "office_us", label: "Office (US)", short: "Office" },
  { id: "personal_us", label: "Personal (US)", short: "Personal" },
  { id: "rioplatense", label: "Rioplatense", short: "Rio" },
  { id: "espana", label: "España", short: "España" },
];

export type BeltId = "white" | "blue" | "brown" | "black";
export type StoreId = BeltId | "sanctuary";

// ---- tools
export interface ToolBase { type: string; title?: string; help?: string }
export type ToolSpec = ToolBase & Record<string, any>;
export type ToolMap = Record<string, ToolSpec>;

// ---- journal
export interface JField {
  k: string;
  label: string;
  placeholder?: string;
  multi?: boolean;
  readonly?: boolean;
  options?: string[];
  check?: boolean;
}

export interface JSection {
  title?: string;
  repeat?: string;
  count?: number;
  growable?: boolean;
  max?: number;
  itemTitle?: string;
  itemTitles?: string[];
  itemPlaceholders?: Record<string, string>[];
  fields: JField[];
}

export interface JournalSpec {
  id: string;
  belt: StoreId;
  module: string;
  title: string;
  store: StoreId;
  help?: string;
  path?: string;          // object at this path in the belt's state holds the fields
  list?: string;          // array at this path in the belt's state; each entry holds the fields
  fields?: JField[];
  sections?: JSection[];
  tests?: { k: string; name: string; setting: string; pass: string }[];
  sanctuary?: boolean;
  starterCodex?: Record<string, string>[];
}
export type JournalMap = Record<string, JournalSpec>;

export interface PocketCard {
  belt: string;
  cues: { cue: string; sub: string }[];
  back: string;
  backSub?: string;
  intro?: string;
}
