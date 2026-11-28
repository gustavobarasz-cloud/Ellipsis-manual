// Client-side shape of the server's debriefData() (src/lib/phase2.ts), kept here so client code never imports fs.
export interface NudgeLink { href: string; code: string; title: string }
export interface DebriefData {
  stages: string[];
  zones: string[];
  armors: string[];
  families: string[];
  concerns: string[];
  needs: string[];
  layers: { id: string; title: string; markers: string[] }[];
  evidence: Record<string, string[]>;
  nudge: { stance: NudgeLink[]; boundary: NudgeLink[]; rule9: string; rule9Href?: string };
}
export const CTX = [
  { id: "office", label: "Office Dojo" },
  { id: "personal", label: "Personal Dojo" },
  { id: "presence", label: "Intimacy & Presence" },
] as const;
export const TRIAGE = ["Style", "Blind Spot", "Tactic", "Core Concern", "Need"] as const;
export const normStage = (s?: string) => (s || "").replace(/\s*\[Edge\]\s*$/, "").trim();
export const normTag = (s?: string) => (s || "").trim().replace(/\s+/g, " ").toLowerCase();
export const DAY = 86_400_000;
