"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CURRICULUM_TIERS, ALL_MODULES, ALL_L2_HOOKS } from "@/data";
import type { MechanicSection } from "@/types/curriculum";
import type { ManualId } from "@/data/dojo";
import PracticeView from "@/components/PracticeView";
import FieldView, { type FieldTab } from "@/components/FieldView";
import ModuleConnections from "@/components/ModuleConnections";

type Section = "learn" | "practice" | "field";

const SECTIONS: Array<{ id: Section; label: string; hint: string }> = [
  { id: "learn", label: "Learn", hint: "12 modules" },
  { id: "practice", label: "Practice", hint: "Dojo & Sanctuary" },
  { id: "field", label: "Field", hint: "The Pit" },
];

const SECTION_KEY = "ellipsis-v2-section";
const MANUAL_KEY = "ellipsis-v2-manual";

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={keyIdx++} className="font-semibold text-stone-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={keyIdx++} className="italic text-stone-800">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={keyIdx++}
          className="rounded bg-stone-200/80 px-1.5 py-0.5 font-mono text-[0.85em] text-stone-800"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function ProseRenderer({ blocks }: { blocks: string[] }) {
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const line = blocks[i];

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < blocks.length && blocks[i].startsWith("- ")) {
        items.push(blocks[i].slice(2));
        i++;
      }
      elements.push(
        <ul
          key={`ul-${i}`}
          className="my-4 space-y-2.5 border-l-2 border-stone-300/80 pl-5 text-[1.03rem] leading-relaxed text-stone-700"
        >
          {items.map((item, idx) => (
            <li key={idx} className="relative">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < blocks.length && /^\d+\.\s/.test(blocks[i])) {
        items.push(blocks[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol
          key={`ol-${i}`}
          className="my-4 list-decimal space-y-2.5 pl-6 text-[1.03rem] leading-relaxed text-stone-700 marker:font-semibold marker:text-amber-900"
        >
          {items.map((item, idx) => (
            <li key={idx} className="pl-1">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    elements.push(
      <p
        key={`p-${i}`}
        className="mb-4 text-[1.05rem] leading-[1.82] text-stone-700 last:mb-0"
      >
        {renderInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

function MechanicCard({
  section,
  index,
  copiedHook,
  onCopyHook,
}: {
  section: MechanicSection;
  index: number;
  copiedHook: string | null;
  onCopyHook: (hookId: string) => void;
}) {
  return (
    <section
      id={section.l2Hook}
      className="scroll-mt-24 rounded-xl border border-stone-200/90 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-amber-800">
            Causal Chain 0{index + 1}
          </span>
          <h3 className="mt-1 font-serif text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
            {section.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onCopyHook(section.l2Hook)}
          title="Copy L2-Hook anchor ID"
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-50 px-3 py-1 font-mono text-[11px] font-medium text-stone-700 transition hover:border-amber-700 hover:bg-amber-50 hover:text-amber-900"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-700" />
          {copiedHook === section.l2Hook ? "Copied!" : section.l2Hook}
        </button>
      </div>

      <ProseRenderer blocks={section.prose} />

      {section.comparisonTable && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-100/90">
                {section.comparisonTable.headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 font-semibold text-stone-900"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white">
              {section.comparisonTable.rows.map((row, rIdx) => (
                <tr key={rIdx} className="align-top">
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-4 py-3 leading-relaxed ${
                        cIdx === 0
                          ? "font-medium text-stone-900"
                          : "text-stone-700"
                      }`}
                    >
                      {renderInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function CurriculumApp() {
  const [activeModuleId, setActiveModuleId] = useState<string>("M01");
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showHooksModal, setShowHooksModal] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [copiedHook, setCopiedHook] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("learn");
  const [activeManualId, setActiveManualId] = useState<ManualId>("white");
  const [fieldTab, setFieldTab] = useState<FieldTab>("codex");
  const [codexSearch, setCodexSearch] = useState<string>("");
  const [pmModuleId, setPmModuleId] = useState<string>("M01");

  useEffect(() => {
    try {
      const savedSection = localStorage.getItem(SECTION_KEY);
      if (savedSection === "learn" || savedSection === "practice" || savedSection === "field") {
        setSection(savedSection);
      }
      const savedManual = localStorage.getItem(MANUAL_KEY);
      if (
        savedManual === "white" ||
        savedManual === "blue" ||
        savedManual === "brown" ||
        savedManual === "black" ||
        savedManual === "sanctuary"
      ) {
        setActiveManualId(savedManual);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const goToSection = (next: Section) => {
    setSection(next);
    setMobileNavOpen(false);
    try {
      localStorage.setItem(SECTION_KEY, next);
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
  };

  const openManual = (id: ManualId) => {
    setActiveManualId(id);
    try {
      localStorage.setItem(MANUAL_KEY, id);
    } catch {
      // ignore
    }
    goToSection("practice");
  };

  const openCodex = (search: string) => {
    setCodexSearch(search);
    setFieldTab("codex");
    goToSection("field");
  };

  const logPostMortem = (moduleId: string) => {
    setPmModuleId(moduleId);
    setFieldTab("postmortem");
    goToSection("field");
  };

  const openModule = (id: string) => {
    setActiveModuleId(id);
    goToSection("learn");
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bi-curriculum-completed");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCompletedIds(parsed);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleCompleted = (moduleId: string) => {
    setCompletedIds((prev) => {
      const next = prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId];
      try {
        localStorage.setItem("bi-curriculum-completed", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleCopyHook = (hookId: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`[L2-HOOK:${hookId}]`).catch(() => {});
    }
    setCopiedHook(hookId);
    setTimeout(() => setCopiedHook(null), 1600);
  };

  const activeIndex = useMemo(
    () => ALL_MODULES.findIndex((m) => m.id === activeModuleId),
    [activeModuleId]
  );

  const activeModule = ALL_MODULES[activeIndex] ?? ALL_MODULES[0];
  const prevModule = activeIndex > 0 ? ALL_MODULES[activeIndex - 1] : null;
  const nextModule =
    activeIndex < ALL_MODULES.length - 1 ? ALL_MODULES[activeIndex + 1] : null;

  const filteredTiers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CURRICULUM_TIERS;
    return CURRICULUM_TIERS.map((tier) => ({
      ...tier,
      modules: tier.modules.filter((mod) => {
        const haystack = [
          mod.id,
          mod.title,
          mod.mentalModel.name,
          ...mod.mentalModel.prose,
          ...mod.mechanics.flatMap((m) => [m.title, m.l2Hook, ...m.prose]),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      }),
    })).filter((tier) => tier.modules.length > 0);
  }, [searchQuery]);

  const selectModule = (id: string) => {
    setActiveModuleId(id);
    setMobileNavOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const progressPct = Math.round((completedIds.length / ALL_MODULES.length) * 100);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-stone-200/90 bg-[#FAF8F5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {section === "learn" && (
              <button
                type="button"
                onClick={() => setMobileNavOpen((v) => !v)}
                className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 lg:hidden"
              >
                {mobileNavOpen ? "Close" : "Modules"}
              </button>
            )}
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-800">
                The Ellipsis Manual · v2
              </p>
              <h1 className="font-serif text-lg font-semibold tracking-tight text-stone-900 sm:text-xl">
                Behavioral Intelligence &amp; Influence
              </h1>
            </div>
          </div>

          <nav
            aria-label="Sections"
            className="hidden items-center gap-1 rounded-xl border border-stone-200 bg-white p-1 lg:flex"
          >
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => goToSection(sec.id)}
                aria-current={section === sec.id ? "page" : undefined}
                className={`flex items-baseline gap-2 rounded-lg px-4 py-1.5 text-sm transition ${
                  section === sec.id
                    ? "bg-stone-900 text-stone-50"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <span className="font-semibold">{sec.label}</span>
                <span
                  className={`hidden font-mono text-[10px] xl:inline ${
                    section === sec.id ? "text-amber-300" : "text-stone-400"
                  }`}
                >
                  {sec.hint}
                </span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full bg-amber-800 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="font-mono text-xs text-stone-600">
                {completedIds.length}/{ALL_MODULES.length}
              </span>
            </div>

            {section === "learn" && (
              <button
                type="button"
                onClick={() => setShowHooksModal((v) => !v)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 font-mono text-xs font-medium text-stone-700 transition hover:border-amber-800 hover:text-amber-900"
              >
                L2 Hooks ({ALL_L2_HOOKS.length})
              </button>
            )}
          </div>
        </div>

        {/* Section switcher (phones and tablets) */}
        <nav
          aria-label="Sections"
          className="grid grid-cols-3 gap-1 border-t border-stone-200/90 px-4 py-2 sm:px-6 lg:hidden"
        >
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => goToSection(sec.id)}
              aria-current={section === sec.id ? "page" : undefined}
              className={`rounded-lg px-2 py-1.5 text-center transition ${
                section === sec.id
                  ? "bg-stone-900 text-stone-50"
                  : "border border-stone-200 bg-white text-stone-700"
              }`}
            >
              <span className="block text-sm font-semibold leading-tight">
                {sec.label}
              </span>
              <span
                className={`block font-mono text-[10px] leading-tight ${
                  section === sec.id ? "text-amber-300" : "text-stone-400"
                }`}
              >
                {sec.hint}
              </span>
            </button>
          ))}
        </nav>
      </header>

      {section === "practice" && (
        <PracticeView
          activeManualId={activeManualId}
          onSelectManual={openManual}
          onOpenModule={openModule}
        />
      )}

      {section === "field" && (
        <FieldView
          tab={fieldTab}
          onTabChange={setFieldTab}
          codexSearch={codexSearch}
          postMortemModuleId={pmModuleId}
        />
      )}

      {section === "learn" && (

      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        {/* Sidebar */}
        <aside
          className={`${
            mobileNavOpen ? "block" : "hidden"
          } w-full shrink-0 border-b border-stone-200 bg-[#F5F2EC] p-4 lg:sticky lg:top-[61px] lg:block lg:h-[calc(100vh-61px)] lg:w-80 lg:overflow-y-auto lg:border-b-0 lg:border-r`}
        >
          <div className="mb-4">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, modules, L2 hooks..."
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-800 focus:outline-none"
            />
          </div>

          <nav className="space-y-5">
            {filteredTiers.map((tier) => (
              <div key={tier.tierId}>
                <div className="mb-2 px-1">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-900">
                    Tier 0{tier.tierNumber}
                  </span>
                  <p className="text-xs font-semibold text-stone-800">
                    {tier.title}
                  </p>
                </div>
                <ul className="space-y-1">
                  {tier.modules.map((mod) => {
                    const isActive = mod.id === activeModule.id;
                    const isDone = completedIds.includes(mod.id);
                    return (
                      <li key={mod.id}>
                        <button
                          type="button"
                          onClick={() => selectModule(mod.id)}
                          className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                            isActive
                              ? "bg-stone-900 text-stone-50 shadow-sm"
                              : "text-stone-700 hover:bg-stone-200/70"
                          }`}
                        >
                          <span
                            className={`mt-0.5 shrink-0 font-mono text-[11px] font-semibold ${
                              isActive ? "text-amber-300" : "text-stone-500"
                            }`}
                          >
                            {mod.id}
                          </span>
                          <span className="flex-1 leading-snug">{mod.title}</span>
                          {isDone && (
                            <span
                              className={`mt-0.5 text-xs ${
                                isActive ? "text-emerald-300" : "text-emerald-700"
                              }`}
                              aria-label="Completed"
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {filteredTiers.length === 0 && (
              <p className="px-2 text-sm text-stone-500">
                No modules match &ldquo;{searchQuery}&rdquo;.
              </p>
            )}
          </nav>
        </aside>

        {/* Main Reading Column */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
          <article className="mx-auto max-w-3xl">
            {/* Module Header */}
            <div className="mb-8 border-b border-stone-200 pb-6">
              <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-xs text-amber-900">
                <span className="rounded bg-amber-100/80 px-2 py-0.5 font-semibold">
                  TIER 0{activeModule.tierNumber}
                </span>
                <span className="text-stone-400">/</span>
                <span className="font-semibold">{activeModule.id}</span>
                <span className="text-stone-400">·</span>
                <span className="text-stone-600">{activeModule.tierTitle}</span>
              </div>

              <h2 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                {activeModule.title}
              </h2>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span className="font-medium text-stone-600">Sources:</span>
                  {activeModule.sources.map((src) => (
                    <span
                      key={src}
                      className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 italic text-stone-700"
                    >
                      {src}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => toggleCompleted(activeModule.id)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                    completedIds.includes(activeModule.id)
                      ? "bg-emerald-800 text-white hover:bg-emerald-900"
                      : "border border-stone-300 bg-white text-stone-700 hover:border-stone-900 hover:text-stone-900"
                  }`}
                >
                  {completedIds.includes(activeModule.id)
                    ? "✓ Completed"
                    : "Mark Module Complete"}
                </button>
              </div>
            </div>

            {/* Overarching Mental Model */}
            <section className="mb-10 rounded-xl border border-amber-900/20 bg-gradient-to-br from-[#FFFDF9] to-[#F7F1E6] p-6 shadow-sm sm:p-8">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-900">
                Overarching Mental Model
              </p>
              <h3 className="mt-1 mb-5 font-serif text-2xl font-semibold italic text-stone-900">
                {activeModule.mentalModel.name}
              </h3>
              <ProseRenderer blocks={activeModule.mentalModel.prose} />
            </section>

            {/* Granular Mechanics & Cause-and-Effect Chains */}
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-stone-500">
                Granular Mechanics &amp; Cause-and-Effect Chains
              </h3>
              <span className="font-mono text-xs text-stone-400">
                {activeModule.mechanics.length} L2-Hook Anchors
              </span>
            </div>

            <div className="space-y-6">
              {activeModule.mechanics.map((sec, idx) => (
                <MechanicCard
                  key={sec.l2Hook}
                  section={sec}
                  index={idx}
                  copiedHook={copiedHook}
                  onCopyHook={handleCopyHook}
                />
              ))}
            </div>

            <ModuleConnections
              moduleId={activeModule.id}
              onOpenManual={openManual}
              onOpenCodex={openCodex}
              onLogPostMortem={logPostMortem}
            />

            {/* Prev / Next Footer */}
            <footer className="mt-12 flex items-center justify-between gap-4 border-t border-stone-200 pt-6">
              {prevModule ? (
                <button
                  type="button"
                  onClick={() => selectModule(prevModule.id)}
                  className="group max-w-[48%] rounded-xl border border-stone-200 bg-white px-4 py-3 text-left transition hover:border-stone-400"
                >
                  <span className="block font-mono text-[11px] text-stone-500">
                    ← Previous ({prevModule.id})
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-medium text-stone-900 group-hover:text-amber-900">
                    {prevModule.title}
                  </span>
                </button>
              ) : (
                <div />
              )}

              {nextModule ? (
                <button
                  type="button"
                  onClick={() => selectModule(nextModule.id)}
                  className="group max-w-[48%] rounded-xl border border-stone-200 bg-white px-4 py-3 text-right transition hover:border-stone-400"
                >
                  <span className="block font-mono text-[11px] text-stone-500">
                    Next ({nextModule.id}) →
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-medium text-stone-900 group-hover:text-amber-900">
                    {nextModule.title}
                  </span>
                </button>
              ) : (
                <div className="font-mono text-xs text-stone-500">
                  End of Curriculum (M12)
                </div>
              )}
            </footer>
          </article>
        </main>
      </div>
      )}

      {/* L2-Hook Index Modal */}
      {showHooksModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-sm"
          onClick={() => setShowHooksModal(false)}
        >
          <div
            className="max-h-[82vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <div>
                <h3 className="font-serif text-xl font-semibold text-stone-900">
                  Layer 2 Integration Hook Registry
                </h3>
                <p className="text-xs text-stone-500">
                  36 canonical <code>[L2-HOOK]</code> anchors across Modules 01–12.
                  Click any anchor to jump directly to its section.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHooksModal(false)}
                className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Close
              </button>
            </div>
            <div className="max-h-[65vh] divide-y divide-stone-100 overflow-y-auto px-6 py-2">
              {ALL_L2_HOOKS.map((item) => (
                <button
                  key={item.hookId}
                  type="button"
                  onClick={() => {
                    setActiveModuleId(item.moduleId);
                    setShowHooksModal(false);
                    setTimeout(() => {
                      const el = document.getElementById(item.hookId);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }, 80);
                  }}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left transition hover:bg-stone-50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-amber-900">
                        {item.moduleId}
                      </span>
                      <span className="truncate text-sm font-medium text-stone-900">
                        {item.sectionTitle}
                      </span>
                    </div>
                    <p className="truncate text-xs text-stone-500">
                      {item.moduleTitle}
                    </p>
                  </div>
                  <code className="shrink-0 rounded bg-stone-100 px-2 py-0.5 font-mono text-[11px] text-stone-700">
                    {item.hookId}
                  </code>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
