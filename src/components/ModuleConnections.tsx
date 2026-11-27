"use client";

import React from "react";
import PitModuleAddendum from "@/components/pit/PitModuleAddendum";
import { beltForModule, type ManualId } from "@/data/dojo";

interface ModuleConnectionsProps {
  moduleId: string;
  onOpenManual: (id: ManualId) => void;
  onOpenCodex: (search: string) => void;
  onLogPostMortem: (moduleId: string) => void;
}

export default function ModuleConnections({
  moduleId,
  onOpenManual,
  onOpenCodex,
  onLogPostMortem,
}: ModuleConnectionsProps) {
  const belt = beltForModule(moduleId);

  return (
    <section className="mt-12 border-t border-stone-200 pt-8">
      <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-stone-500">
        Put {moduleId} into practice
      </h3>

      {belt && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onOpenManual(belt.id)}
            className="group rounded-xl border border-stone-200 bg-white p-4 text-left transition hover:border-stone-900"
          >
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-stone-500">
              <span className={`h-2.5 w-2.5 rounded-full ${belt.dot}`} />
              Practice · Dojo
            </span>
            <span className="mt-1 block font-serif text-lg font-semibold text-stone-900 group-hover:text-amber-900">
              {belt.name} →
            </span>
            <span className="mt-0.5 block text-xs italic text-stone-600">
              &ldquo;{belt.pocketQuestion}&rdquo;
            </span>
          </button>

          {belt.sanctuaryLayer && (
            <button
              type="button"
              onClick={() => onOpenManual("sanctuary")}
              className="group rounded-xl border border-emerald-700/25 bg-emerald-50/60 p-4 text-left transition hover:border-emerald-800"
            >
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-emerald-900/70">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-700" />
                Practice · Sanctuary
              </span>
              <span className="mt-1 block font-serif text-lg font-semibold text-stone-900 group-hover:text-emerald-900">
                {belt.sanctuaryLayer} →
              </span>
              <span className="mt-0.5 block text-xs italic text-stone-600">
                &ldquo;Am I here, and are they?&rdquo;
              </span>
            </button>
          )}
        </div>
      )}

      <PitModuleAddendum
        moduleId={moduleId}
        onOpenCodex={(codexId: string) => onOpenCodex(codexId || "")}
        onQuickLogPostMortem={(mId: string) => onLogPostMortem(mId)}
      />
    </section>
  );
}
