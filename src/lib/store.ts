"use client";
// One saved state for the whole app (dojo_master_state_v1), plus settings and content edits.
// Each belt's data keeps the shape its original manual saved, so old saves import as they are.
import { useSyncExternalStore } from "react";
import type { Dialect } from "./types";
import { getPath, setPath } from "./paths";

export const SETTINGS_KEY = "dojo_settings_v1";
export const MASTER_KEY = "dojo_master_state_v1";
export const OVERRIDES_KEY = "dojo_content_overrides_v1";

export const LEGACY_KEYS = {
  white: ["dojo_white_belt_v4", "comm_dojo_white_belt_v4_3"],
  blue: ["dojo_blue_belt_v4", "dojo_blue_belt_v3"],
  brown: ["dojo_brown_belt_v4", "dojo_brown_belt_v2"],
  brownRungs: ["dojo_brown_rungs_v4", "dojo_brown_rungs_v2"],
  black: ["dojo_black_belt_v4"],
  sanctuary: ["dojo_sanctuary_v4"],
} as const;
export const V2_KEYS = ["ellipsis-v2-loop", "ellipsis-v2-kit", "ellipsis-v2-loop-belt", "ellipsis-v2-practice-tab", "bi-curriculum-completed"];
export const PIT_KEYS = ["bi_workstation_pit_codex_v1", "bi_workstation_pit_postmortems_v1"];

export type Theme = "light" | "dark" | "system";
export interface Settings {
  dialect: Dialect;
  theme: Theme;
  demo: boolean;
  editMode: boolean;
}
export const DEFAULT_SETTINGS: Settings = { dialect: "office_us", theme: "system", demo: false, editMode: false };

export interface MasterState {
  v: 1;
  belts: { white: Record<string, any>; blue: Record<string, any>; brown: Record<string, any>; black: Record<string, any>; sanctuary: Record<string, any> };
  brownRungs: Record<string, string>;
  app: {
    fields: Record<string, string>;      // inline reflection boxes inside cards, by card id + box number
    done: Record<string, boolean>;       // "module/day" marked done
    markers: Record<string, boolean>;    // belt-layer Sanctuary markers noticed
    grid: Record<string, Record<string, string>>; // belt -> stage -> home | fallback | edge
    evidence: Record<string, Record<string, string>[]>; // belt -> rows
    tests: Record<string, boolean>;      // capstone tests passed (belts without their own key)
    timers: Record<string, string>;
  };
  v2: Record<string, string>;            // the v2 site's own saves (Loop, Kit, completed modules), kept as their raw JSON text
  pit: Record<string, string>;
  imported: Record<string, string>;      // source -> ISO time of import
}

export function emptyMaster(): MasterState {
  return {
    v: 1,
    belts: { white: {}, blue: {}, brown: {}, black: {}, sanctuary: {} },
    brownRungs: {},
    app: { fields: {}, done: {}, markers: {}, grid: {}, evidence: {}, tests: {}, timers: {} },
    v2: {},
    pit: {},
    imported: {},
  };
}

export type Overrides = Record<string, { md: string; at: string; title?: string }>;

// ---------------------------------------------------------------- tiny external store
type Listener = () => void;
function makeStore<T>(initial: T) {
  let value = initial;
  const ls = new Set<Listener>();
  return {
    get: () => value,
    set: (v: T) => {
      value = v;
      ls.forEach((l) => l());
    },
    subscribe: (l: Listener) => {
      ls.add(l);
      return () => {
        ls.delete(l);
      };
    },
  };
}

const settingsStore = makeStore<Settings>(DEFAULT_SETTINGS);
const realStore = makeStore<MasterState>(emptyMaster());
const demoStore = makeStore<MasterState>(emptyMaster());
const overridesStore = makeStore<Overrides>({});
const readyStore = makeStore<boolean>(false);

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}

let booted = false;
/** Loads saved data once on the client. Old manual saves found in this browser are imported the first time. */
export function boot() {
  if (booted || typeof window === "undefined") return;
  booted = true;
  settingsStore.set({ ...DEFAULT_SETTINGS, ...(read<Partial<Settings>>(SETTINGS_KEY) || {}) });
  overridesStore.set(read<Overrides>(OVERRIDES_KEY) || {});
  const saved = read<MasterState>(MASTER_KEY);
  if (saved && saved.v === 1) {
    realStore.set(normalize(saved));
  } else {
    const fresh = importFromBrowser(emptyMaster());
    realStore.set(fresh);
    if (Object.keys(fresh.imported).length) write(MASTER_KEY, fresh);
  }
  readyStore.set(true);
}

function normalize(s: MasterState): MasterState {
  const e = emptyMaster();
  return { ...e, ...s, belts: { ...e.belts, ...s.belts }, app: { ...e.app, ...s.app }, v2: { ...s.v2 }, pit: { ...s.pit }, imported: { ...s.imported } };
}

