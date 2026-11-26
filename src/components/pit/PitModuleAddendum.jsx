"use client";
import React, { useState } from "react";
import { PIT_MODULE_ADDENDA, PIT_STAGES } from "../../data/pitAddendum";

export default function PitModuleAddendum({ moduleId, onQuickLogPostMortem, onOpenCodex }) {
  const addendum = PIT_MODULE_ADDENDA[moduleId];
  const [activeTab, setActiveTab] = useState("counterplay"); // counterplay | synthesis | shadow

  if (!addendum) return null;
  const stage = PIT_STAGES[addendum.pitStage] || PIT_STAGES.white;

  return (
    <section className="rounded-xl border-2 border-rose-500/40 bg-slate-950/90 shadow-[4px_4px_0px_rgba(244,63,94,0.35)] overflow-hidden">
      {/* Pit Addendum Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-4 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
            <span className="rounded border border-rose-500/50 bg-rose-500/15 px-2 py-0.5 text-rose-300 font-bold">
              6 · THE PIT OPERATIONAL ADDENDUM
            </span>
            <span className={`rounded border px-2 py-0.5 ${stage.accent}`}>
              {stage.label}
            </span>
            <span className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-slate-400">
              {addendum.status}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed max-w-2xl pt-1">
            {addendum.operationalThesis}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 font-mono text-[11px]">
          {onOpenCodex && (
            <button
              onClick={() => onOpenCodex(addendum.codexIds?.[0] || "")}
              className="rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-amber-300 hover:bg-amber-500/20"
            >
              View Codex ({addendum.codexIds?.join(", ")})
            </button>
          )}
          {onQuickLogPostMortem && (
            <button
              onClick={() => onQuickLogPostMortem(moduleId)}
              className="rounded border border-lime-400/50 bg-lime-400/15 px-2.5 py-1 text-lime-300 hover:bg-lime-400/25 font-semibold"
            >
              + Log Post-Mortem
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 bg-slate-950 px-5 py-2.5 font-mono text-[11px]">
        {[
          ["counterplay", `Live-Room Counter-Play (${addendum.liveRoomCounterPlay.length})`],
          ["synthesis", `Cross-Corpus Synthesis (${addendum.crossCorpusSynthesis.length})`],
          ["shadow", `Operator's Shadow (${addendum.operatorShadow.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded border px-3 py-1 transition ${
              activeTab === key
                ? "border-rose-400 bg-rose-500/20 text-rose-200 font-semibold"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="p-5 space-y-3 text-xs">
        {activeTab === "counterplay" &&
          addendum.liveRoomCounterPlay.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-rose-300">{item.title}</span>
                <span className="font-mono text-[10px] text-slate-400 uppercase">
                  {item.setting}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-amber-400">SIGNAL: </span>
                <span className="text-slate-300 leading-relaxed">{item.signal}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-cyan-400">COUNTER-MOVE: </span>
                <span className="text-slate-200 leading-relaxed">{item.counterMove}</span>
              </div>
              <div className="rounded border border-lime-500/30 bg-lime-500/10 p-2.5 text-lime-200 font-mono text-[11px]">
                <span className="text-lime-400 uppercase font-bold">BREAK-LINE: </span>
                {item.breakLine}
              </div>
            </div>
          ))}

        {activeTab === "synthesis" &&
          addendum.crossCorpusSynthesis.map((syn, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-1.5"
            >
              <div className="font-mono text-xs font-bold text-violet-300">{syn.author}</div>
              <p className="text-slate-300 leading-relaxed">{syn.insight}</p>
            </div>
          ))}

        {activeTab === "shadow" &&
          addendum.operatorShadow.map((sh, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 space-y-2"
            >
              <div className="font-mono text-xs font-bold text-rose-300">
                TRAP · {sh.trap}
              </div>
              <p className="text-slate-300 leading-relaxed">{sh.mechanism}</p>
              <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-200">
                <span className="font-mono text-[10px] uppercase text-emerald-400 font-bold">
                  CALIBRATION:{" "}
                </span>
                {sh.calibration}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
