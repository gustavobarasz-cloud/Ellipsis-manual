"use client";
// Export and import of everything a person has saved. One file round-trips the whole app;
// the original manuals' own backups and the v2 site's Practice backup import too.
import { BACKUP_FORMAT } from "./practiceStore";
import {
  emptyMaster, getRealMaster, replaceRealMaster, replaceOverrides, currentOverrides, LEGACY_KEYS, V2_KEYS, PIT_KEYS,
  type MasterState, type Overrides,
} from "./store";

export const MASTER_FORMAT = "dojo-master-backup";

export function downloadText(filename: string, text: string, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const stamp = () => new Date().toISOString().slice(0, 10);

/** The v2 site's Loop/Kit and the Pit saves live under their own keys; refresh them into the backup. */
function withRawKeys(m: MasterState): MasterState {
  const v2 = { ...m.v2 };
  const pit = { ...m.pit };
  try {
    for (const k of V2_KEYS) { const r = localStorage.getItem(k); if (r != null) v2[k] = r; }
    for (const k of PIT_KEYS) { const r = localStorage.getItem(k); if (r != null) pit[k] = r; }
  } catch { /* ignore */ }
  return { ...m, v2, pit };
}

export function makeMasterBackup(overrides: Overrides): string {
  return JSON.stringify(
    { format: MASTER_FORMAT, version: 1, savedAt: new Date().toISOString(), state: withRawKeys(getRealMaster()), overrides },
    null,
    2,
  );
}

export function exportMaster(overrides: Overrides) {
  downloadText(`dojo-backup-${stamp()}.json`, makeMasterBackup(overrides));
}

function writeRawKeys(m: MasterState) {
  try {
    for (const [k, v] of Object.entries(m.v2 || {})) if (V2_KEYS.includes(k) && typeof v === "string") localStorage.setItem(k, v);
    for (const [k, v] of Object.entries(m.pit || {})) if (PIT_KEYS.includes(k) && typeof v === "string") localStorage.setItem(k, v);
  } catch { /* ignore */ }
}

type Belt = "white" | "blue" | "brown" | "black" | "sanctuary";

/** Works out which manual a plain saved object came from, by the fields each one saves. */
export function detectBelt(o: Record<string, any>): Belt | null {
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const has = (...ks: string[]) => ks.some((k) => k in o);
  if (has("bk1", "bk2", "bk3", "bk4", "bk5", "bk6")) return "black";
  if (has("br1", "br2", "br3", "br4", "br5", "br6", "_socraticRungs")) return "brown";
  if (has("rungNotes", "b1Cards", "b2Cards", "b3Matrix", "b4Loops", "b5Audits", "b6Log", "w3Hooks")) return "blue";
  if (has("rim") || (has("journal") && Array.isArray(o.journal) && has("markers"))) return "sanctuary";
  if (Object.keys(o).some((k) => /^(w[1-6]_|s1_|cap_|chk_|test\d)/.test(k))) return "white";
  return null;
}

export interface ImportResult { ok: boolean; message: string }

/** Imports any supported backup into the real saved state. Never touches Demo Mode's blank state. */
export function importBackupText(text: string): ImportResult {
  let obj: any;
  try {
    obj = JSON.parse(text);
  } catch {
    return { ok: false, message: "That file isn't JSON. Choose a .json backup." };
  }
  const now = new Date().toISOString();
  const base = getRealMaster();

  // 1. This app's own backup.
  if (obj && obj.format === MASTER_FORMAT && obj.state && obj.state.v === 1) {
    const st = obj.state as MasterState;
    replaceRealMaster({ ...emptyMaster(), ...st, imported: { ...st.imported, [MASTER_FORMAT]: now } });
    writeRawKeys(st);
    if (obj.overrides && typeof obj.overrides === "object") replaceOverrides(obj.overrides);
    return { ok: true, message: "Restored the full backup, including your edits." };
  }

  // 1b. An Export Edits JSON file: adds those card edits to the ones already here.
  if (obj && obj.format === "dojo-content-overrides" && obj.overrides && typeof obj.overrides === "object") {
    replaceOverrides({ ...currentOverrides(), ...obj.overrides });
    return { ok: true, message: `Imported ${Object.keys(obj.overrides).length} card edit(s).` };
  }

  // 2. The v2 site's Practice backup (Loop + Kit).
  if (obj && obj.format === BACKUP_FORMAT && Array.isArray(obj.loops) && obj.kit && typeof obj.kit === "object") {
    const v2 = { ...base.v2, "ellipsis-v2-loop": JSON.stringify(obj.loops), "ellipsis-v2-kit": JSON.stringify(obj.kit) };
    const next = { ...base, v2, imported: { ...base.imported, [BACKUP_FORMAT]: now } };
    replaceRealMaster(next);
    writeRawKeys(next);
    return { ok: true, message: `Imported ${obj.loops.length} Loop entr${obj.loops.length === 1 ? "y" : "ies"} and the Kit from the v2 Practice backup.` };
  }

  // 3. A dump of localStorage keyed by the manuals' own storage keys.
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const allLegacy: [Belt | "brownRungs", readonly string[]][] = Object.entries(LEGACY_KEYS) as any;
    const keyed = Object.keys(obj).some((k) => allLegacy.some(([, ks]) => ks.includes(k)) || V2_KEYS.includes(k) || PIT_KEYS.includes(k));
    if (keyed) {
      let next = { ...base, belts: { ...base.belts }, v2: { ...base.v2 }, pit: { ...base.pit }, imported: { ...base.imported } };
      const parse = (v: any) => (typeof v === "string" ? safeParse(v) : v);
      const got: string[] = [];
      for (const [b, ks] of allLegacy) {
        const k = ks.find((x) => x in obj);
        if (!k) continue;
        const v = parse(obj[k]);
        if (!v || typeof v !== "object") continue;
        if (b === "brownRungs") next.brownRungs = v;
        else next.belts[b] = v;
        next.imported[k] = now;
        got.push(k);
      }
      for (const k of V2_KEYS) if (k in obj) { next.v2[k] = typeof obj[k] === "string" ? obj[k] : JSON.stringify(obj[k]); got.push(k); }
      for (const k of PIT_KEYS) if (k in obj) { next.pit[k] = typeof obj[k] === "string" ? obj[k] : JSON.stringify(obj[k]); got.push(k); }
      replaceRealMaster(next);
      writeRawKeys(next);
      return { ok: true, message: `Imported ${got.length} saved item${got.length === 1 ? "" : "s"}: ${got.join(", ")}.` };
    }

    // 4. One manual's own saved state or backup file.
    const belt = detectBelt(obj);
    if (belt) {
      const next = { ...base, belts: { ...base.belts }, imported: { ...base.imported } };
      if (belt === "brown" && obj._socraticRungs && typeof obj._socraticRungs === "object") {
        const { _socraticRungs, ...rest } = obj;
        next.brownRungs = _socraticRungs;
        next.belts.brown = rest;
      } else {
        next.belts[belt] = obj;
      }
      next.imported[`${belt}-backup`] = now;
      replaceRealMaster(next);
      const name = belt === "sanctuary" ? "Sanctuary" : `${belt[0].toUpperCase()}${belt.slice(1)} Belt`;
      return { ok: true, message: `Imported your ${name} save. Other belts were left as they were.` };
    }
  }
  return { ok: false, message: "I couldn't tell which manual this file came from, so nothing changed." };
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

