"use client";
import React, { useState, useMemo, useRef } from "react";
import {
  loadDefaultCurriculum,
  mergeCurriculumBundles,
  validateCurriculumDatabase,
} from "../data/loadCurriculum";
import { ENTITY_STYLES, VERDICT_STYLES } from "../data/entityStyles";
import { ModuleSimulator } from "./simulators/SimulatorRegistry";

// ============================================================================
// INLINE MARKDOWN + [L2-HOOK] CALIBRATION LAB RENDERER
// ============================================================================
function renderInlineBoldAndCode(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-[11px] text-cyan-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={idx} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function CalibrationLabCard({ lab }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("worked"); // worked | deceptive
  if (!lab) return null;

  return (
    <div className="my-4 rounded-xl border border-cyan-500/30 bg-slate-900/70 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-800/50 transition"
      >
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
            Layer 2 Calibration Lab · {lab.hookId}
          </div>
          <div className="text-xs font-medium text-slate-200 mt-0.5">
            {lab.operationalFocus}
          </div>
        </div>
        <span className="shrink-0 rounded border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-mono text-[11px] text-cyan-300">
          {open ? "HIDE LAB" : "OPEN LAB"}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-800 p-4 space-y-3 text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("worked")}
              className={`rounded-md border px-3 py-1 font-mono text-[11px] ${
                tab === "worked"
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                  : "border-slate-700 bg-slate-950 text-slate-400"
              }`}
            >
              True Signal (Worked Example)
            </button>
            <button
              onClick={() => setTab("deceptive")}
              className={`rounded-md border px-3 py-1 font-mono text-[11px] ${
                tab === "deceptive"
                  ? "border-rose-500/50 bg-rose-500/15 text-rose-300"
                  : "border-slate-700 bg-slate-950 text-slate-400"
              }`}
            >
              False Positive Trap (Non-Example)
            </button>
          </div>

          {tab === "worked" ? (
            <div className="space-y-2.5">
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <div className="font-mono text-[10px] text-slate-400 uppercase">
                  Setting: {lab.workedExample.setting}
                </div>
                <p className="mt-1 text-slate-200 leading-relaxed">
                  {lab.workedExample.sceneMarkdown}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries({
                  Baseline: lab.workedExample.ctaLoop.baseline,
                  "Deviation / Cluster": lab.workedExample.ctaLoop.deviationOrCluster,
                  "Internal Driver Hypothesis": lab.workedExample.ctaLoop.internalDriverHypothesis,
                  "Tactical Probe / Actuator": lab.workedExample.ctaLoop.tacticalProbeOrActuator,
                }).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-lg border border-slate-800 bg-slate-950/50 p-2.5"
                  >
                    <div className="font-mono text-[10px] text-emerald-400 uppercase">{k}</div>
                    <div className="mt-0.5 text-slate-300 leading-relaxed">{v}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5">
                <span className="font-mono text-[10px] text-emerald-300 uppercase">
                  Feedback &amp; Next Move:{" "}
                </span>
                <span className="text-slate-200">
                  {lab.workedExample.ctaLoop.observableFeedbackAndNextMove}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <div className="font-mono text-[10px] text-slate-400 uppercase">
                  Setting: {lab.deceptiveNonExample.setting}
                </div>
                <p className="mt-1 text-slate-200 leading-relaxed">
                  {lab.deceptiveNonExample.mirrorSceneMarkdown}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-2.5">
                  <div className="font-mono text-[10px] text-amber-300 uppercase">
                    Benign Root Cause
                  </div>
                  <div className="mt-0.5 text-slate-300">
                    {lab.deceptiveNonExample.benignRootCause}
                  </div>
                </div>
                <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/5 p-2.5">
                  <div className="font-mono text-[10px] text-cyan-300 uppercase">
                    Disconfirming Cue
                  </div>
                  <div className="mt-0.5 text-slate-300">
                    {lab.deceptiveNonExample.disconfirmingCue}
                  </div>
                </div>
                <div className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-2.5">
                  <div className="font-mono text-[10px] text-rose-300 uppercase">
                    False Positive Cost
                  </div>
                  <div className="mt-0.5 text-slate-300">
                    {lab.deceptiveNonExample.falsePositiveCost}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RichProseWithHooks({ markdown, calibrationLabs }) {
  if (!markdown) return null;
  const blocks = markdown.split(/\n\n+/);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-300">
      {blocks.map((block, i) => {
        const hookMatches = [...block.matchAll(/\[L2-HOOK:([^\]]+)\]/g)].map((m) => m[1]);
        const cleanBlock = block.replace(/\[L2-HOOK:[^\]]+\]/g, "").trim();

        const lines = cleanBlock.split("\n");
        const renderedLines = lines.map((line, j) => {
          if (line.startsWith("### ")) {
            return (
              <h4
                key={j}
                className="mt-4 mb-1 font-mono text-xs font-semibold uppercase tracking-wider text-cyan-300"
              >
                {line.slice(4)}
              </h4>
            );
          }
          if (line.startsWith("- ") || /^\d+\.\s/.test(line)) {
            return (
              <div key={j} className="pl-3 border-l border-slate-800 py-0.5">
                {renderInlineBoldAndCode(line)}
              </div>
            );
          }
          return (
            <p key={j} className="leading-relaxed">
              {renderInlineBoldAndCode(line)}
            </p>
          );
        });

        return (
          <div key={i}>
            <div className="space-y-1.5">{renderedLines}</div>
            {hookMatches.map((hId) => (
              <CalibrationLabCard key={hId} lab={calibrationLabs?.[hId]} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// COLLAPSIBLE [L3-HOOK] EPISTEMIC DRAWER
// ============================================================================
function EpistemicClaimRow({ claim, drawer }) {
  const [open, setOpen] = useState(false);
  const tierColors = {
    T1: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
    T2: "border-amber-500/40 bg-amber-500/15 text-amber-300",
    T3: "border-rose-500/40 bg-rose-500/15 text-rose-300",
  };
  const vStyle = drawer ? VERDICT_STYLES[drawer.verdict] : null;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 flex-1">
          <span
            className={`mt-0.5 shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold ${
              tierColors[claim.tier] || "border-slate-700 text-slate-300"
            }`}
          >
            {claim.tier}
          </span>
          <div>
            <div className="text-xs font-medium text-slate-100">{claim.claimSummary}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{claim.rationale}</div>
          </div>
        </div>
        {drawer && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 rounded border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 font-mono text-[10px] text-violet-300 hover:bg-violet-500/20"
          >
            {open ? "HIDE L3 AUDIT" : "L3 SCIENCE DRAWER"}
          </button>
        )}
      </div>

      {open && drawer && (
        <div className="mt-2 rounded-lg border border-violet-500/30 bg-slate-950/90 p-3 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-slate-100">{drawer.topicTitle}</span>
            {vStyle && (
              <span className={`rounded border px-2 py-0.5 font-mono text-[10px] ${vStyle.badge}`}>
                {vStyle.label}
              </span>
            )}
          </div>
          <p className="text-slate-300 leading-relaxed">
            {renderInlineBoldAndCode(drawer.externalScienceMarkdown)}
          </p>
          <div className="rounded border border-slate-800 bg-slate-900/70 p-2 text-[11px]">
            <span className="font-mono text-emerald-400">OPERATIONAL TRANSLATION: </span>
            <span className="text-slate-200">{drawer.operationalTranslation}</span>
          </div>
          {drawer.keyReferences?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {drawer.keyReferences.map((ref) => (
                <span
                  key={ref}
                  className="rounded bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-800"
                >
                  {ref}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN WORKSTATION SHELL
// ============================================================================
export default function UnifiedCurriculumApp() {
  const [db, setDb] = useState(() => loadDefaultCurriculum());
  const [activeView, setActiveView] = useState("module"); // module | dashboard | dag
  const [activeModuleId, setActiveModuleId] = useState("M01");
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [glossaryFilter, setGlossaryFilter] = useState("ALL");
  const [completedDrills, setCompletedDrills] = useState({});
  const [showDrillSolution, setShowDrillSolution] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  const activeModule = db.modules[activeModuleId] || Object.values(db.modules)[0];
  const p1 = activeModule?.pass1;
  const p2 = activeModule?.pass2;

  const stats = useMemo(() => {
    const mods = Object.values(db.modules);
    const claims = { T1: 0, T2: 0, T3: 0 };
    const verdicts = { REINFORCES: 0, REFINES_MECHANISM_DIFFERS: 0, REFUTES_SPECULATIVE: 0 };
    let l2Count = 0;
    let l3Count = 0;
    for (const m of mods) {
      for (const c of m.pass1.epistemicAudit.gradedClaims) claims[c.tier] = (claims[c.tier] || 0) + 1;
      for (const d of Object.values(m.pass2.epistemicDrawers)) {
        verdicts[d.verdict] = (verdicts[d.verdict] || 0) + 1;
        l3Count++;
      }
      l2Count += Object.keys(m.pass2.calibrationLabs || {}).length;
    }
    return {
      moduleCount: mods.length,
      glossaryCount: Object.keys(db.masterGlossary).length,
      claims,
      verdicts,
      l2Count,
      l3Count,
      drillsDone: Object.values(completedDrills).filter(Boolean).length,
    };
  }, [db, completedDrills]);

  const filteredGlossary = useMemo(() => {
    const q = glossaryQuery.trim().toLowerCase();
    return Object.values(db.masterGlossary).filter((term) => {
      if (glossaryFilter !== "ALL" && term.entityType !== glossaryFilter) return false;
      if (!q) return true;
      return (
        term.canonicalTerm.toLowerCase().includes(q) ||
        term.definition.toLowerCase().includes(q) ||
        term.introducedInModule.toLowerCase().includes(q)
      );
    });
  }, [db.masterGlossary, glossaryQuery, glossaryFilter]);

  const handleImportJson = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const merged = mergeCurriculumBundles([db, parsed]);
      const validation = validateCurriculumDatabase(merged);
      setDb(merged);
      setImportStatus({
        ok: validation.valid,
        msg: validation.valid
          ? `Merged ${file.name} (${Object.keys(merged.modules).length} modules, ${Object.keys(merged.masterGlossary).length} terms, 0 errors).`
          : `Merged with ${validation.errors.length} warnings: ${validation.errors[0]}`,
      });
    } catch (err) {
      setImportStatus({ ok: false, msg: `Import failed: ${err.message}` });
    }
    e.target.value = "";
  };

  const selectModule = (mId) => {
    setActiveModuleId(mId);
    setActiveView("module");
    setShowDrillSolution(false);
  };

  const toggleDrillDone = (mId) =>
    setCompletedDrills((prev) => ({ ...prev, [mId]: !prev[mId] }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-mono text-xs font-bold text-slate-950">
            BI
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-slate-100">
              Behavioral Intelligence Workstation
            </h1>
            <div className="text-[11px] font-mono text-slate-400">
              6MX + Ellipsis Manual · {stats.moduleCount}/12 Modules · {stats.glossaryCount} Terms
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {[
            ["module", "Reader"],
            ["dashboard", `Audit & Mastery (${stats.drillsDone}/${stats.moduleCount})`],
            ["dag", "12-Module DAG"],
          ].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`rounded-md border px-3 py-1.5 transition ${
                activeView === v
                  ? "border-cyan-400 bg-cyan-500/15 text-cyan-200"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setGlossaryOpen(true)}
            className="rounded-md border border-violet-500/40 bg-violet-500/15 px-3 py-1.5 text-violet-200 hover:bg-violet-500/25"
          >
            Glossary ({stats.glossaryCount})
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-emerald-300 hover:bg-emerald-500/20"
          >
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />
        </div>
      </header>

      {importStatus && (
        <div
          className={`px-4 py-2 text-xs font-mono flex items-center justify-between border-b ${
            importStatus.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          <span>{importStatus.msg}</span>
          <button onClick={() => setImportStatus(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* LEFT SIDEBAR: 6 TIERS / 12 MODULES */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-slate-800 bg-slate-950/60 overflow-y-auto p-4 space-y-5">
          {db.tiers.map((tier) => (
            <div key={tier.id} className="space-y-1.5">
              <div className="px-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                {tier.id} · {tier.title}
              </div>
              {tier.moduleIds.map((mId) => {
                const mod = db.modules[mId];
                if (!mod) return null;
                const active = activeView === "module" && activeModuleId === mId;
                const done = !!completedDrills[mId];
                return (
                  <button
                    key={mId}
                    onClick={() => selectModule(mId)}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                      active
                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-100"
                        : "border-transparent hover:border-slate-800 hover:bg-slate-900/60 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={active ? "text-cyan-300" : "text-slate-500"}>{mId}</span>
                      {done && <span className="text-emerald-400">✓ DRILL</span>}
                    </div>
                    <div className="text-xs font-medium leading-snug mt-0.5">{mod.title}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          {/* Mobile Module Selector */}
          <div className="lg:hidden mb-4">
            <select
              value={activeModuleId}
              onChange={(e) => selectModule(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200"
            >
              {Object.values(db.modules).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id}: {m.title}
                </option>
              ))}
            </select>
          </div>

          {activeView === "dashboard" && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                  Curriculum Telemetry
                </span>
                <h2 className="text-2xl font-bold text-slate-100 mt-1">
                  Mastery &amp; Epistemic Audit Dashboard
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="text-[11px] font-mono text-slate-400">FIELD DRILLS COMPLETED</div>
                  <div className="text-2xl font-mono font-bold text-emerald-300 mt-1">
                    {stats.drillsDone} / {stats.moduleCount}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="text-[11px] font-mono text-slate-400">GRADED CLAIMS (T1/T2/T3)</div>
                  <div className="text-lg font-mono font-bold text-slate-100 mt-1">
                    <span className="text-emerald-300">{stats.claims.T1}</span> /{" "}
                    <span className="text-amber-300">{stats.claims.T2}</span> /{" "}
                    <span className="text-rose-300">{stats.claims.T3}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="text-[11px] font-mono text-slate-400">L2 CALIBRATION LABS</div>
                  <div className="text-2xl font-mono font-bold text-cyan-300 mt-1">{stats.l2Count}</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="text-[11px] font-mono text-slate-400">L3 EPISTEMIC DRAWERS</div>
                  <div className="text-2xl font-mono font-bold text-violet-300 mt-1">{stats.l3Count}</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
                <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300">
                  12-Module Completion Matrix
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.values(db.modules).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-xs"
                    >
                      <button
                        onClick={() => selectModule(m.id)}
                        className="text-left hover:text-cyan-300 transition"
                      >
                        <div className="font-mono text-[10px] text-slate-500">
                          {m.tierId} · {m.id}
                        </div>
                        <div className="font-medium text-slate-200">{m.title}</div>
                      </button>
                      <button
                        onClick={() => toggleDrillDone(m.id)}
                        className={`shrink-0 rounded border px-2 py-1 font-mono text-[10px] ${
                          completedDrills[m.id]
                            ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                            : "border-slate-700 bg-slate-900 text-slate-400"
                        }`}
                      >
                        {completedDrills[m.id] ? "DONE" : "MARK"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === "dag" && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-violet-400">
                  Dependency Architecture
                </span>
                <h2 className="text-2xl font-bold text-slate-100 mt-1">
                  12-Module Acyclic Prerequisite Graph (T1 → T6)
                </h2>
              </div>
              <div className="space-y-4">
                {db.tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3"
                  >
                    <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                      {tier.id} — {tier.title}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {tier.moduleIds.map((mId) => {
                        const mod = db.modules[mId];
                        if (!mod) return null;
                        const deps = mod.pass1.dependencies;
                        return (
                          <div
                            key={mId}
                            onClick={() => selectModule(mId)}
                            className="cursor-pointer rounded-lg border border-slate-800 bg-slate-950/80 p-3 hover:border-cyan-500/40 transition space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-semibold text-cyan-300">
                                {mId}: {mod.title}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              Prereqs:{" "}
                              {deps.prerequisites.length > 0
                                ? deps.prerequisites.join(", ")
                                : "None (Entry)"}
                            </div>
                            <div className="text-[11px] font-mono text-emerald-400">
                              Unlocks:{" "}
                              {deps.unlocks.length > 0 ? deps.unlocks.join(", ") : "Full Pipeline"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === "module" && activeModule && (
            <article className="max-w-4xl mx-auto space-y-8 pb-16">
              {/* MODULE HEADER */}
              <div className="space-y-3 border-b border-slate-800 pb-6">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-cyan-300">
                    {activeModule.tierId} · {activeModule.id}
                  </span>
                  <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                    {activeModule.buildStage}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50">
                  {activeModule.title}
                </h2>
                <p className="text-sm text-slate-400">{activeModule.canonicalFocus}</p>

                {/* Canonical Term Badges */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {p1.canonicalTermIds.map((slug) => {
                    const entry = db.masterGlossary[slug];
                    if (!entry) return null;
                    const st = ENTITY_STYLES[entry.entityType] || {};
                    return (
                      <button
                        key={slug}
                        onClick={() => {
                          setGlossaryQuery(entry.canonicalTerm);
                          setGlossaryOpen(true);
                        }}
                        className={`rounded-md border px-2 py-0.5 font-mono text-[11px] transition hover:opacity-90 ${
                          st.badge || "border-slate-700 text-slate-300"
                        }`}
                      >
                        {entry.canonicalTerm}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* INTERACTIVE SIMULATOR */}
              <ModuleSimulator
                moduleId={activeModule.id}
                diagramSpec={p1.appSeed.visualDiagram}
              />

              {/* MENTAL MODEL */}
              <section className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400">
                  1 · Overarching Mental Model · {p1.mentalModel.structuralMetaphorName}
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                  <RichProseWithHooks
                    markdown={p1.mentalModel.proseMarkdown}
                    calibrationLabs={p2.calibrationLabs}
                  />
                </div>
              </section>

              {/* GRANULAR MECHANICS & INLINE L2 LABS */}
              <section className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                  2 · Granular Mechanics &amp; Inline Calibration Labs
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                  <RichProseWithHooks
                    markdown={p1.granularMechanics.causalChainsMarkdown}
                    calibrationLabs={p2.calibrationLabs}
                  />
                </div>
              </section>

              {/* SENSOR-TO-ACTUATOR CTA LOOPS */}
              <section className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                  3 · Sensor-to-Actuator Loops
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {p1.granularMechanics.sensorToActuatorLoops.map((loop) => (
                    <div
                      key={loop.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2 text-xs"
                    >
                      <div className="font-mono font-semibold text-emerald-300">{loop.title}</div>
                      <div>
                        <span className="font-mono text-cyan-400">SENSOR: </span>
                        <span className="text-slate-300">{loop.sensorInput}</span>
                      </div>
                      <div>
                        <span className="font-mono text-amber-400">INTERPRETER: </span>
                        <span className="text-slate-300">{loop.interpreterHypothesis}</span>
                      </div>
                      <div>
                        <span className="font-mono text-emerald-400">ACTUATOR: </span>
                        <span className="text-slate-300">{loop.actuatorCalibration}</span>
                      </div>
                      <div>
                        <span className="font-mono text-violet-400">FEEDBACK: </span>
                        <span className="text-slate-300">{loop.feedbackSignal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* EPISTEMIC AUDIT & COLLAPSIBLE L3 DRAWERS */}
              <section className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-widest text-violet-400">
                  4 · Epistemic Audit &amp; External Science Drawers (T1 / T2 / T3)
                </div>
                <div className="space-y-2.5">
                  {p1.epistemicAudit.gradedClaims.map((claim) => (
                    <EpistemicClaimRow
                      key={claim.id}
                      claim={claim}
                      drawer={
                        claim.linkedL3HookId ? p2.epistemicDrawers[claim.linkedL3HookId] : null
                      }
                    />
                  ))}
                </div>
              </section>

              {/* FIELD CALIBRATION DRILL */}
              <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                    5 · Field Calibration Drill
                  </div>
                  <button
                    onClick={() => toggleDrillDone(activeModule.id)}
                    className={`rounded border px-3 py-1 font-mono text-xs ${
                      completedDrills[activeModule.id]
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                        : "border-slate-700 bg-slate-900 text-slate-300"
                    }`}
                  >
                    {completedDrills[activeModule.id] ? "✓ Marked Complete" : "Mark Drill Complete"}
                  </button>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {p1.appSeed.fieldCalibrationDrill.scenarioPrompt}
                </p>
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                  <strong className="font-mono">DECEPTIVE RED HERRING: </strong>
                  {p1.appSeed.fieldCalibrationDrill.deceptiveRedHerring}
                </div>
                <button
                  onClick={() => setShowDrillSolution((v) => !v)}
                  className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 font-mono text-xs text-emerald-200 hover:bg-emerald-500/25"
                >
                  {showDrillSolution ? "Hide Ideal Operator Response" : "Reveal Ideal Operator Response"}
                </button>
                {showDrillSolution && (
                  <div className="rounded-lg border border-emerald-500/40 bg-slate-950/80 p-3 text-xs text-emerald-100 leading-relaxed">
                    {p1.appSeed.fieldCalibrationDrill.idealOperatorResponse}
                  </div>
                )}
              </section>
            </article>
          )}
        </main>
      </div>

      {/* GLOSSARY SLIDE-OVER */}
      {glossaryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Master Canonical Glossary ({stats.glossaryCount})
                </h3>
                <div className="text-[11px] font-mono text-slate-400">
                  5-Primitive Ontology Registry
                </div>
              </div>
              <button
                onClick={() => setGlossaryOpen(false)}
                className="rounded border border-slate-700 px-2.5 py-1 text-xs font-mono text-slate-300"
              >
                CLOSE
              </button>
            </div>
            <div className="p-3 border-b border-slate-800 space-y-2">
              <input
                type="text"
                value={glossaryQuery}
                onChange={(e) => setGlossaryQuery(e.target.value)}
                placeholder="Search terms, definitions, or M01-M12..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1">
                {["ALL", ...Object.keys(ENTITY_STYLES)].map((et) => (
                  <button
                    key={et}
                    onClick={() => setGlossaryFilter(et)}
                    className={`rounded border px-2 py-0.5 font-mono text-[10px] ${
                      glossaryFilter === et
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                        : "border-slate-800 bg-slate-900 text-slate-400"
                    }`}
                  >
                    {et}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredGlossary.map((term) => {
                const st = ENTITY_STYLES[term.entityType] || {};
                return (
                  <div
                    key={term.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-100">{term.canonicalTerm}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {term.introducedInModule} · {term.source}
                      </span>
                    </div>
                    <span
                      className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                        st.badge || "border-slate-700 text-slate-300"
                      }`}
                    >
                      {term.entityType}
                    </span>
                    <p className="text-slate-300 leading-relaxed">{term.definition}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
