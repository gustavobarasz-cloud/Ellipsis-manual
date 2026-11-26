"use client";
import React, { useState, useMemo } from "react";

// ============================================================================
// M11: THE APERTURE & AGENCY SPECTRUM
// ============================================================================
export function M11Simulator() {
  const [narrowing, setNarrowing] = useState(65); // 0=Wide-Angle, 100=300mm Zoom
  const [voluntaryTrust, setVoluntaryTrust] = useState(75); // 0=Coercive, 100=Voluntary
  const [workingMemoryLoad, setWorkingMemoryLoad] = useState(35);

  const state = useMemo(() => {
    if (workingMemoryLoad >= 75) {
      return {
        zone: "COGNITIVE OVERLOAD FREEZE",
        tone: "border-amber-500/40 bg-amber-500/15 text-amber-300",
        reboundRisk: 88,
        note: "Working memory saturated (fixed gaze, slowed blinks, passive 'whatever works'). High risk of Rebound Scrutiny tomorrow—pause and decompress instead of extracting a fragile nod.",
      };
    }
    if (narrowing >= 50 && voluntaryTrust < 40) {
      return {
        zone: "FALSIFIED ZONE · MANCHURIAN-LORE FALLACY",
        tone: "border-rose-500/50 bg-rose-500/15 text-rose-300",
        reboundRisk: 96,
        note: "Involuntary covert trance / 'bypassing the critical factor' fails controlled testing. Threat-driven narrowing shrinks Autonomy Margin and triggers Persuasion-Radar Trip + Psychological Reactance.",
      };
    }
    if (narrowing >= 50 && voluntaryTrust >= 40) {
      return {
        zone: "COOPERATIVE ABSORPTION (ATTENTIONAL NARROWING)",
        tone: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
        reboundRisk: 14,
        note: "Low-threat single-channel narrative focus + subject-side Trait Suggestibility. Peripheral turf noise blurs out while the counterpart's executive veto remains fully online.",
      };
    }
    return {
      zone: "WIDE-ANGLE CENTRAL-ROUTE SCRUTINY",
      tone: "border-cyan-500/40 bg-cyan-500/15 text-cyan-300",
      reboundRisk: 10,
      note: "Broad aperture: subject is actively scanning exits, cross-checking spreadsheets, and auditing logical coherence.",
    };
  }, [narrowing, voluntaryTrust, workingMemoryLoad]);

  const apertureRadius = Math.max(14, 52 - (narrowing / 100) * 34);
  const dotX = 20 + (narrowing / 100) * 200;
  const dotY = 140 - (voluntaryTrust / 100) * 110;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-violet-400">
            M11 Interactive Lab · Edge States &amp; Epistemic Audit
          </span>
          <h4 className="text-base font-semibold text-slate-100">
            The Aperture &amp; Agency Spectrum
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono text-emerald-300">
            EXECUTIVE VETO: ALWAYS ONLINE
          </span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 items-center">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          <svg viewBox="0 0 240 160" className="w-full h-44">
            <rect x="20" y="20" width="100" height="60" fill="#06b6d4" fillOpacity="0.08" />
            <rect x="120" y="20" width="100" height="60" fill="#10b981" fillOpacity="0.11" />
            <rect x="20" y="80" width="100" height="60" fill="#f59e0b" fillOpacity="0.08" />
            <rect x="120" y="80" width="100" height="60" fill="#f43f5e" fillOpacity="0.14" />
            <line x1="120" y1="20" x2="120" y2="140" stroke="#334155" strokeDasharray="3 3" />
            <line x1="20" y1="80" x2="220" y2="80" stroke="#334155" strokeDasharray="3 3" />
            <text x="70" y="34" textAnchor="middle" fill="#67e8f9" fontSize="7.5" fontFamily="monospace">WIDE SCRUTINY</text>
            <text x="170" y="34" textAnchor="middle" fill="#6ee7b7" fontSize="7.5" fontFamily="monospace">COOPERATIVE ABSORPTION</text>
            <text x="70" y="132" textAnchor="middle" fill="#fcd34d" fontSize="7.5" fontFamily="monospace">OVERLOAD / FRICTION</text>
            <text x="170" y="128" textAnchor="middle" fill="#fda4af" fontSize="7.5" fontFamily="monospace">FALSIFIED ZONE</text>
            <text x="170" y="136" textAnchor="middle" fill="#fb7185" fontSize="6.5" fontFamily="monospace">(MANCHURIAN LORE)</text>
            <circle cx={dotX} cy={dotY} r={apertureRadius * 0.25} fill="#a78bfa" fillOpacity="0.22" stroke="#c4b5fd" strokeWidth="1" />
            <circle cx={dotX} cy={dotY} r="4" fill="#c4b5fd" stroke="#0f172a" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-xs">
          <div className={`rounded-md border px-2.5 py-1.5 font-mono text-[11px] ${state.tone}`}>
            {state.zone}
          </div>
          <div>
            <div className="flex justify-between font-mono text-slate-400">
              <span>Focal Narrowing (Wide → 300mm)</span>
              <span className="text-slate-200">{narrowing}%</span>
            </div>
            <input type="range" min={0} max={100} value={narrowing} onChange={(e) => setNarrowing(Number(e.target.value))} className="w-full accent-violet-400" />
          </div>
          <div>
            <div className="flex justify-between font-mono text-slate-400">
              <span>Voluntary Trust / Consent</span>
              <span className="text-emerald-300">{voluntaryTrust}%</span>
            </div>
            <input type="range" min={0} max={100} value={voluntaryTrust} onChange={(e) => setVoluntaryTrust(Number(e.target.value))} className="w-full accent-emerald-400" />
          </div>
          <div>
            <div className="flex justify-between font-mono text-slate-400">
              <span>Working-Memory Load / Fatigue</span>
              <span className={workingMemoryLoad >= 75 ? "text-amber-300" : "text-slate-200"}>{workingMemoryLoad}%</span>
            </div>
            <input type="range" min={0} max={100} value={workingMemoryLoad} onChange={(e) => setWorkingMemoryLoad(Number(e.target.value))} className="w-full accent-amber-400" />
          </div>
          <p className="text-slate-400 leading-relaxed">{state.note}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// M12: THE FULL-PIPELINE SAFEGUARD GOVERNOR
// ============================================================================
const PIPELINE_STAGES = [
  { id: "T1", label: "M01–M02", name: "Operator & Authority", color: "border-cyan-500/40 text-cyan-300" },
  { id: "T2", label: "M03–M04", name: "BToE & Facial Sensor", color: "border-cyan-500/40 text-cyan-300" },
  { id: "T3", label: "M05–M06", name: "Needs & FATE Engine", color: "border-amber-500/40 text-amber-300" },
  { id: "T4", label: "M07–M08", name: "6-Min Loop & Elicitation", color: "border-violet-500/40 text-violet-300" },
  { id: "T5", label: "M09–M10", name: "Priming & Compliance", color: "border-emerald-500/40 text-emerald-300" },
  { id: "T6", label: "M11–M12", name: "Evergreen Safeguard", color: "border-emerald-400/60 text-emerald-200" },
];

export function M12Simulator() {
  const [horizon, setHorizon] = useState("multi"); // oneshot | multi
  const [safeguardOn, setSafeguardOn] = useState(true);
  const [paternalisticUrge, setPaternalisticUrge] = useState(false);
  const [constraintVerified, setConstraintVerified] = useState(true);

  const trustIndex = useMemo(() => {
    if (!safeguardOn || paternalisticUrge) {
      return horizon === "multi" ? 22 : 58;
    }
    return horizon === "multi" ? 94 : 82;
  }, [horizon, safeguardOn, paternalisticUrge]);

  const decayLagWarning = horizon === "multi" && (!safeguardOn || paternalisticUrge);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
            M12 Interactive Lab · Closing Governor
          </span>
          <h4 className="text-base font-semibold text-slate-100">
            The Full-Pipeline Safeguard Governor
          </h4>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-mono ${
            trustIndex >= 75
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
              : "border-rose-500/40 bg-rose-500/15 text-rose-300"
          }`}
        >
          TRUST &amp; AGENCY INDEX: {trustIndex}%
        </span>
      </div>

      {/* 6-Tier Pipeline Strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {PIPELINE_STAGES.map((st) => (
          <div
            key={st.id}
            className={`rounded-lg border bg-slate-900/60 p-2 text-center ${
              decayLagWarning && st.id === "T6"
                ? "border-rose-500/60 text-rose-300"
                : st.color
            }`}
          >
            <div className="text-[10px] font-mono opacity-75">{st.label}</div>
            <div className="text-[11px] font-medium mt-0.5 leading-tight">{st.name}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-xs">
        <button
          onClick={() => setHorizon((h) => (h === "multi" ? "oneshot" : "multi"))}
          className="rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-left font-mono text-slate-200"
        >
          <div className="text-[10px] text-slate-400">INTERACTION HORIZON</div>
          <div>{horizon === "multi" ? "MULTI-CYCLE NETWORK" : "1-SHOT ENCOUNTER"}</div>
        </button>
        <button
          onClick={() => setSafeguardOn((v) => !v)}
          className={`rounded-lg border p-2.5 text-left font-mono ${
            safeguardOn ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-rose-500/40 bg-rose-500/10 text-rose-300"
          }`}
        >
          <div className="text-[10px] text-slate-400">EVERGREEN SAFEGUARD</div>
          <div>{safeguardOn ? "STEWARDSHIP LOCKED" : "PRESSURE SHORTCUT"}</div>
        </button>
        <button
          onClick={() => setPaternalisticUrge((v) => !v)}
          className={`rounded-lg border p-2.5 text-left font-mono ${
            paternalisticUrge ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-slate-700 bg-slate-900 text-slate-400"
          }`}
        >
          <div className="text-[10px] text-slate-400">OPERATOR DRIFT CHECK</div>
          <div>{paternalisticUrge ? "PATERNALISTIC OVERRIDE" : "AGENCY RESPECTED"}</div>
        </button>
        <button
          onClick={() => setConstraintVerified((v) => !v)}
          className={`rounded-lg border p-2.5 text-left font-mono ${
            constraintVerified ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" : "border-amber-500/40 bg-amber-500/10 text-amber-300"
          }`}
        >
          <div className="text-[10px] text-slate-400">COUNTER-DEFENSE</div>
          <div>{constraintVerified ? "CONSTRAINT VERIFIED" : "REFLEXIVE REJECTION"}</div>
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        {decayLagWarning
          ? "Trust-Decay Lag triggered: polite rooms conceal detection, then quietly withdraw referrals and candor across future cycles. Even well-intentioned Paternalistic Override erodes iterated trust."
          : !constraintVerified
          ? "Warning: Deploying Counter-Manipulation Inoculation without a 10-second Constraint Verification risks walking away from legitimate, verifiable external deadlines."
          : "Full pipeline balanced (Sensor -> Interpreter -> Actuator -> Safeguard). Consistent Evergreen stewardship compounds into a long-term trust moat."}
      </p>
    </div>
  );
}
