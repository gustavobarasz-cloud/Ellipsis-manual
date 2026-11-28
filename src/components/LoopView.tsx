"use client";

import React, { useState } from "react";
import {
  BELT_ORDER,
  LOOP,
  LOOP_BELT_KEY,
  LOOP_KEY,
  emptyLoop,
  shownAtBelt,
  useStored,
  type BeltId,
  type LoopEntry,
  type LoopStep,
} from "@/lib/practiceStore";

const BELT_LABEL: Record<BeltId, string> = {
  white: "White",
  blue: "Blue",
  brown: "Brown",
  black: "Black",
};

const TRIAGE = ["style difference", "blind spot", "tactic", "not sure yet"];

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-800";

function Seg<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T | undefined;
  options: Array<{ v: T; label: string }>;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.v)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              on
                ? "border-stone-900 bg-stone-900 text-stone-50"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function entryTitle(e: LoopEntry): string {
  return e.title.trim() || String(e.prepare.want || "").trim() || "Untitled conversation";
}

export default function LoopView() {
  const [loops, setLoops, loaded] = useStored<LoopEntry[]>(LOOP_KEY, []);
  const [belt, setBelt] = useStored<BeltId>(LOOP_BELT_KEY, "white");
  const [openId, setOpenId] = useState<string | null>(null);

  const open = loops.find((l) => l.id === openId) ?? null;

  const create = () => {
    const e = emptyLoop();
    setLoops((prev) => [e, ...prev]);
    setOpenId(e.id);
  };

  const patch = (id: string, fn: (e: LoopEntry) => LoopEntry) =>
    setLoops((prev) => prev.map((e) => (e.id === id ? fn(e) : e)));

  const setField = (id: string, step: LoopStep["k"], k: string, v: string | boolean) =>
    patch(id, (e) => ({ ...e, [step]: { ...e[step], [k]: v } }) as LoopEntry);

  const remove = (id: string) => {
    if (!window.confirm("Delete this Loop entry? This can't be undone.")) return;
    setLoops((prev) => prev.filter((e) => e.id !== id));
    setOpenId(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-900">
          The Encounter Loop
        </p>
        <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-stone-900">
          Prepare · Read · Respond · Debrief
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">{LOOP.intro}</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-[#F5F2EC] px-4 py-3">
        <span className="text-xs font-medium text-stone-600">Show fields up to</span>
        <Seg
          label="Show fields up to belt"
          value={belt}
          onChange={setBelt}
          options={BELT_ORDER.map((b) => ({ v: b, label: BELT_LABEL[b] }))}
        />
        <span className="text-[11px] text-stone-500">Each belt adds one or two questions per step.</span>
      </div>

      {!open && (
        <>
          <button
            type="button"
            onClick={create}
            className="mb-4 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 shadow-sm transition hover:bg-stone-800"
          >
            New Loop for a conversation
          </button>

          {loaded && loops.length === 0 && (
            <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500">
              No Loops yet. Start one about five minutes before a conversation you are dreading.
            </p>
          )}

          <ul className="space-y-2">
            {loops.map((e) => {
              const debriefed = Object.values(e.debrief).some((v) => String(v).trim());
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(e.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-stone-400"
                  >
                    <span className="font-mono text-[11px] text-stone-400">{e.date}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-900">
                      {entryTitle(e)}
                    </span>
                    <span className="shrink-0 text-[11px] text-stone-500">
                      {e.dojo === "office" ? "Office" : "Personal"} ·{" "}
                      {debriefed ? "debriefed" : "open"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <details className="mt-8 rounded-xl border border-stone-200 bg-white px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-stone-700">
              What each belt adds to the Loop
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead>
                  <tr>
                    {LOOP.beltAdds.head.map((h) => (
                      <th key={h} className="border-b border-stone-200 px-2 py-1.5 font-semibold text-stone-700">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LOOP.beltAdds.rows.map((row) => (
                    <tr key={row[0]} className="align-top">
                      {row.map((cell, i) => (
                        <td
                          key={i}
                          className={`border-b border-stone-100 px-2 py-2 leading-relaxed ${
                            i === 0 ? "font-medium text-stone-900" : "text-stone-600"
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}

      {open && (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-stone-900"
            >
              ← All Loops
            </button>
            <span className="text-[11px] text-stone-500">Saved in this browser as you type.</span>
            <button
              type="button"
              onClick={() => remove(open.id)}
              className="ml-auto rounded-lg px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              className={inputCls}
              placeholder="Name this conversation (for example: Promotion talk with my manager)"
              value={open.title}
              onChange={(ev) => patch(open.id, (e) => ({ ...e, title: ev.target.value }))}
            />
            <input
              type="date"
              className={inputCls}
              value={open.date}
              onChange={(ev) => patch(open.id, (e) => ({ ...e, date: ev.target.value }))}
            />
          </div>

          <ol className="space-y-4">
            {LOOP.steps.map((step, si) => (
              <li key={step.k} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-stone-200 bg-[#F5F2EC] px-4 py-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 font-mono text-[11px] text-stone-50">
                    {si + 1}
                  </span>
                  <span className="font-serif text-lg font-semibold text-stone-900">{step.n}</span>
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-stone-500">
                    {step.when}
                  </span>
                </div>
                <div className="space-y-4 px-4 py-4">
                  {step.fields
                    .filter((f) => shownAtBelt(f.belt, belt))
                    .map((f) => {
                      const val = (open[step.k] as Record<string, string | boolean>)[f.k];
                      const tag = f.belt ? (
                        <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-stone-400">
                          {f.belt}
                        </span>
                      ) : null;

                      if (f.kind === "stance") {
                        return (
                          <div key={f.k}>
                            <p className="mb-1.5 text-sm font-medium text-stone-800">{f.label}?</p>
                            <Seg
                              label={f.label}
                              value={open.dojo}
                              onChange={(v) => patch(open.id, (e) => ({ ...e, dojo: v }))}
                              options={[
                                { v: "office", label: "Office dojo" },
                                { v: "personal", label: "Personal dojo" },
                              ]}
                            />
                          </div>
                        );
                      }
                      if (f.kind === "check") {
                        const done = !!val;
                        return (
                          <div key={f.k}>
                            <button
                              type="button"
                              aria-pressed={done}
                              onClick={() => setField(open.id, step.k, f.k, !done)}
                              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                                done
                                  ? "border-red-800 bg-red-800 text-white"
                                  : "border-stone-300 bg-white text-stone-800 hover:border-stone-600"
                              }`}
                            >
                              {done ? "Countdown run: exhale, name it, choose" : "Run the countdown (3·2·1)"}
                            </button>
                          </div>
                        );
                      }
                      if (f.kind === "triage") {
                        return (
                          <div key={f.k}>
                            <p className="mb-1.5 text-sm font-medium text-stone-800">{f.label}</p>
                            <Seg
                              label={f.label}
                              value={val as string | undefined}
                              onChange={(v) => setField(open.id, step.k, f.k, v)}
                              options={TRIAGE.map((t) => ({ v: t, label: t }))}
                            />
                          </div>
                        );
                      }
                      if (f.kind === "move") {
                        const opts = (f.options ?? [])
                          .filter((o) => typeof o === "string" || shownAtBelt(o.belt, belt))
                          .map((o) => (typeof o === "string" ? o : o.t));
                        return (
                          <div key={f.k}>
                            <p className="mb-1.5 text-sm font-medium text-stone-800">
                              {f.label}
                              <span className="font-normal text-stone-500"> (everything else waits for the debrief)</span>
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {opts.map((o) => {
                                const on = val === o;
                                return (
                                  <button
                                    key={o}
                                    type="button"
                                    aria-pressed={on}
                                    onClick={() => setField(open.id, step.k, f.k, on ? "" : o)}
                                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                      on
                                        ? "border-red-800 bg-red-50 text-red-900"
                                        : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
                                    }`}
                                  >
                                    {o}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <label key={f.k} className="block">
                          <span className="mb-1 block text-sm font-medium text-stone-800">
                            {f.label}
                            {tag}
                          </span>
                          <textarea
                            rows={2}
                            className={inputCls}
                            value={typeof val === "string" ? val : ""}
                            onChange={(ev) => setField(open.id, step.k, f.k, ev.target.value)}
                          />
                        </label>
                      );
                    })}
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-4 text-xs text-stone-500">
            After the debrief, add anything new to the Kit: a codex entry, a fallback, or a count in the evidence log.
          </p>
        </div>
      )}
    </div>
  );
}