/** Same-origin saves from the original manuals and the v2 site. */
export function importFromBrowser(base: MasterState): MasterState {
  let s = base;
  const now = new Date().toISOString();
  const take = (keys: readonly string[]) => {
    for (const k of keys) {
      const v = read<any>(k);
      if (v && typeof v === "object") return { key: k, v };
    }
    return null;
  };
  for (const b of ["white", "blue", "brown", "black", "sanctuary"] as const) {
    const hit = take(LEGACY_KEYS[b]);
    if (hit) {
      s = { ...s, belts: { ...s.belts, [b]: hit.v }, imported: { ...s.imported, [hit.key]: now } };
    }
  }
  const r = take(LEGACY_KEYS.brownRungs);
  if (r) s = { ...s, brownRungs: r.v, imported: { ...s.imported, [r.key]: now } };
  const v2: Record<string, string> = { ...s.v2 };
  for (const k of V2_KEYS) {
    try {
      const raw = localStorage.getItem(k);
      if (raw != null) v2[k] = raw;
    } catch {
      /* ignore */
    }
  }
  const pit: Record<string, string> = { ...s.pit };
  for (const k of PIT_KEYS) {
    try {
      const raw = localStorage.getItem(k);
      if (raw != null) pit[k] = raw;
    } catch {
      /* ignore */
    }
  }
  return { ...s, v2, pit };
}

// ---------------------------------------------------------------- hooks
export function useReady(): boolean {
  return useSyncExternalStore(readyStore.subscribe, readyStore.get, () => false);
}

export function useSettings(): Settings {
  return useSyncExternalStore(settingsStore.subscribe, settingsStore.get, () => DEFAULT_SETTINGS);
}
export function setSettings(patch: Partial<Settings>) {
  const next = { ...settingsStore.get(), ...patch };
  settingsStore.set(next);
  write(SETTINGS_KEY, next);
}

function activeStore() {
  return settingsStore.get().demo ? demoStore : realStore;
}

/** The saved state the user sees: in Demo Mode a blank one that is never written to storage. */
export function useMaster(): MasterState {
  const demo = useSettings().demo;
  const store = demo ? demoStore : realStore;
  return useSyncExternalStore(store.subscribe, store.get, emptyMaster);
}

export function getMaster(): MasterState {
  return activeStore().get();
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
export function updateMaster(fn: (s: MasterState) => MasterState) {
  const st = activeStore();
  st.set(fn(st.get()));
  if (st === realStore) {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => write(MASTER_KEY, realStore.get()), 250);
  }
}

/** Replaces the real saved state (an import). Never runs against Demo Mode's blank state. */
export function replaceRealMaster(next: MasterState) {
  realStore.set(normalize(next));
  write(MASTER_KEY, realStore.get());
}
export function getRealMaster(): MasterState {
  return realStore.get();
}

export function setAt(path: string, value: any) {
  updateMaster((s) => setPath(s, path, value));
}
export function getAt(s: MasterState, path: string) {
  return getPath(s, path);
}

/** Turning Demo Mode on starts from a blank state each time; turning it off shows the real entries again at once. */
export function setDemo(on: boolean) {
  if (on) demoStore.set(emptyMaster());
  setSettings({ demo: on });
}

// ---------------------------------------------------------------- content edits
export function useOverrides(): Overrides {
  return useSyncExternalStore(overridesStore.subscribe, overridesStore.get, () => ({}));
}
export function saveOverride(cardId: string, md: string, title?: string) {
  const next = { ...overridesStore.get(), [cardId]: { md, at: new Date().toISOString(), title } };
  overridesStore.set(next);
  write(OVERRIDES_KEY, next);
}
export function resetOverride(cardId: string) {
  const next = { ...overridesStore.get() };
  delete next[cardId];
  overridesStore.set(next);
  write(OVERRIDES_KEY, next);
}
export function currentOverrides(): Overrides {
  return overridesStore.get();
}
export function replaceOverrides(next: Overrides) {
  overridesStore.set(next);
  write(OVERRIDES_KEY, next);
}

/** The text a card shows: the user's saved edit if there is one, otherwise the migrated text. */
export function useContentCard(cardId: string, defaultContent: string) {
  const ov = useOverrides()[cardId];
  return {
    content: ov ? ov.md : defaultContent,
    edited: !!ov,
    editedAt: ov?.at,
    save: (md: string, title?: string) => (md === defaultContent ? resetOverride(cardId) : saveOverride(cardId, md, title)),
    reset: () => resetOverride(cardId),
  };
}

/** Sets one entry of an app-level map (keys may contain dots, so no dotted path). */
export function setAppKey<K extends keyof MasterState["app"]>(group: K, key: string, value: MasterState["app"][K][string]) {
  updateMaster((s) => ({ ...s, app: { ...s.app, [group]: { ...(s.app[group] as any), [key]: value } } }));
}
