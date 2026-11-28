"use client";

import React, { useState } from "react";
import { DOJO_MANUALS, type ManualId } from "@/data/dojo";
import LoopView from "@/components/LoopView";
import KitView from "@/components/KitView";
import PracticeBackup from "@/components/PracticeBackup";
import { useStored } from "@/lib/practiceStore";
import { HeroBanner, LayerStrip, ModuleStrip, PocketCard, artSrc } from "@/components/DojoArt";

type PracticeTab = "manuals" | "loop" | "kit";

const PRACTICE_TABS: Array<{ id: PracticeTab; label: string; hint: string }> = [
  { id: "manuals", label: "Belt manuals", hint: "Study each belt and the Sanctuary" },
  { id: "loop", label: "The Loop", hint: "Before and after a hard conversation" },
  { id: "kit", label: "The Kit", hint: "All your tools in one place" },
];

interface PracticeViewProps {
  activeManualId: ManualId;
  onSelectManual: (id: ManualId) => void;
  onOpenModule: (moduleId: string) => void;
}

export default function PracticeView(props: PracticeViewProps) {
  const [tab, setTab] = useStored<PracticeTab>("ellipsis-v2-practice-tab", "manuals");
  const [restoreKey, setRestoreKey] = useState(0);

  return (
    <div className="dojo-paper min-h-[calc(100vh-61px)]">
      <div className="border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6">
          <div role="tablist" aria-label="Practice" className="flex flex-wrap gap-1.5">
            {PRACTICE_TABS.map((t) => {
              const on = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  title={t.hint}
                  onClick={() => setTab(t.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    on ? "bg-stone-900 text-stone-50" : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          {tab !== "manuals" && (
            <div className="ml-auto">
              <PracticeBackup onRestored={() => setRestoreKey((n) => n + 1)} />
            </div>
          )}
        </div>
      </div>

      {tab === "manuals" && <ManualsPanel {...props} />}
      {tab === "loop" && <LoopView key={`loop-${restoreKey}`} />}
      {tab === "kit" && <KitView key={`kit-${restoreKey}`} />}
    </div>
  );
}

function ManualsPanel({
  activeManualId,
  onSelectManual,
  onOpenModule,
}: PracticeViewProps) {
  const active =
    DOJO_MANUALS.find((m) => m.id === activeManualId) ?? DOJO_MANUALS[0];

  return (
    <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
      {/* Manual list */}
      <aside className="w-full shrink-0 border-b border-stone-200 bg-[#EFE5D0]/70 p-4 lg:sticky lg:top-[61px] lg:h-[calc(100vh-61px)] lg:w-80 lg:overflow-y-auto lg:border-b-0 lg:border-r">
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artSrc(m.id === "sanctuary" ? "pc-sanctuary" : `cap-${m.id}`)}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className={`dojo-thumb h-10 w-10 shrink-0 ${isActive ? "border-stone-50" : ""}`}
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
            <h2 className="font-display text-2xl tracking-wide text-stone-900">
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

        <div className="mb-5 grid items-start gap-4 md:grid-cols-[1fr_minmax(200px,260px)]">
          <HeroBanner belt={active.id} />
          <div className="flex flex-col items-center gap-1">
            <PocketCard belt={active.id} />
            <span className="text-[11px] text-stone-500">Pocket card · tap to flip</span>
          </div>
        </div>

        <div className="mb-5">
          {active.id === "sanctuary" ? <LayerStrip /> : <ModuleStrip belt={active.id} />}
        </div>

        <div className="dojo-frame">
          <iframe
            key={active.id}
            src={active.href}
            title={`${active.name} manual`}
            className="block h-[calc(100vh-270px)] min-h-[560px] w-full"
          />
        </div>
      </main>
    </div>
  );
}
