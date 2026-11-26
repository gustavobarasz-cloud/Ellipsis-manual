"use client";
import React, { useState, useEffect } from "react";
import { INITIAL_PIT_CODEX, PIT_STAGES } from "../../data/pitAddendum";

const CODEX_STORAGE_KEY = "bi_workstation_pit_codex_v1";
const PM_STORAGE_KEY = "bi_workstation_pit_postmortems_v1";

export function PitCodexView({ initialSearch = "" }) {
  const [codex, setCodex] = useState(INITIAL_PIT_CODEX);
  const [query, setQuery] = useState(initialSearch);
  const [stageFilter, setStageFilter] = useState("ALL");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    stage: "brown",
    range: "moderate",
    context: "",
    harm: "",
    remedy: "",
    ethicalUse: "",
    yourTemptation: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CODEX_STORAGE_KEY);
      if (saved) setCodex(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (initialSearch) setQuery(initialSearch);
  }, [initialSearch]);

  const persist = (next) => {
    setCodex(next);
    try {
      localStorage.setItem(CODEX_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    const nextCard = {
      id: `PIT-${String(codex.length + 1).padStart(2, "0")}`,
      name: draft.name.trim(),
      stage: draft.stage,
      range: draft.range,
      sixFields: {
        context: draft.context || "High-stakes room.",
        harm: draft.harm || "Distorts clarity or leverage.",
        remedy: draft.remedy || "Break tempo and hold boundary.",
        ethicalUse: draft.ethicalUse || "Transparent equivalent.",
        yourTemptation: draft.yourTemptation || "Using sharp framing to win fast.",
      },
    };
    persist([nextCard, ...codex]);
    setDraft({ name: "", stage: "brown", range: "moderate", context: "", harm: "", remedy: "", ethicalUse: "", yourTemptation: "" });
    setAdding(false);
  };

  const filtered = codex.filter((c) => {
    if (stageFilter !== "ALL" && c.stage !== stageFilter) return false;
    if (!query.trim()) return true;
    return JSON.stringify(c).toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-rose-400">
            The Pit · Reflexive Operator Audit
          </span>
          <h2 className="text-2xl font-bold text-slate-100 mt-1">
            6-Field Asymmetric Codex ({codex.length})
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tactic, remedy, temptation..."
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 w-56"
          />
          <button
            onClick={() => setAdding((v) => !v)}
            className="rounded-lg border border-rose-500/50 bg-rose-500/20 px-3 py-1.5 font-mono text-xs text-rose-200 hover:bg-rose-500/30"
          >
            {adding ? "Cancel" : "+ Add Card"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
        {["ALL", "white", "blue", "brown", "black"].map((st) => (
          <button
            key={st}
            onClick={() => setStageFilter(st)}
            className={`rounded border px-2.5 py-1 uppercase ${
              stageFilter === st
                ? "border-rose-400 bg-rose-500/20 text-rose-200"
                : "border-slate-800 bg-slate-900 text-slate-400"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="rounded-xl border border-rose-500/40 bg-slate-900/70 p-4 grid gap-3 sm:grid-cols-2 text-xs">
          <input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Mechanic Name" className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" />
          <div className="flex gap-2">
            <select value={draft.stage} onChange={(e) => setDraft({ ...draft, stage: e.target.value })} className="flex-1 rounded border border-slate-700 bg-slate-950 px-2 py-2 text-slate-100">
              <option value="white">White (Telemetry)</option>
              <option value="blue">Blue (Profiling)</option>
              <option value="brown">Brown (Syntax)</option>
              <option value="black">Black (Chains)</option>
            </select>
            <select value={draft.range} onChange={(e) => setDraft({ ...draft, range: e.target.value })} className="flex-1 rounded border border-slate-700 bg-slate-950 px-2 py-2 text-slate-100">
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
          <input value={draft.context} onChange={(e) => setDraft({ ...draft, context: e.target.value })} placeholder="1. Context" className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" />
          <input value={draft.harm} onChange={(e) => setDraft({ ...draft, harm: e.target.value })} placeholder="3. Harm" className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" />
          <input value={draft.remedy} onChange={(e) => setDraft({ ...draft, remedy: e.target.value })} placeholder="4. Remedy" className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" />
          <input value={draft.ethicalUse} onChange={(e) => setDraft({ ...draft, ethicalUse: e.target.value })} placeholder="5. Ethical Use" className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" />
          <input value={draft.yourTemptation} onChange={(e) => setDraft({ ...draft, yourTemptation: e.target.value })} placeholder="6. Your Temptation" className="sm:col-span-2 rounded border border-rose-500/40 bg-slate-950 px-3 py-2 text-slate-100" />
          <button type="submit" className="sm:col-span-2 rounded bg-rose-600 py-2 font-mono font-bold text-white hover:bg-rose-500">
            Save 6-Field Codex Card
          </button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((c) => {
          const st = PIT_STAGES[c.stage] || PIT_STAGES.white;
          return (
            <div key={c.id} className="rounded-xl border border-slate-800 border-l-4 border-l-rose-500 bg-slate-900/50 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                <span className="text-rose-300 font-bold">{c.id} · {st.label}</span>
                <span className="rounded border border-slate-700 bg-slate-950 px-2 py-0.5 uppercase text-slate-300">{c.range}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-100">{c.name}</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded border border-slate-800 bg-slate-950/70 p-2"><b className="block font-mono text-[10px] text-slate-400">1. CONTEXT</b>{c.sixFields.context}</div>
                <div className="rounded border border-slate-800 bg-slate-950/70 p-2"><b className="block font-mono text-[10px] text-slate-400">3. HARM</b>{c.sixFields.harm}</div>
                <div className="rounded border border-slate-800 bg-slate-950/70 p-2"><b className="block font-mono text-[10px] text-emerald-400">4. REMEDY</b>{c.sixFields.remedy}</div>
                <div className="rounded border border-slate-800 bg-slate-950/70 p-2"><b className="block font-mono text-[10px] text-cyan-400">5. ETHICAL USE</b>{c.sixFields.ethicalUse}</div>
                <div className="sm:col-span-2 rounded border border-rose-500/30 bg-rose-500/10 p-2"><b className="block font-mono text-[10px] text-rose-300">6. YOUR TEMPTATION</b>{c.sixFields.yourTemptation}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PitPostMortemView({ prefillModuleId = "M01" }) {
  const [logs, setLogs] = useState([
    {
      id: "PM-01",
      moduleId: "M08",
      timestamp: "Initial Seed",
      room: "Vendor scope & timeline renewal call",
      signal: "Deliberate misstatement on internal Q4 buffer + rapid follow-up.",
      counterMove: "Held 2s silence, answered narrowly, left side error uncorrected.",
      temptation: "Caught strong precision reflex to correct their wrong number; stayed still.",
    },
  ]);
  const [form, setForm] = useState({
    moduleId: prefillModuleId,
    room: "",
    signal: "",
    counterMove: "",
    temptation: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PM_STORAGE_KEY);
      if (saved) setLogs(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (prefillModuleId) setForm((f) => ({ ...f, moduleId: prefillModuleId }));
  }, [prefillModuleId]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.room.trim() && !form.signal.trim()) return;
    const entry = {
      id: `PM-${String(logs.length + 1).padStart(2, "0")}`,
      moduleId: form.moduleId,
      timestamp: new Date().toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      room: form.room || "Live encounter",
      signal: form.signal || "(No signal logged)",
      counterMove: form.counterMove || "(No counter-move logged)",
      temptation: form.temptation || "(None logged)",
    };
    const next = [entry, ...logs];
    setLogs(next);
    try {
      localStorage.setItem(PM_STORAGE_KEY, JSON.stringify(next));
    } catch {}
    setForm({ moduleId: prefillModuleId, room: "", signal: "", counterMove: "", temptation: "" });
  };

  return (
    <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-2 pb-16">
      <form onSubmit={handleSave} className="rounded-xl border border-slate-800 border-t-4 border-t-lime-400 bg-slate-900/50 p-5 space-y-3 text-xs h-fit">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-lime-400">
            Live Fieldwork Debrief
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5">Log Field Post-Mortem</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-mono text-[10px] text-slate-400 mb-1">LINKED MODULE</label>
            <select value={form.moduleId} onChange={(e) => setForm({ ...form, moduleId: e.target.value })} className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 text-slate-100 font-mono">
              {["M01","M02","M03","M04","M05","M06","M07","M08","M09","M10","M11","M12"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] text-slate-400 mb-1">ROOM / CONTEXT</label>
            <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Interview, vendor call, consulate..." className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 text-slate-100" />
          </div>
        </div>
        <div>
          <label className="block font-mono text-[10px] text-slate-400 mb-1">SIGNAL / CLUSTER / SYNTAX TRAP OBSERVED</label>
          <input value={form.signal} onChange={(e) => setForm({ ...form, signal: e.target.value })} placeholder="What cue, bait, or compliance step fired?" className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 text-slate-100" />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-slate-400 mb-1">COUNTER-MOVE / BREAK-LINE EXECUTED</label>
          <input value={form.counterMove} onChange={(e) => setForm({ ...form, counterMove: e.target.value })} placeholder="What exact move or silence hold did you run?" className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 text-slate-100" />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-rose-300 mb-1">OPERATOR'S SHADOW / SELF-TEMPTATION</label>
          <textarea value={form.temptation} onChange={(e) => setForm({ ...form, temptation: e.target.value })} rows={3} placeholder="What temptation came up in you (over-explaining, correcting, brittle stillness)?" className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-2 text-slate-100" />
        </div>
        <button type="submit" className="w-full rounded-lg bg-lime-400 py-2 font-mono font-bold text-slate-950 hover:bg-lime-300">
          Save Post-Mortem Entry
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs uppercase tracking-widest text-slate-400">
            Logged Encounters ({logs.length})
          </h3>
        </div>
        {logs.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-800 border-l-4 border-l-lime-400 bg-slate-900/50 p-4 space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span className="text-lime-300 font-bold">{item.id} · {item.moduleId}</span>
              <span>{item.timestamp}</span>
            </div>
            <div className="font-semibold text-slate-100">{item.room}</div>
            <div><b className="font-mono text-[10px] text-amber-400">SIGNAL: </b><span className="text-slate-300">{item.signal}</span></div>
            <div><b className="font-mono text-[10px] text-cyan-400">COUNTER: </b><span className="text-slate-200">{item.counterMove}</span></div>
            <div><b className="font-mono text-[10px] text-rose-300">SHADOW: </b><span className="text-slate-300">{item.temptation}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
