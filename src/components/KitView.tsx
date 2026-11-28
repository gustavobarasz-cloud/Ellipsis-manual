"use client";

import React, { useState } from "react";
import {
  BELT_EVIDENCE,
  CODEX_TACTICS,
  EMPTY_KIT,
  FALLBACK_STAGES,
  GRID_COLS,
  GRID_STAGES,
  JOURNAL_FIELDS,
  KIT_KEY,
  KIT_TOOLS,
  SANCTUARY_LAYERS,
  TOOLS_NOTE,
  newId,
  today,
  useStored,
  type KitData,
  type KitTool,
  type ToolEntry,
  type ToolField,
} from "@/lib/practiceStore";
import practice from "@/data/practice.json";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-800";

const JOURNAL_TOOL_FIELDS: ToolField[] = [
  { k: "layer", label: "Layer", kind: "layer" },
  ...JOURNAL_FIELDS.map((f) => ({ k: f.k, label: f.label })),
];

function fieldsFor(tool: KitTool): ToolField[] {
  if (tool.special === "journal") return JOURNAL_TOOL_FIELDS;
  return tool.fields ?? [];
}

function countFor(tool: KitTool, kit: KitData): number {
  if (tool.special === "evidence") {
    return Object.values(kit.evidence).reduce((n, rows) => n + rows.length, 0);
  }
  if (tool.special === "marks") return Object.keys(kit.marks).length;
  if (tool.single) {
    return Object.values(kit.singles[tool.id] ?? {}).some((v) => String(v).trim()) ? 1 : 0;
  }
  return (kit.entries[tool.id] ?? []).length;
}

