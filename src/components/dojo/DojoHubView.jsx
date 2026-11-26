"use client";
import React, { useState, useEffect } from "react";

const DOJO_BELTS = [
  {
    id: "white",
    name: "White Belt",
    subtitle: "Guard & Regulate",
    version: "v4.2 Gold Master",
    href: "/dojo/white-belt.html",
    question: "Can I stay myself under pressure?",
    pocketBack: "Would I accept their no?",
    sanctuary: "Sanctuary L1 · The Inner Sanctuary",
    pitStage: "white",
    pitLabel: "Pit Stage 1 · Telemetry & Authority",
    linkedModules: ["M01", "M02", "M03", "M04"],
    accent: "border-slate-300 bg-slate-100/15 text-slate-100",
    dot: "bg-slate-200",
  },
  {
    id: "blue",
    name: "Blue Belt",
    subtitle: "Read & Bond",
    version: "v4.2 Final",
    href: "/dojo/blue-belt.html",
    question: "What is happening in them, and do they feel met?",
    pocketBack: "Which conversation are they in?",
    sanctuary: "Sanctuary L2 · The I-Thou Encounter",
    pitStage: "blue",
    pitLabel: "Pit Stage 2 · Profiling & Elicitation",
    linkedModules: ["M05", "M06", "M07", "M08"],
    accent: "border-blue-400 bg-blue-500/20 text-blue-200",
    dot: "bg-blue-400",
  },
  {
    id: "brown",
    name: "Brown Belt",
    subtitle: "Word, Reveal & Steer",
    version: "v3.2 Full Deepened",
    href: "/dojo/brown-belt.html",
    question: "What reality are my words building?",
    pocketBack: "Frame before you ask · Say it once · Steer out loud",
    sanctuary: "Sanctuary L3 · Poetics of Connection",
    pitStage: "brown",
    pitLabel: "Pit Stage 3 · Covert Syntax",
    linkedModules: ["M09", "M10"],
    accent: "border-amber-500 bg-amber-600/20 text-amber-200",
    dot: "bg-amber-500",
  },
  {
    id: "black",
    name: "Black Belt",
    subtitle: "Systems & Bridges",
    version: "v3 Complete",
    href: "/dojo/black-belt.html",
    question: "What is the room, and can I be a bridge?",
    pocketBack: "Am I a bridge here, or a code-switcher?",
    sanctuary: "Sanctuary L4 · The Relational Ecosystem",
    pitStage: "black",
    pitLabel: "Pit Stage 4 · Compliance Chains & Space",
    linkedModules: ["M11", "M12"],
    accent: "border-rose-400 bg-rose-500/20 text-rose-200",
    dot: "bg-rose-400",
  },
];

const LAST_BELT_KEY = "bi_workstation_active_dojo_belt_v1";

export default function DojoHubView({ onSelectModule, onOpenPitCodex }) {
  const [activeBeltId, setActiveBeltId] = useState("white");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_BELT_KEY);
      if (saved && DOJO_BELTS.some((b) => b.id === saved)) {
        setActiveBeltId(saved);
      }
    } catch {}
  }, []);

  const chooseBelt = (id) => {
    setActiveBeltId(id);
    try {
      localStorage.setItem(LAST_BELT_KEY, id);
    } catch {}
  };

  const belt = DOJO_BELTS.find((b) => b.id === activeBeltId) || DOJO_BELTS[0];

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-10">
      {/* Belt Switcher + Cross-Link Bridge */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
              Communication Dojo · All 4 Belts Unlocked · Live Field Manuals
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-0.5">
              {belt.name}: {belt.subtitle}{" "}
              <span className="text-xs font-mono font-normal text-slate-400">
                ({belt.version})
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {DOJO_BELTS.map((b) => {
              const isOn = b.id === belt.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => chooseBelt(b.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs transition ${
                    isOn
                      ? b.accent + " font-bold"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${b.dot}`} />
                  {b.name}
                </button>
              );
            })}
            <a
              href={belt.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-xs text-cyan-200 hover:bg-cyan-500/20"
              title="Open standalone manual in a new tab for fullscreen or 1-page PDF printing"
            >
              Open Tab / Print ↗
            </a>
          </div>
        </div>

        {/* Cross-Link Strip: Dojo <-> Ellipsis Modules <-> Pit Codex */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3 text-xs">
          <div className="space-y-0.5">
            <div className="text-slate-300">
              <span className="font-mono text-[10px] uppercase text-slate-500">CORE Q: </span>
              {belt.question}{" "}
              <span className="text-slate-600 mx-1">·</span>
              <span className="font-mono text-[10px] uppercase text-slate-500">CHECK: </span>
              <span className="italic text-amber-200/90">“{belt.pocketBack}”</span>
            </div>
            <div className="text-[11px] font-mono text-violet-300/90">
              Paired I-Thou: {belt.sanctuary}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
            <span className="text-[10px] uppercase text-slate-500 mr-1">Ellipsis Pairing:</span>
            {belt.linkedModules.map((mId) => (
              <button
                key={mId}
                type="button"
                onClick={() => onSelectModule && onSelectModule(mId)}
                className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-cyan-300 hover:bg-cyan-500/20"
              >
                {mId}
              </button>
            ))}
            {onOpenPitCodex && (
              <button
                type="button"
                onClick={() => onOpenPitCodex(belt.pitStage)}
                className="rounded border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-rose-300 hover:bg-rose-500/20"
              >
                {belt.pitLabel} →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sandboxed Full-Fidelity Manual Frame (Preserves all CSS, labs, linters, Socratic decks & localStorage) */}
      <div className="rounded-xl border-2 border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <iframe
          key={belt.href}
          src={belt.href}
          title={`Communication Dojo — ${belt.name}`}
          allow="microphone; clipboard-write"
          className="w-full h-[80vh] min-h-[680px] border-0 bg-[#F4ECDC]"
        />
      </div>
    </div>
  );
}
