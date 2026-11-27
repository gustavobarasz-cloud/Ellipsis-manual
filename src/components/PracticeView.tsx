"use client";

import React from "react";
import { DOJO_MANUALS, type ManualId } from "@/data/dojo";

interface PracticeViewProps {
  activeManualId: ManualId;
  onSelectManual: (id: ManualId) => void;
  onOpenModule: (moduleId: string) => void;
}

export default function PracticeView({
  activeManualId,
  onSelectManual,
  onOpenModule,
}: PracticeViewProps) {
  const active =
    DOJO_MANUALS.find((m) => m.id === activeManualId) ?? DOJO_MANUALS[0];

  return (
    <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
      {/* Manual list */}
      <aside className="w-full shrink-0 border-b border-stone-200 bg-[#F5F2EC] p-4 lg:sticky lg:top-[61px] lg:h-[calc(100vh-61px)] lg:w-80 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <p className="mb-1 px-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-900">
          The Communication Dojo
        </p>
        <p className="mb-4 px-1 text-xs text-stone-600">
          Four belts for pressure and stakes, and the Sanctuary for putting the
          tools down.
        </p>

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {DOJO_MANUALS.map((m) => {
            const isActive = m.id === active.id;
            return (
              <li
                key={m.id}
                className={
                  m.id === "sanctuary"
                    ? "col-span-2 sm:col-span-1 lg:col-span-1 lg:mt-3 lg:border-t lg:border-stone-300 lg:pt-3"
                    : ""
                }
              >
                <button
                  type="button"
                  onClick={() => onSelectManual(m.id)}
                  className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                    isActive
                      ? "bg-stone-900 text-stone-50 shadow-sm"
                      : "text-stone-700 hover:bg-stone-200/70"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${m.dot} ${
                      isActive ? "ring-2 ring-stone-50/70" : ""
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-snug">
                      {m.name}
                    </span>
                    <span
                      className={`block truncate text-xs ${
                        isActive ? "text-stone-300" : "text-stone-500"
                      }`}
                    >
                      {m.subtitle}
                    </span>
                  </span>
                  <span
                    className={`mt-0.5 shrink-0 font-mono text-[10px] ${
                      isActive ? "text-amber-300" : "text-stone-400"
                    }`}
                  >
                    {m.version}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 px-1 text-[11px] leading-relaxed text-stone-500">
          Each manual saves your work in this browser. Use its Backup JSON
          button to keep a copy or move it to another device.
        </p>
      </aside>

      {/* Active manual */}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-stone-900">
              {active.name}{" "}
              <span className="font-mono text-sm font-normal text-stone-400">
                {active.version}
              </span>
            </h2>
            <p className="mt-1 font-serif text-base italic text-stone-700">
              &ldquo;{active.pocketQuestion}&rdquo;
            </p>
          </div>
          <a
            href={active.href}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
          >
            Open full screen ↗
          </a>
        </div>

        {(active.linkedModules.length > 0 || active.sanctuaryLayer) && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            {active.linkedModules.length > 0 && (
              <>
                <span className="font-medium text-stone-500">Study with:</span>
                {active.linkedModules.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onOpenModule(id)}
                    className="rounded-full border border-stone-300 bg-white px-2.5 py-0.5 font-mono text-[11px] text-stone-700 transition hover:border-amber-800 hover:text-amber-900"
                  >
                    {id}
                  </button>
                ))}
              </>
            )}
            {active.sanctuaryLayer && (
              <button
                type="button"
                onClick={() => onSelectManual("sanctuary")}
                className="rounded-full border border-emerald-700/30 bg-emerald-50 px-2.5 py-0.5 text-[11px] text-emerald-900 transition hover:border-emerald-700"
              >
                Sanctuary {active.sanctuaryLayer} →
              </button>
            )}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <iframe
            key={active.id}
            src={active.href}
            title={`${active.name} manual`}
            className="block h-[calc(100vh-220px)] min-h-[560px] w-full"
          />
        </div>
      </main>
    </div>
  );
}
