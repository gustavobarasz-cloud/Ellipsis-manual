"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import practice from "@/data/practice.json";

/* ------------------------------------------------------------------
   Data from the Communication Dojo curriculum (the Loop and the Kit).
   Everything here runs in the browser alone and saves to localStorage.
   ------------------------------------------------------------------ */

export type BeltId = "white" | "blue" | "brown" | "black";
export const BELT_ORDER: BeltId[] = ["white", "blue", "brown", "black"];

export interface LoopField {
  k: string;
  label: string;
  kind: string;
  belt?: string;
  options?: Array<string | { t: string; belt?: string }>;
}
export interface LoopStep {
  k: "prepare" | "read" | "respond" | "debrief";
  n: string;
  when: string;
  fields: LoopField[];
}
export interface ToolField {
  k: string;
  label: string;
  hint?: string;
  kind?: string;
  red?: boolean;
}
export interface KitTool {
  id: string;
  name: string;
  started: string;
  grows: string;
  holds: string;
  single?: boolean;
  special?: "evidence" | "marks" | "journal";
  fields?: ToolField[];
}

export const LOOP = practice.loop as unknown as {
  intro: string;
  steps: LoopStep[];
  beltAdds: { head: string[]; rows: string[][] };
};
export const KIT_TOOLS = practice.tools as unknown as KitTool[];
export const TOOLS_NOTE: string = practice.toolsNote;
export const FALLBACK_STAGES: string[] = practice.fallbackStages;
export const CODEX_TACTICS: string[] = practice.codexTactics;
export const GRID_COLS = practice.gridCols as Array<{ k: string; n: string; q: string }>;
export const GRID_STAGES: string[] = practice.gridStages;
export const JOURNAL_FIELDS = practice.journalFields as Array<{ k: string; label: string }>;
export const SANCTUARY_LAYERS = practice.sanctuaryLayers as Array<{ n: number; name: string }>;
export const BELT_EVIDENCE = practice.belts as Array<{
  id: BeltId;
  name: string;
  evidenceCols: string[];
}>;

/** A field shows when it has no belt, or its belt is at or below the chosen belt. */
export function shownAtBelt(belt: string | undefined, upTo: BeltId): boolean {
  if (!belt) return true;
  const i = BELT_ORDER.indexOf(belt as BeltId);
  return i === -1 || i <= BELT_ORDER.indexOf(upTo);
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/* ------------------------------ storage ------------------------------ */

export const LOOP_KEY = "ellipsis-v2-loop";
export const KIT_KEY = "ellipsis-v2-kit";
export const LOOP_BELT_KEY = "ellipsis-v2-loop-belt";

/**
 * State kept in localStorage. It loads after the first render so the page
 * renders the same on the server and in the browser.
 */
export function useStored<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const initialRef = useRef(initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
      else setValue(initialRef.current);
    } catch {
      /* unreadable or blocked storage: keep the default */
    }
    setLoaded(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(v));
        } catch {
          /* storage full or blocked: the change still shows on screen */
        }
        return v;
      });
    },
    [key],
  );

  return [value, update, loaded];
}

/* ------------------------------ shapes ------------------------------ */

export interface LoopEntry {
  id: string;
  title: string;
  date: string;
  dojo: "office" | "personal";
  prepare: Record<string, string | boolean>;
  read: Record<string, string>;
  respond: Record<string, string>;
  debrief: Record<string, string>;
}

export type ToolEntry = { id: string; date: string } & Record<string, string>;

export interface KitData {
  entries: Record<string, ToolEntry[]>;
  singles: Record<string, Record<string, string>>;
  marks: Record<string, { home?: number; fallback?: number; edge?: number }>;
  evidence: Record<string, Array<{ id: string; date: string; cols: Record<string, number> }>>;
}

export const EMPTY_KIT: KitData = { entries: {}, singles: {}, marks: {}, evidence: {} };

export function emptyLoop(): LoopEntry {
  return {
    id: newId(),
    title: "",
    date: today(),
    dojo: "office",
    prepare: {},
    read: {},
    respond: {},
    debrief: {},
  };
}

/* --------------------------- backup / restore --------------------------- */

export const BACKUP_FORMAT = "ellipsis-v2-practice";

export function makeBackup(loops: LoopEntry[], kit: KitData): string {
  return JSON.stringify(
    { format: BACKUP_FORMAT, version: 1, savedAt: new Date().toISOString(), loops, kit },
    null,
    2,
  );
}

export function readBackup(text: string): { loops: LoopEntry[]; kit: KitData } | null {
  try {
    const obj = JSON.parse(text);
    if (!obj || obj.format !== BACKUP_FORMAT || !Array.isArray(obj.loops) || typeof obj.kit !== "object") {
      return null;
    }
    const kit: KitData = {
      entries: obj.kit.entries && typeof obj.kit.entries === "object" ? obj.kit.entries : {},
      singles: obj.kit.singles && typeof obj.kit.singles === "object" ? obj.kit.singles : {},
      marks: obj.kit.marks && typeof obj.kit.marks === "object" ? obj.kit.marks : {},
      evidence: obj.kit.evidence && typeof obj.kit.evidence === "object" ? obj.kit.evidence : {},
    };
    return { loops: obj.loops as LoopEntry[], kit };
  } catch {
    return null;
  }
}

export function downloadText(filename: string, text: string, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
