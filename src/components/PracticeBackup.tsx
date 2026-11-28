"use client";

import React, { useRef, useState } from "react";
import {
  KIT_KEY,
  LOOP_KEY,
  downloadText,
  makeBackup,
  readBackup,
  today,
  EMPTY_KIT,
  type KitData,
  type LoopEntry,
} from "@/lib/practiceStore";

/** Backup and restore for the Loop and the Kit together, as one JSON file. */
export default function PracticeBackup({ onRestored }: { onRestored: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string>("");

  const save = () => {
    let loops: LoopEntry[] = [];
    let kit: KitData = EMPTY_KIT;
    try {
      loops = JSON.parse(localStorage.getItem(LOOP_KEY) || "[]");
      kit = { ...EMPTY_KIT, ...JSON.parse(localStorage.getItem(KIT_KEY) || "{}") };
    } catch {
      /* fall back to empty */
    }
    downloadText(`ellipsis-practice-${today()}.json`, makeBackup(loops, kit));
    setMsg("Backup downloaded.");
  };

  const restore = async (file: File) => {
    const parsed = readBackup(await file.text());
    if (!parsed) {
      setMsg("That file isn't a Loop and Kit backup from this site.");
      return;
    }
    if (!window.confirm("Replace the Loop and Kit in this browser with this backup?")) return;
    try {
      localStorage.setItem(LOOP_KEY, JSON.stringify(parsed.loops));
      localStorage.setItem(KIT_KEY, JSON.stringify(parsed.kit));
      setMsg(`Restored ${parsed.loops.length} Loop entries and your Kit.`);
      onRestored();
    } catch {
      setMsg("This browser wouldn't save the backup.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        onClick={save}
        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 font-medium text-stone-700 hover:border-stone-900"
      >
        Back up Loop and Kit
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 font-medium text-stone-700 hover:border-stone-900"
      >
        Restore
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void restore(f);
        }}
      />
      {msg && <span className="text-stone-500">{msg}</span>}
    </div>
  );
}
