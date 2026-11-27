"use client";

import React from "react";
import { PitCodexView, PitPostMortemView } from "@/components/pit/PitOpsViews";

export type FieldTab = "codex" | "postmortem";

interface FieldViewProps {
  tab: FieldTab;
  onTabChange: (tab: FieldTab) => void;
  codexSearch: string;
  postMortemModuleId: string;
}

const TABS: Array<{ id: FieldTab; label: string; blurb: string }> = [
  {
    id: "codex",
    label: "Pit Codex",
    blurb: "Field cards for reading and countering pressure in live rooms.",
  },
  {
    id: "postmortem",
    label: "Post-Mortems",
    blurb: "Log what happened in a real room: the signal, your move, the pull you resisted.",
  },
];

export default function FieldView({
  tab,
  onTabChange,
  codexSearch,
  postMortemModuleId,
}: FieldViewProps) {
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-900">
        The Pit · Field Operations
      </p>
      <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-stone-900">
        {active.label}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-stone-600">{active.blurb}</p>

      <div className="mt-5 inline-flex rounded-lg border border-stone-300 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
              t.id === tab
                ? "bg-stone-900 text-stone-50"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-950 p-3 shadow-sm sm:p-5">
        {tab === "codex" ? (
          <PitCodexView initialSearch={codexSearch} />
        ) : (
          <PitPostMortemView prefillModuleId={postMortemModuleId} />
        )}
      </div>
    </div>
  );
}
