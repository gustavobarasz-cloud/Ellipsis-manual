"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DIALECTS } from "@/lib/types";
import { setDemo, setSettings, useOverrides, useSettings, type Theme } from "@/lib/store";
import { exportMaster, importBackupText } from "@/lib/backup";
import { exportEditsJson, exportEditsMarkdown } from "@/lib/editsExport";
import { IconClose } from "./icons";

function Switch({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <div className="switch-row">
      <span>
        <span className="font-semibold">{label}</span>
        {hint && <small>{hint}</small>}
      </span>
      <button type="button" role="switch" aria-checked={on} aria-label={label} className="switch" onClick={() => onChange(!on)} />
    </div>
  );
}

export default function Drawer({ onClose }: { onClose: () => void }) {
  const s = useSettings();
  const overrides = useOverrides();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const edits = Object.keys(overrides).length;

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const text = await f.text();
    const r = importBackupText(text);
    setMsg({ ok: r.ok, text: r.message + (r.ok && s.demo ? " Demo Mode is on, so turn it off to see them." : "") });
    if (file.current) file.current.value = "";
  };

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Settings and backup">
        <div className="flex items-center justify-between">
          <h2>Settings</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        <section>
          <p className="k">Dialect for scripts</p>
          <div className="seg cols-2">
            {DIALECTS.map((d) => (
              <button key={d.id} type="button" aria-pressed={s.dialect === d.id} onClick={() => setSettings({ dialect: d.id })}>
                {d.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="k">Theme</p>
          <div className="seg cols-3">
            {(["light", "dark", "system"] as Theme[]).map((t) => (
              <button key={t} type="button" aria-pressed={s.theme === t} onClick={() => setSettings({ theme: t })}>
                {t === "system" ? "Auto" : t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-2">
          <Switch on={s.demo} onChange={setDemo} label="Demo Mode" hint="Hides every entry so you can show the app. Nothing you type in Demo is saved." />
          <Switch on={s.editMode} onChange={(v) => setSettings({ editMode: v })} label="Edit Mode" hint="Opens the card you are reading for editing. Save or Cancel turns it off." />
        </section>

        <section className="grid gap-2">
          <p className="k">Your edits ({edits})</p>
          <div className="btn-row">
            <button type="button" className="btn sm" disabled={!edits} onClick={() => exportEditsMarkdown(overrides)}>Export as Markdown</button>
            <button type="button" className="btn sm" disabled={!edits} onClick={() => exportEditsJson(overrides)}>Export as JSON</button>
          </div>
        </section>

        <section className="grid gap-2">
          <p className="k">Backup</p>
          <p className="text-sm muted">One file holds every journal, check, rung answer, grid mark and edit. Import also takes the original manuals&apos; backups and the v2 Practice backup.</p>
          <div className="btn-row">
            <button type="button" className="btn sm" onClick={() => exportMaster(overrides)}>Export JSON</button>
            <button type="button" className="btn sm" onClick={() => file.current?.click()}>Import JSON</button>
            <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          </div>
          {msg && <p className="text-sm" role="status" style={{ color: msg.ok ? "var(--ink)" : "var(--action-red)" }}>{msg.text}</p>}
        </section>

        <section className="grid gap-1 text-sm">
          <p className="k">More</p>
          <Link href="/field-card/white" className="row-link">Printable belt field cards</Link>
          <Link href="/classic" className="row-link">Classic v2 view</Link>
        </section>
      </aside>
    </>
  );
}
