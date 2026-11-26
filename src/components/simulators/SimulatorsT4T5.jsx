"use client";
import React, { useState, useMemo } from "react";

// ============================================================================
// M07: THE SIX-MINUTE SONAR PLOT
// ============================================================================
export function M07Simulator() {
  const [elapsed, setElapsed] = useState(3.2);
  const [roleFilter, setRoleFilter] = useState(true);
  const [pingGapSec, setPingGapSec] = useState(55);
  const [echoResult, setEchoResult] = useState("disconfirm"); // confirm | disconfirm | flat

  const isVisual = elapsed <= 2.0;
  const pingStacking = !isVisual && pingGapSec < 45;

  const status = useMemo(() => {
    if (isVisual) {
      return {
        phase: "VISUAL PHASE (0:00-2:00)",
        confidence: roleFilter ? 30 : 65,
        label: roleFilter ? "PROVISIONAL BRACKET (CAPPED <35%)" : "ROLE-SCRIPT ARTIFACT OVERCONFIDENCE",
        tone: roleFilter
          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
          : "border-rose-500/40 bg-rose-500/10 text-rose-300",
        note: roleFilter
          ? "Role-script cues filtered out. Holding 2-candidate bracket (Intelligence vs. Strength/Power) until Verbal Phase."
          : "Warning: Luxury watch & briskness scored as personal ego hunger instead of institutional role script.",
      };
    }
    if (pingStacking) {
      return {
        phase: "VERBAL PHASE (2:00-6:00)",
        confidence: 25,
        label: "PING-STACKING CONTAMINATION",
        tone: "border-rose-500/40 bg-rose-500/10 text-rose-300",
        note: `Ping gap (${pingGapSec}s) < 45s Autonomic Decay Lag. Residual echo from Ping 2 is corrupting Ping 3.`,
      };
    }
    if (echoResult === "confirm") {
      return {
        phase: "VERBAL PHASE (2:00-6:00)",
        confidence: 78,
        label: "HYPOTHESIS CONFIRMED (2 ECHOES)",
        tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
        note: "Two independent spaced pings confirmed Strength/Power + Authority. Live radar track locked cleanly.",
      };
    }
    if (echoResult === "disconfirm") {
      return {
        phase: "VERBAL PHASE (2:00-6:00)",
        confidence: 68,
        label: "CONFIRMATION LOCK BROKEN -> RE-PLOTTED",
        tone: "border-amber-500/40 bg-amber-500/10 text-amber-300",
        note: "Initial bracket falsified at Minute 3. Erased Visual sketch and pivoted cleanly to Acceptance / Tribe.",
      };
    }
    return {
      phase: "VERBAL PHASE (2:00-6:00)",
      confidence: 35,
      label: "INDETERMINATE HOLD (UNLOCKED)",
      tone: "border-violet-500/40 bg-violet-500/10 text-violet-300",
      note: "Polished, low-amplitude echoes returned. Profile deliberately held unlocked rather than forcing a coin flip.",
    };
  }, [isVisual, roleFilter, pingStacking, pingGapSec, echoResult]);

  const sweepAngle = -90 + (elapsed / 6) * 360;
  const rad = (sweepAngle * Math.PI) / 180;
  const tipX = 90 + Math.cos(rad) * 68;
  const tipY = 90 + Math.sin(rad) * 68;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
            M07 Interactive Lab · Rapid Integration
          </span>
          <h4 className="text-base font-semibold text-slate-100">
            The Six-Minute Sonar Plot
          </h4>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-mono ${status.tone}`}>
          {status.label}
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 items-center">
        <div className="flex justify-center rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          <svg viewBox="0 0 180 180" className="h-44 w-44">
            <circle cx="90" cy="90" r="70" fill="#020617" stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="90" cy="90" r="46" fill="none" stroke="#1e293b" strokeDasharray="3 3" />
            <circle cx="90" cy="90" r="22" fill="none" stroke="#1e293b" strokeDasharray="2 2" />
            {/* Visual Phase Arc (0-2m = 120 deg) */}
            <path d="M 90 20 A 70 70 0 0 1 150.6 125" fill="none" stroke="#22d3ee" strokeWidth="5" strokeOpacity="0.65" />
            {/* Verbal Phase Arc (2-6m = 240 deg) */}
            <path d="M 150.6 125 A 70 70 0 1 1 90 20" fill="none" stroke="#10b981" strokeWidth="5" strokeOpacity="0.55" />
            {/* Sweep hand */}
            <line x1="90" y1="90" x2={tipX} y2={tipY} stroke="#e2e8f0" strokeWidth="2" />
            <circle cx="90" cy="90" r="4" fill="#38bdf8" />
            {/* Target blips */}
            <circle
              cx={echoResult === "disconfirm" ? 56 : 122}
              cy={echoResult === "disconfirm" ? 64 : 74}
              r="5"
              fill={pingStacking ? "#fb7185" : echoResult === "flat" ? "#a78bfa" : "#34d399"}
            />
            <text x="90" y="174" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
              {status.phase} · {elapsed.toFixed(1)}m
            </text>
          </svg>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-xs">
          <div>
            <div className="flex justify-between font-mono text-slate-400">
              <span>Elapsed Time (0-2m Visual / 2-6m Verbal)</span>
              <span className="text-slate-200">{elapsed.toFixed(1)} min</span>
            </div>
            <input type="range" min={0} max={6} step={0.2} value={elapsed} onChange={(e) => setElapsed(Number(e.target.value))} className="w-full accent-cyan-400" />
          </div>

          <div>
            <div className="flex justify-between font-mono text-slate-400">
              <span>Inter-Ping Runway (Min 45s)</span>
              <span className={pingGapSec < 45 ? "text-rose-300" : "text-emerald-300"}>{pingGapSec}s</span>
            </div>
            <input type="range" min={10} max={90} step={5} value={pingGapSec} onChange={(e) => setPingGapSec(Number(e.target.value))} className="w-full accent-emerald-400" />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-slate-400">Role-Script Filter</span>
            <button
              onClick={() => setRoleFilter((v) => !v)}
              className={`rounded border px-2.5 py-1 font-mono ${
                roleFilter ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-200" : "border-rose-500/40 bg-rose-500/15 text-rose-200"
              }`}
            >
              {roleFilter ? "ACTIVE" : "OFF (RAW CUES)"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              ["confirm", "Confirm Echo"],
              ["disconfirm", "Disconfirm"],
              ["flat", "Flat / Polished"],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setEchoResult(k)}
                className={`rounded border px-2 py-1.5 font-mono text-[11px] ${
                  echoResult === k
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                    : "border-slate-700 bg-slate-950 text-slate-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-slate-400 leading-relaxed">{status.note}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// M08: THE VAULT PRESSURE EQUALIZER
// ============================================================================
export function M08Simulator() {
  const [promptStyle, setPromptStyle] = useState("understatement"); // direct | understatement | normalization
  const [credibilityAboveFloor, setCredibilityAboveFloor] = useState(true);
  const [operatorFirst, setOperatorFirst] = useState(true);

  const metrics = useMemo(() => {
    if (promptStyle === "direct") {
      return {
        pressure: 88,
        yieldPct: 14,
        boltsLocked: true,
        badge: "INTERROGATION REFLEX LOCKED",
        tone: "border-rose-500/40 bg-rose-500/10 text-rose-300",
        note: "Direct prosecutorial questioning slams the blast door shut—yielding only sanitized passive-voice boilerplate.",
      };
    }
    if (promptStyle === "understatement" && !credibilityAboveFloor) {
      return {
        pressure: 45,
        yieldPct: 22,
        boltsLocked: true,
        badge: "BELOW CREDIBILITY FLOOR",
        tone: "border-amber-500/40 bg-amber-500/10 text-amber-300",
        note: "Naive misstatement collapsed Authority Architecture (M02). Subject feeds you a simplified brush-off to end the call.",
      };
    }
    if (!operatorFirst) {
      return {
        pressure: 72,
        yieldPct: 28,
        boltsLocked: true,
        badge: "ASYMMETRIC DISCLOSURE TRAP",
        tone: "border-amber-500/40 bg-amber-500/10 text-amber-300",
        note: "Asking a lower-power counterpart to go 'off the record' without offering reciprocal vulnerability first thickens the Protective Mask.",
      };
    }
    return {
      pressure: 18,
      yieldPct: promptStyle === "normalization" ? 86 : 82,
      boltsLocked: false,
      badge: "PRESSURE EQUALIZED · VAULT OPEN",
      tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
      note:
        promptStyle === "normalization"
          ? "Third-person normalization + operator-first candor removed the Hidden Fear Map sting; unguarded operational detail volunteered."
          : "Plausible insider understatement above the Credibility Floor triggered voluntary correction with zero courtroom threat.",
    };
  }, [promptStyle, credibilityAboveFloor, operatorFirst]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
            M08 Interactive Lab · Mask &amp; Elicitation
          </span>
          <h4 className="text-base font-semibold text-slate-100">
            The Vault Pressure Equalizer
          </h4>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-mono ${metrics.tone}`}>
          {metrics.badge}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          ["direct", "Direct Interrogation"],
          ["understatement", "Understatement Probe"],
          ["normalization", "3rd-Person Normalization"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setPromptStyle(k)}
            className={`rounded-lg border px-2.5 py-2 text-xs font-mono transition ${
              promptStyle === k
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        <button
          onClick={() => setCredibilityAboveFloor((v) => !v)}
          className={`rounded-lg border p-3 text-left font-mono ${
            credibilityAboveFloor
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/40 bg-rose-500/10 text-rose-200"
          }`}
        >
          <div className="text-[10px] text-slate-400">CREDIBILITY FLOOR</div>
          <div>{credibilityAboveFloor ? "ABOVE FLOOR (15-20% OFF)" : "BELOW FLOOR (NAIVE GUESS)"}</div>
        </button>
        <button
          onClick={() => setOperatorFirst((v) => !v)}
          className={`rounded-lg border p-3 text-left font-mono ${
            operatorFirst
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-amber-500/40 bg-amber-500/10 text-amber-200"
          }`}
        >
          <div className="text-[10px] text-slate-400">CONTROLLED REGRESSION</div>
          <div>{operatorFirst ? "OPERATOR-FIRST CANDOR" : "ASKED SUBJECT FIRST (TRAP)"}</div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs">
        <div>
          <div className="flex justify-between font-mono text-slate-400 mb-1">
            <span>SUBJECT THREAT PRESSURE</span>
            <span className={metrics.pressure > 50 ? "text-rose-300" : "text-emerald-300"}>{metrics.pressure}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className={`h-full transition-all ${metrics.pressure > 50 ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${metrics.pressure}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between font-mono text-slate-400 mb-1">
            <span>INFORMATION YIELD</span>
            <span className="text-cyan-300">{metrics.yieldPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-cyan-400 transition-all" style={{ width: `${metrics.yieldPct}%` }} />
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400">{metrics.note}</p>
    </div>
  );
}

// ============================================================================
// M09: THE ATTENTIONAL GATE & PRESUPPOSITION FILTER
// ============================================================================
const SYNTAX_MODES = {
  direct: {
    label: "Direct Assertion",
    sample: '"You should adopt our Q3 rollout timeline for your regional leads."',
    stretch: 15,
    gimmickPenalty: 0,
  },
  presupposition: {
    label: "Calibrated Presupposition",
    sample: '"Before we finalize the Q3 rollout, which regional lead needs sandbox access first?"',
    stretch: 45,
    gimmickPenalty: 0,
  },
  gimmick: {
    label: "NLP Embedded Gimmick",
    sample: '"Once you *feel* ready... you will *naturally sign today* on Visa or Mastercard."',
    stretch: 85,
    gimmickPenalty: 55,
  },
};

export function M09Simulator() {
  const [buyIn, setBuyIn] = useState(55);
  const [syntax, setSyntax] = useState("presupposition");
  const [relevanceBridge, setRelevanceBridge] = useState(true);
  const [prePrimedCynicism, setPrePrimedCynicism] = useState(false);

  const mode = SYNTAX_MODES[syntax];
  const elasticityExceeded = syntax === "presupposition" && buyIn < 40;
  const radarTripRisk = Math.min(
    99,
    Math.max(
      5,
      mode.gimmickPenalty +
        (elasticityExceeded ? 55 : 0) +
        (prePrimedCynicism && syntax !== "direct" ? 38 : 0) +
        (!relevanceBridge ? 22 : 0)
    )
  );
  const tripped = radarTripRisk >= 55;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-violet-400">
            M09 Interactive Lab · Salience &amp; Framing
          </span>
          <h4 className="text-base font-semibold text-slate-100">
            The Attentional Gate &amp; Presupposition Filter
          </h4>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-mono ${
            tripped
              ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
              : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
          }`}
        >
          {tripped ? `PERSUASION-RADAR TRIP (${radarTripRisk}%)` : `CLEAN SALIENCE PASS (${radarTripRisk}% RISK)`}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Object.entries(SYNTAX_MODES).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setSyntax(k)}
            className={`rounded-lg border px-2.5 py-2 text-xs font-mono ${
              syntax === k
                ? "border-violet-400 bg-violet-500/20 text-violet-200"
                : "border-slate-800 bg-slate-900 text-slate-400"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-200 italic">
        {mode.sample}
      </div>

      <div className="grid gap-3 sm:grid-cols-3 text-xs">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">
          <div className="flex justify-between font-mono text-slate-400">
            <span>Subject Buy-In</span>
            <span className="text-cyan-300">{buyIn}%</span>
          </div>
          <input type="range" min={0} max={100} value={buyIn} onChange={(e) => setBuyIn(Number(e.target.value))} className="w-full accent-cyan-400" />
        </div>
        <button
          onClick={() => setRelevanceBridge((v) => !v)}
          className={`rounded-lg border p-2.5 text-left font-mono ${
            relevanceBridge ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-amber-500/40 bg-amber-500/10 text-amber-300"
          }`}
        >
          <div className="text-[10px] text-slate-400">PATTERN INTERRUPT</div>
          <div>{relevanceBridge ? "RELEVANCE BRIDGE ON" : "NO BRIDGE (GIMMICK)"}</div>
        </button>
        <button
          onClick={() => setPrePrimedCynicism((v) => !v)}
          className={`rounded-lg border p-2.5 text-left font-mono ${
            prePrimedCynicism ? "border-rose-500/40 bg-rose-500/10 text-rose-300" : "border-slate-700 bg-slate-900 text-slate-400"
          }`}
        >
          <div className="text-[10px] text-slate-400">ROOM VIGILANCE</div>
          <div>{prePrimedCynicism ? "PRE-PRIMED CYNICISM" : "NORMAL BASELINE"}</div>
        </button>
      </div>

      <p className="text-xs text-slate-400">
        {syntax === "gimmick"
          ? "NLP embedded commands and assumptive gimmicks fail replication and immediately fire Persuasion-Radar Trip."
          : elasticityExceeded
          ? "Presupposition Elasticity Limit exceeded: Buy-in (<40%) is too low to embed a rollout commitment. Drop back to Elicitation Probe (M08)."
          : prePrimedCynicism && syntax !== "direct"
          ? "Pre-Primed Cynicism active: even clean presuppositions trip alarms in adversarial procurement rooms—switch to plain Central-Route transparency."
          : "Syntax sits comfortably inside the Presupposition Elasticity Limit with an active Relevance Bridge."}
      </p>
    </div>
  );
}

// ============================================================================
// M10: THE CANAL LOCK & REACTANCE GAUGE
// ============================================================================
const RUNGS = [
  { id: 1, title: "Rung 1: Micro-Attention", desc: "Review 1-page error summary (2 min)." },
  { id: 2, title: "Rung 2: Shared Premise", desc: "Confirm 14 lost staff hours/week." },
  { id: 3, title: "Rung 3: Co-Design", desc: "Subject picks which 3 fields survive." },
  { id: 4, title: "Rung 4: Activation", desc: "30-day pilot of co-authored workflow." },
];

export function M10Simulator() {
  const [rung, setRung] = useState(3);
  const [skippedTo4, setSkippedTo4] = useState(false);
  const [optionParity, setOptionParity] = useState(true);
  const [byafActive, setByafActive] = useState(true);

  const reactanceRisk = Math.min(
    98,
    Math.max(
      8,
      (skippedTo4 ? 58 : 12) + (!optionParity ? 42 : 0) - (byafActive ? 24 : 0)
    )
  );
  const highReactance = reactanceRisk >= 50;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
            M10 Interactive Lab · Compliance Escalation
          </span>
          <h4 className="text-base font-semibold text-slate-100">
            The Canal Lock &amp; Reactance Gauge
          </h4>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-mono ${
            highReactance
              ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
              : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
          }`}
        >
          {highReactance ? `REACTANCE / SILENT STALL (${reactanceRisk}%)` : `HYDRAULIC MOMENTUM (${reactanceRisk}% RISK)`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RUNGS.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              setSkippedTo4(r.id === 4 && rung < 3);
              setRung(r.id);
            }}
            className={`rounded-lg border p-2.5 text-left text-xs transition ${
              rung >= r.id
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                : "border-slate-800 bg-slate-900 text-slate-400"
            }`}
          >
            <div className="font-mono font-semibold">{r.title}</div>
            <div className="text-[10px] opacity-80 mt-0.5">{r.desc}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3 text-xs">
        <button
          onClick={() => setOptionParity((v) => !v)}
          className={`rounded-lg border p-2.5 text-left font-mono ${
            optionParity ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-rose-500/40 bg-rose-500/10 text-rose-300"
          }`}
        >
          <div className="text-[10px] text-slate-400">DOUBLE-BIND PARITY</div>
          <div>{optionParity ? "OPTION-SET PARITY" : "STRAWMAN DECOY"}</div>
        </button>
        <button
          onClick={() => setByafActive((v) => !v)}
          className={`rounded-lg border p-2.5 text-left font-mono ${
            byafActive ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" : "border-amber-500/40 bg-amber-500/10 text-amber-300"
          }`}
        >
          <div className="text-[10px] text-slate-400">AUTONOMY EXIT (BYAF)</div>
          <div>{byafActive ? "EXPLICIT 'YOUR CALL'" : "NO EXIT RAMP"}</div>
        </button>
        <button
          onClick={() => {
            setSkippedTo4(false);
            setOptionParity(true);
            setByafActive(true);
            setRung(3);
          }}
          className="rounded-lg border border-emerald-500/50 bg-emerald-500/20 p-2.5 font-mono text-emerald-200 hover:bg-emerald-500/30"
        >
          Restore Freedom (Reset Valve)
        </button>
      </div>

      <p className="text-xs text-slate-400">
        {skippedTo4
          ? "Skipped Rung 3 (Co-Design) and jumped straight to Activation! Psychological Reactance fired—drop down one rung and restore freedom."
          : !optionParity
          ? "Lopsided strawman decoy detected. Sharp counterparts tag rigged binds immediately (Persuasion-Radar Trip / Silent Non-Compliance)."
          : "Canal lock chambers rising evenly with Option-Set Parity and explicit freedom affirmation (BYAF), roughly doubling durable voluntary compliance."}
      </p>
    </div>
  );
}