function FieldInput({
  f,
  value,
  onChange,
  idBase,
}: {
  f: ToolField;
  value: string;
  onChange: (v: string) => void;
  idBase: string;
}) {
  const label = (
    <span className={`mb-1 block text-sm font-medium ${f.red ? "text-red-800" : "text-stone-800"}`}>
      {f.label}
      {f.hint ? <span className="ml-2 text-xs font-normal text-stone-500">{f.hint}</span> : null}
    </span>
  );

  if (f.kind === "stage") {
    return (
      <label className="block">
        {label}
        <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose a stage</option>
          {FALLBACK_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (f.kind === "layer") {
    return (
      <label className="block">
        {label}
        <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose a layer</option>
          {SANCTUARY_LAYERS.map((l) => (
            <option key={l.n} value={String(l.n)}>
              Layer {l.n} · {l.name}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (f.k === "tactic") {
    const listId = `${idBase}-tactics`;
    return (
      <label className="block">
        {label}
        <input
          className={inputCls}
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <datalist id={listId}>
          {CODEX_TACTICS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </label>
    );
  }
  return (
    <label className="block">
      {label}
      <textarea rows={2} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

const CODEX = practice.codex as Array<{ id: string; name: string; sounds: string; response: string }>;

function CodexGallery({ onPick }: { onPick: (name: string) => void }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-xs text-stone-600">
        The fifteen tactics. Tap one to start a codex entry for it.
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {CODEX.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onPick(t.name)}
              className="block h-full w-full rounded-xl border border-stone-200 bg-white text-left shadow-sm transition hover:border-stone-500"
            >
              <span className="block px-2.5 py-2">
                <span className="block text-[13px] font-semibold leading-snug text-stone-900">{t.name}</span>
                <span className="block text-[11px] leading-snug text-stone-600">{t.sounds}</span>
                <span className="mt-1 block text-[11px] leading-snug text-red-900">{t.response}</span>
              </span>
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => onPick("")}
            className="block h-full w-full rounded-xl border border-stone-200 bg-white text-left shadow-sm transition hover:border-stone-500"
          >
            <span className="block px-2.5 py-2">
              <span className="block text-[13px] font-semibold leading-snug text-stone-900">Name a new one</span>
              <span className="block text-[11px] leading-snug text-stone-600">A tactic that isn't on the list</span>
            </span>
          </button>
        </li>
      </ul>
    </div>
  );
}

function EntriesTool({
  tool,
  kit,
  setKit,
}: {
  tool: KitTool;
  kit: KitData;
  setKit: (fn: (k: KitData) => KitData) => void;
}) {
  const entries = kit.entries[tool.id] ?? [];
  const fields = fieldsFor(tool);

  const setEntries = (fn: (list: ToolEntry[]) => ToolEntry[]) =>
    setKit((k) => ({ ...k, entries: { ...k.entries, [tool.id]: fn(k.entries[tool.id] ?? []) } }));

  const add = (preset?: Record<string, string>) =>
    setEntries((list) => [{ id: newId(), date: today(), ...(preset ?? {}) } as ToolEntry, ...list]);
  const update = (id: string, key: string, v: string) =>
    setEntries((list) => list.map((e) => (e.id === id ? ({ ...e, [key]: v } as ToolEntry) : e)));
  const remove = (id: string) => {
    if (!window.confirm("Delete this entry? This can't be undone.")) return;
    setEntries((list) => list.filter((e) => e.id !== id));
  };

  return (
    <div>
      {tool.id === "codex" && <CodexGallery onPick={(name) => add(name ? { tactic: name } : undefined)} />}
      <button
        type="button"
        onClick={() => add()}
        className="mb-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 shadow-sm hover:bg-stone-800"
      >
        Add an entry
      </button>
      {entries.length === 0 && (
        <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500">
          Nothing here yet.
        </p>
      )}
      <ul className="space-y-3">
        {entries.map((e) => (
          <li key={e.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <input
                type="date"
                className="rounded-md border border-stone-300 px-2 py-1 text-xs text-stone-700"
                value={e.date}
                onChange={(ev) => update(e.id, "date", ev.target.value)}
              />
              <button
                type="button"
                onClick={() => remove(e.id)}
                className="ml-auto rounded-md px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((f) => (
                <FieldInput
                  key={f.k}
                  f={f}
                  idBase={`${tool.id}-${e.id}`}
                  value={e[f.k] ?? ""}
                  onChange={(v) => update(e.id, f.k, v)}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SingleTool({
  tool,
  kit,
  setKit,
}: {
  tool: KitTool;
  kit: KitData;
  setKit: (fn: (k: KitData) => KitData) => void;
}) {
  const data = kit.singles[tool.id] ?? {};
  const update = (key: string, v: string) =>
    setKit((k) => ({ ...k, singles: { ...k.singles, [tool.id]: { ...(k.singles[tool.id] ?? {}), [key]: v } } }));
  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      {fieldsFor(tool).map((f) => (
        <FieldInput key={f.k} f={f} idBase={tool.id} value={data[f.k] ?? ""} onChange={(v) => update(f.k, v)} />
      ))}
    </div>
  );
}

function EvidenceTool({ kit, setKit }: { kit: KitData; setKit: (fn: (k: KitData) => KitData) => void }) {
  const [beltId, setBeltId] = useState(BELT_EVIDENCE[0].id);
  const belt = BELT_EVIDENCE.find((b) => b.id === beltId) ?? BELT_EVIDENCE[0];
  const rows = kit.evidence[belt.id] ?? [];

  const setRows = (fn: (r: typeof rows) => typeof rows) =>
    setKit((k) => ({ ...k, evidence: { ...k.evidence, [belt.id]: fn(k.evidence[belt.id] ?? []) } }));

  const totals = belt.evidenceCols.map((c) => rows.reduce((n, r) => n + (Number(r.cols[c]) || 0), 0));

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {BELT_EVIDENCE.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-pressed={b.id === belt.id}
            onClick={() => setBeltId(b.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              b.id === belt.id
                ? "border-stone-900 bg-stone-900 text-stone-50"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>
      <p className="mb-1 font-serif text-lg font-semibold text-stone-900">{belt.name} evidence</p>
      <p className="mb-3 text-xs text-stone-500">
        One row per week, or per review. Write the raw counts; the totals show direction of travel.
      </p>
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="bg-[#F5F2EC]">
            <tr>
              <th className="px-2 py-2 font-semibold text-stone-700">Date</th>
              {belt.evidenceCols.map((c) => (
                <th key={c} className="px-2 py-2 font-semibold text-stone-700">
                  {c}
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-stone-100">
                <td className="px-2 py-1.5">
                  <input
                    type="date"
                    className="rounded-md border border-stone-300 px-1.5 py-1 text-xs"
                    value={r.date}
                    onChange={(ev) =>
                      setRows((list) => list.map((x) => (x.id === r.id ? { ...x, date: ev.target.value } : x)))
                    }
                  />
                </td>
                {belt.evidenceCols.map((c) => (
                  <td key={c} className="px-2 py-1.5">
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      aria-label={c}
                      className="w-16 rounded-md border border-stone-300 px-1.5 py-1 text-xs"
                      value={r.cols[c] ?? ""}
                      onChange={(ev) => {
                        const n = ev.target.value === "" ? undefined : Math.max(0, Number(ev.target.value));
                        setRows((list) =>
                          list.map((x) => {
                            if (x.id !== r.id) return x;
                            const cols = { ...x.cols };
                            if (n === undefined || Number.isNaN(n)) delete cols[c];
                            else cols[c] = n;
                            return { ...x, cols };
                          }),
                        );
                      }}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Delete this row?")) setRows((list) => list.filter((x) => x.id !== r.id));
                    }}
                    className="rounded-md px-1.5 py-1 text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rows.length > 0 && (
              <tr className="border-t border-stone-300 bg-stone-50 font-semibold text-stone-800">
                <td className="px-2 py-2">Total</td>
                {totals.map((t, i) => (
                  <td key={i} className="px-2 py-2">
                    {t}
                  </td>
                ))}
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() => setRows((list) => [...list, { id: newId(), date: today(), cols: {} }])}
        className="mt-3 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 hover:bg-stone-800"
      >
        Add a row
      </button>
    </div>
  );
}

function MarksTool({ kit, setKit }: { kit: KitData; setKit: (fn: (k: KitData) => KitData) => void }) {
  const kinds: Array<{ k: "home" | "fallback" | "edge"; label: string }> = [
    { k: "home", label: "Home base" },
    { k: "fallback", label: "Fallback" },
    { k: "edge", label: "Edge" },
  ];
  const set = (col: string, kind: "home" | "fallback" | "edge", v: string) =>
    setKit((k) => {
      const cur = { ...(k.marks[col] ?? {}) };
      if (v === "") delete cur[kind];
      else cur[kind] = Number(v);
      const marks = { ...k.marks };
      if (Object.keys(cur).length) marks[col] = cur;
      else delete marks[col];
      return { ...k, marks };
    });

  return (
    <div>
      <p className="mb-3 text-xs leading-relaxed text-stone-500">
        Mark from your last debriefs, not your self-image. In each skill: your home base (where you usually
        operate when resourced), your fallback (where you go under pressure) and your edge (where you
        sometimes reach).
      </p>
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead className="bg-[#F5F2EC]">
            <tr>
              <th className="px-3 py-2 font-semibold text-stone-700">Skill</th>
              {kinds.map((k) => (
                <th key={k.k} className="px-3 py-2 font-semibold text-stone-700">
                  {k.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GRID_COLS.map((c) => (
              <tr key={c.k} className="border-t border-stone-100 align-top">
                <td className="px-3 py-2">
                  <span className="block text-sm font-medium text-stone-900">{c.n}</span>
                  <span className="block text-[11px] text-stone-500">{c.q}</span>
                </td>
                {kinds.map((k) => (
                  <td key={k.k} className="px-3 py-2">
                    <select
                      aria-label={`${c.n}: ${k.label}`}
                      className="w-full rounded-md border border-stone-300 bg-white px-2 py-1.5 text-xs"
                      value={kit.marks[c.k]?.[k.k] ?? ""}
                      onChange={(e) => set(c.k, k.k, e.target.value)}
                    >
                      <option value="">Not marked</option>
                      {GRID_STAGES.map((s, i) => (
                        <option key={s} value={i}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function KitView() {
  const [kit, setKitRaw] = useStored<KitData>(KIT_KEY, EMPTY_KIT);
  const [toolId, setToolId] = useState(KIT_TOOLS[0].id);
  const tool = KIT_TOOLS.find((t) => t.id === toolId) ?? KIT_TOOLS[0];
  const safeKit: KitData = { ...EMPTY_KIT, ...kit };
  const setKit = (fn: (k: KitData) => KitData) => setKitRaw((prev) => fn({ ...EMPTY_KIT, ...prev }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
      <aside className="w-full shrink-0 border-b border-stone-200 bg-[#F5F2EC] p-4 lg:w-72 lg:border-b-0 lg:border-r">
        <p className="mb-1 px-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-900">
          The Kit
        </p>
        <p className="mb-4 px-1 text-xs text-stone-600">{TOOLS_NOTE}</p>
        <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
          {KIT_TOOLS.map((t) => {
            const on = t.id === tool.id;
            const n = countFor(t, safeKit);
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setToolId(t.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                    on ? "bg-stone-900 text-stone-50 shadow-sm" : "text-stone-700 hover:bg-stone-200/70"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate font-medium">{t.name}</span>
                  {n > 0 && (
                    <span className={`font-mono text-[10px] ${on ? "text-amber-300" : "text-stone-400"}`}>{n}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-stone-900">{tool.name}</h2>
        <p className="mt-1 text-sm text-stone-600">{tool.holds}</p>
        <p className="mt-1 mb-5 font-mono text-[11px] text-stone-400">
          Started: {tool.started} · Grows: {tool.grows}
        </p>

        {tool.special === "evidence" ? (
          <EvidenceTool kit={safeKit} setKit={setKit} />
        ) : tool.special === "marks" ? (
          <MarksTool kit={safeKit} setKit={setKit} />
        ) : tool.single ? (
          <SingleTool tool={tool} kit={safeKit} setKit={setKit} />
        ) : (
          <EntriesTool tool={tool} kit={safeKit} setKit={setKit} />
        )}
      </main>
    </div>
  );
}
