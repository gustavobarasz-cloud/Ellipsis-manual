"use client";
import React, { useState, useEffect, useMemo } from "react";

// ============================================================================
// M01: THE ZEROED SEISMOGRAPH & FOUR-LENS DIAL
// ============================================================================
const LENS_DATA = [
  {
    id: 1,
    name: "Lens 1: Broken",
    tag: "Moralistic Distortion",
    color: "text-rose-400 border-rose-500/40 bg-rose-500/10",
    output:
      '"He is arrogant, defensive, and clearly hiding something about Q3 margins."',
    audit:
      "Terminates inquiry immediately and triggers confirmation hunting + Observer Distortion.",
  },
  {
    id: 2,
    name: "Lens 2: Different",
    tag: "Non-Hostile Distance",
    color: "text-amber-300 border-amber-500/40 bg-amber-500/10",
    output:
      '"He handles budget scrutiny more abruptly than I would in this meeting."',
    audit:
      "Lowers emotional heat, but still treats the operator's personal style as the norm.",
  },
  {
    id: 3,
    name: "Lens 3: Facts",
    tag: "Camera-Grade Telemetry",
    color: "text-cyan-300 border-cyan-500/40 bg-cyan-500/10",
    output:
      '"Interrupted twice during margin-loss slides; shifted chair back 4 in.; stared at locked phone screen for 5 seconds."',
    audit:
      "Clean Sensor input. Zero adjectives a camera or microphone cannot verify.",
  },
  {
    id: 4,
    name: "Lens 4: Reasons",
    tag: "Hypothesis Plurality",
    color: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
    output:
      "Competing Hypotheses: (A) Feels exposed on overruns & uses urgency to deflect; OR (B) Already briefed CFO yesterday; OR (C) Exogenous Noise (urgent floor alert).",
    audit:
      "Holds 2-3 competing motives in suspension until a low-threat probe disconfirms them.",
  },
];

export function M01Simulator() {
  const [arousal, setArousal] = useState(18);
  const [activeLens, setActiveLens] = useState(3);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 360), 90);
    return () => clearInterval(id);
  }, []);

  const snr = Math.max(5, Math.round(100 - arousal * 0.88));
  const lens = LENS_DATA[activeLens - 1];

  const wavePath = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const x = (i / 60) * 300;
      const subjectSignal =
        i > 24 && i < 36 ? Math.sin(((i - 24) / 12) * Math.PI) * 22 : 0;
      const noiseAmp = (arousal / 100) * 28;
      const noise =
        Math.sin(i * 1.7 + tick * 0.45) * noiseAmp +
        Math.cos(i * 3.1 - tick * 0.7) * (noiseAmp * 0.55);
      const y = 50 - subjectSignal + noise;
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${Math.max(6, Math.min(94, y)).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [arousal, tick]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
            M01 Interactive Lab · Sensor Calibration
          </span>
          <h4 className="text-base font-semibold text-slate-100">
            The Zeroed Seismograph &amp; Four-Lens Dial
          </h4>
        </div>
        <div
          className={`rounded-full border px-3 py-1 text-xs font-mono ${
            snr >= 75
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : snr >= 45
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
              : "border-rose-500/40 bg-rose-500/10 text-rose-300"
          }`}
        >
          Signal-to-Noise: {snr}%
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Seismograph */}
        <div className="space-y-3 rounded-lg border border-slate-800/80 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">OPERATOR AROUSAL / NOISE</span>
            <span className="font-mono text-cyan-300">{arousal}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={arousal}
            onChange={(e) => setArousal(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <svg viewBox="0 0 300 100" className="h-28 w-full rounded bg-slate-950 border border-slate-800">
            <line x1="0" y1="50" x2="300" y2="50" stroke="#1e293b" strokeDasharray="4 4" />
            <rect x="120" y="6" width="60" height="88" fill="#06b6d4" fillOpacity="0.06" />
            <text x="150" y="16" textAnchor="middle" fill="#67e8f9" fontSize="8" fontFamily="monospace">
              TRUE STIMULUS
            </text>
            <path
              d={wavePath}
              fill="none"
              stroke={arousal > 55 ? "#fb7185" : arousal > 25 ? "#fbbf24" : "#22d3ee"}
              strokeWidth="2"
            />
          </svg>
          <p className="text-xs text-slate-400">
            {arousal <= 25
              ? "Bedrock Zeroed: Operator Baseline is still; the subject's true stimulus spike registers cleanly."
              : arousal <= 55
              ? "Table Vibrating: Mild somatic leakage is beginning to obscure baseline deltas."
              : "Observer Distortion Active: Your own tension is scribbling over the needle—subject constriction is now contaminated."}
          </p>
        </div>

        {/* Four-Lens Dial */}
        <div className="space-y-3 rounded-lg border border-slate-800/80 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">THE FOUR LENSES DIAL</span>
            <span className="font-mono text-violet-300">{lens.tag}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {LENS_DATA.map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveLens(l.id)}
                className={`rounded-md border px-2 py-1.5 text-xs font-mono transition ${
                  activeLens === l.id
                    ? "border-violet-400 bg-violet-500/20 text-violet-200"
                    : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600"
                }`}
              >
                L{l.id}
              </button>
            ))}
          </div>
          <div className={`rounded-lg border p-3 text-xs leading-relaxed ${lens.color}`}>
            <div className="mb-1 font-mono font-semibold">{lens.name}</div>
            <div>{lens.output}</div>
          </div>
          <p className="text-xs text-slate-400">{lens.audit}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// M02: THE GRAVITY VS. THRUST QUADRANT
// ============================================================================
export function M02Simulator() {
  const [tempo, setTempo] = useState(35); // lower = slower/calmer
  const [pauseSec, setPauseSec] = useState(2.0);
  const [threat, setThreat] = useState(20);

  const calmMass = Math.min(100, Math.max(0, Math.round((100 - tempo) * 0.6 + pauseSec * 15)));
  const threatPressure = threat;

  const quadrant = useMemo(() => {
    if (calmMass >= 50 && threatPressure < 50)
      return {
        label: "Authority Architecture Sweet Spot",
        tone: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
        note: "High certainty + low threat. Prestige deference rises and Subject Baseline stays clear.",
      };
    if (calmMass >= 50 && threatPressure >= 50)
      return {
        label: "Dominance Overplay",
        tone: "text-rose-300 border-rose-500/40 bg-rose-500/10",
        note: "Crossed Autonomy Margin. Triggers Observer Distortion, defensive armor, and information hoarding.",
      };
    if (calmMass < 50 && threatPressure >= 50)
      return {
        label: "Anxious Friction",
        tone: "text-amber-300 border-amber-500/40 bg-amber-500/10",
        note: "Rushed speech + pushy pressure. High friction with zero perceived gravity.",
      };
    return {
      label: "Subordinate Drift (Status-Tension Leak)",
      tone: "text-slate-300 border-slate-600 bg-slate-800/60",
      note: "Upward inflection / rushed silence collapses First-Contact Frame.",
    };
  }, [calmMass, threatPressure]);

  const baselineClarity = Math.max(
    10,
    Math.min(98, Math.round(95 - threatPressure * 0.75 - Math.max(0, 40 - calmMass) * 0.4))
  );
  const complianceFriction = Math.max(
    8,
    Math.min(96, Math.round(threatPressure * 0.65 + (100 - calmMass) * 0.45))
  );

  const dotX = 20 + (calmMass / 100) * 220;
  const dotY = 160 - (threatPressure / 100) * 140;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
            M02 Interactive Lab · Actuator Calibration
          </span>
          <h4 className="text-base font-semibold text-slate-100">
            The Gravity vs. Thrust Quadrant
          </h4>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-mono ${quadrant.tone}`}>
          {quadrant.label}
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          <svg viewBox="0 0 260 180" className="w-full h-48">
            <rect x="20" y="20" width="110" height="70" fill="#f59e0b" fillOpacity="0.07" />
            <rect x="130" y="20" width="110" height="70" fill="#f43f5e" fillOpacity="0.10" />
            <rect x="20" y="90" width="110" height="70" fill="#64748b" fillOpacity="0.08" />
            <rect x="130" y="90" width="110" height="70" fill="#10b981" fillOpacity="0.12" />
            <line x1="130" y1="20" x2="130" y2="160" stroke="#334155" strokeDasharray="3 3" />
            <line x1="20" y1="90" x2="240" y2="90" stroke="#334155" strokeDasharray="3 3" />
            <text x="75" y="34" textAnchor="middle" fill="#fcd34d" fontSize="8" fontFamily="monospace">ANXIOUS FRICTION</text>
            <text x="185" y="34" textAnchor="middle" fill="#fda4af" fontSize="8" fontFamily="monospace">DOMINANCE OVERPLAY</text>
            <text x="75" y="152" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">SUBORDINATE DRIFT</text>
            <text x="185" y="152" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontFamily="monospace">AUTHORITY SWEET SPOT</text>
            <circle cx={dotX} cy={dotY} r="7" fill="#10b981" fillOpacity="0.25" />
            <circle cx={dotX} cy={dotY} r="4" fill="#34d399" stroke="#0f172a" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-xs">
          <div>
            <div className="flex justify-between font-mono text-slate-400">
              <span>Vocal Tempo (Lower = Unhurried)</span>
              <span className="text-slate-200">{tempo}%</span>
            </div>
            <input type="range" min={10} max={100} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} className="w-full accent-emerald-400" />
          </div>
          <div>
            <div className="flex justify-between font-mono text-slate-400">
              <span>Non-Reactivity Pause</span>
              <span className="text-slate-200">{pauseSec.toFixed(1)}s</span>
            </div>
            <input type="range" min={0} max={3} step={0.5} value={pauseSec} onChange={(e) => setPauseSec(Number(e.target.value))} className="w-full accent-emerald-400" />
          </div>
          <div>
            <div className="flex justify-between font-mono text-slate-400">
              <span>Postural / Directive Threat</span>
              <span className="text-rose-300">{threat}%</span>
            </div>
            <input type="range" min={0} max={100} value={threat} onChange={(e) => setThreat(Number(e.target.value))} className="w-full accent-rose-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded border border-slate-800 bg-slate-950 p-2">
              <div className="text-[10px] font-mono text-slate-400">BASELINE CLARITY</div>
              <div className="text-sm font-mono font-semibold text-cyan-300">{baselineClarity}%</div>
            </div>
            <div className="rounded border border-slate-800 bg-slate-950 p-2">
              <div className="text-[10px] font-mono text-slate-400">COMPLIANCE FRICTION</div>
              <div className="text-sm font-mono font-semibold text-amber-300">{complianceFriction}%</div>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed">{quadrant.note}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// M03: THE DISTRIBUTED LOAD TELEMETRY PANEL (BToE)
// ============================================================================
const BTOE_CUES = [
  { id: "lip", zone: "Face/Eyes", label: "Lip Compression / Disappearance", weight: 2.0 },
  { id: "blink", zone: "Face/Eyes", label: "Blink-Rate Freeze (4s)", weight: 1.5 },
  { id: "neck", zone: "Neck/Throat", label: "Neck / Suprasternal Pacifier", weight: 2.5 },
  { id: "voice", zone: "Neck/Throat", label: "Vocal Pitch Constriction", weight: 3.0 },
  { id: "arm", zone: "Arms/Torso", label: "Single-Arm Wrap Barrier", weight: 2.0 },
  { id: "torso", zone: "Arms/Torso", label: "20° Torso Escape Pivot", weight: 3.0 },
  { id: "hands", zone: "Hands/Feet", label: "Abrupt Gesture Freeze (Hands Flat)", weight: 2.0 },
  { id: "feet", zone: "Hands/Feet", label: "Feet Pivoted to Exit", weight: 1.5 },
];

export function M03Simulator() {
  const [selected, setSelected] = useState(["lip", "neck", "torso"]);
  const [latency, setLatency] = useState(3.5);
  const [kinematicIndependent, setKinematicIndependent] = useState(true);

  const toggleCue = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const activeCues = BTOE_CUES.filter((c) => selected.includes(c.id));
  const uniqueZones = new Set(activeCues.map((c) => c.zone)).size;
  const rawScore = activeCues.reduce((s, c) => s + c.weight, 0);
  const inWindow = latency >= 0.5 && latency <= 5.0;
  const clusterValid =
    kinematicIndependent && inWindow && activeCues.length >= 3 && uniqueZones >= 2 && rawScore >= 6.0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
            M03 Interactive Lab · BToE Stress Telemetry
          </span>
          <h4 className="text-base font-semibold text-slate-100">
            The Distributed Load Telemetry Panel
          </h4>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-mono ${
            clusterValid
              ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
              : "border-slate-700 bg-slate-900 text-slate-400"
          }`}
        >
          {clusterValid ? `CLUSTER CONFIRMED (${rawScore.toFixed(1)})` : `BELOW THRESHOLD (${rawScore.toFixed(1)})`}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {BTOE_CUES.map((c) => {
          const on = selected.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggleCue(c.id)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${
                on
                  ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-200"
                  : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="font-medium">{c.label}</div>
                <div className="text-[10px] font-mono text-slate-500">{c.zone}</div>
              </div>
              <span className="font-mono text-cyan-300">+{c.weight.toFixed(1)}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2 rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs">
        <div>
          <div className="flex justify-between font-mono text-slate-400">
            <span>Latency Since Stimulus (Target: 0.5-5.0s)</span>
            <span className={inWindow ? "text-emerald-300" : "text-rose-300"}>{latency.toFixed(1)}s</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={latency}
            onChange={(e) => setLatency(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="font-mono text-slate-300">Kinematic Independence</div>
            <div className="text-[11px] text-slate-500">
              {kinematicIndependent ? "Distinct autonomic vents" : "Single mechanical chair shift (invalid)"}
            </div>
          </div>
          <button
            onClick={() => setKinematicIndependent((v) => !v)}
            className={`rounded-md border px-3 py-1 font-mono text-xs ${
              kinematicIndependent
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                : "border-rose-500/40 bg-rose-500/15 text-rose-300"
            }`}
          >
            {kinematicIndependent ? "INDEPENDENT" : "LINKED SHIFT"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
        <strong className="font-mono">OTHELLO ERROR GUARDRAIL:</strong> A confirmed BToE Stress Cluster maps
        <em> topic-linked autonomic load</em>—never standalone proof of deception. Truth-tellers under blame pressure emit identical clusters.
      </div>
    </div>
  );
}

// ============================================================================
// M04: THE HYDRAULIC VS. MANUAL EXPRESSION TIMELINE
// ============================================================================
export function M04Simulator() {
  const [mode, setMode] = useState("manual");
  const [upperFace, setUpperFace] = useState(false);
  const [leakage, setLeakage] = useState(true);
  const [lagMs, setLagMs] = useState(320);

  const path = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100; // 0 to 2.0s
      const x = 10 + t * 280;
      let amp = 0;
      if (leakage && t >= 0.08 && t <= 0.18) {
        amp = -24 * Math.sin(((t - 0.08) / 0.1) * Math.PI);
      } else if (mode === "hydraulic") {
        if (t >= 0.15 && t <= 0.4) amp = 50 * ((t - 0.15) / 0.25);
        else if (t > 0.4) amp = 50 * Math.exp(-(t - 0.4) * 3.8);
      } else {
        const onset = 0.18 + (lagMs / 1000) * 0.25;
        if (t >= onset && t <= onset + 0.05) amp = 46 * ((t - onset) / 0.05);
        else if (t > onset + 0.05 && t <= 0.72) amp = 46;
        else if (t > 0.72 && t <= 0.74) amp = 46 * (1 - (t - 0.72) / 0.02);
      }
      const y = 72 - amp;
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [mode, leakage, lagMs]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
            M04 Interactive Lab · Facial Physics
          </span>
          <h4 className="text-base font-semibold text-slate-100">
            The Hydraulic vs. Manual Expression Timeline
          </h4>
        </div>
        <div className="flex gap-1.5">
          {["hydraulic", "manual"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setUpperFace(m === "hydraulic");
              }}
              className={`rounded-md border px-2.5 py-1 text-xs font-mono uppercase ${
                mode === m
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                  : "border-slate-700 bg-slate-900 text-slate-400"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 300 105" className="h-32 w-full rounded-lg border border-slate-800 bg-slate-900/70">
        <line x1="10" y1="72" x2="290" y2="72" stroke="#334155" strokeDasharray="3 3" />
        <path
          d={path}
          fill="none"
          stroke={mode === "hydraulic" ? "#34d399" : "#fbbf24"}
          strokeWidth="2.5"
        />
        {leakage && (
          <text x="52" y="98" textAnchor="middle" fill="#fb7185" fontSize="8" fontFamily="monospace">
            200ms LEAKAGE
          </text>
        )}
        <text x="225" y="20" textAnchor="middle" fill={mode === "hydraulic" ? "#6ee7b7" : "#fcd34d"} fontSize="8" fontFamily="monospace">
          {mode === "hydraulic" ? "ORGANIC EXPONENTIAL FADE" : "VERTICAL EXPRESSION STOP"}
        </text>
      </svg>

      <div className="grid gap-3 sm:grid-cols-3 text-xs">
        <button
          onClick={() => setUpperFace((v) => !v)}
          className={`rounded-lg border p-2.5 text-left font-mono ${
            upperFace ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-amber-500/40 bg-amber-500/10 text-amber-300"
          }`}
        >
          <div className="text-[10px] text-slate-400">UPPER-FACE (EYES)</div>
          <div>{upperFace ? "ENGAGED (DUCHENNE)" : "FLAT (ARTIFICIAL SMILE)"}</div>
        </button>
        <button
          onClick={() => setLeakage((v) => !v)}
          className={`rounded-lg border p-2.5 text-left font-mono ${
            leakage ? "border-rose-500/40 bg-rose-500/10 text-rose-300" : "border-slate-700 bg-slate-900 text-slate-400"
          }`}
        >
          <div className="text-[10px] text-slate-400">LANDING WINDOW</div>
          <div>{leakage ? "200ms LEAKAGE ON" : "NO LEAKAGE"}</div>
        </button>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">
          <div className="flex justify-between font-mono text-[10px] text-slate-400">
            <span>VERBAL LAG</span>
            <span className="text-slate-200">{lagMs}ms</span>
          </div>
          <input
            type="range"
            min={0}
            max={600}
            step={40}
            value={lagMs}
            onChange={(e) => setLagMs(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// M05: THE NEED-FEAR CANTILEVER BEAM
// ============================================================================
const SOCIAL_NEEDS = [
  { name: "Significance", fear: "Being ordinary, invisible, or replaceable", tell: "Heat-to-Stakes Disproportion toward uncredited work" },
  { name: "Approval", fear: "Criticism, disappointment, or falling out of favor", tell: "Frequent reassurance checks & conflict avoidance" },
  { name: "Acceptance", fear: "Exile, awkwardness, or outsider status", tell: "Conversational gravity orbiting group warmth & inclusion" },
  { name: "Intelligence", fear: "Appearing ignorant, naive, or outmatched", tell: "Unprompted didactic lectures & precision policing" },
  { name: "Pity", fear: "Full accountability or abandonment", tell: "Recurring hardship framing to lower expectations" },
  { name: "Strength / Power", fear: "Helplessness, vulnerability, or being dictated to", tell: "Sharp reactance to uninvited oversight or directives" },
];

export function M05Simulator() {
  const [needIdx, setNeedIdx] = useState(3);
  const [dosage, setDosage] = useState(65); // 0=Threaten, 50=Neutral, 65=Surgical, 95=Sycophant
  const [factAnchored, setFactAnchored] = useState(true);

  const active = SOCIAL_NEEDS[needIdx];
  const zone = useMemo(() => {
    if (dosage < 30) return { label: "FEAR-SEAM THREAT", color: "text-rose-300", candor: 18, tilt: -14 };
    if (dosage < 52) return { label: "NEUTRAL", color: "text-slate-300", candor: 50, tilt: 0 };
    if (dosage <= 78 && factAnchored) return { label: "SURGICAL IMPACT VALIDATION", color: "text-emerald-300", candor: 92, tilt: 2 };
    return { label: "SYCOPHANTIC OVERFEED", color: "text-amber-300", candor: 32, tilt: 14 };
  }, [dosage, factAnchored]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
            M05 Interactive Lab · Engine Room
          </span>
          <h4 className="text-base font-semibold text-slate-100">
            The Need–Fear Cantilever Beam
          </h4>
        </div>
        <span className={`font-mono text-xs font-semibold ${zone.color}`}>
          {zone.label} · Candor {zone.candor}%
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SOCIAL_NEEDS.map((n, idx) => (
          <button
            key={n.name}
            onClick={() => setNeedIdx(idx)}
            className={`rounded-md border px-2.5 py-1 text-xs font-mono transition ${
              needIdx === idx
                ? "border-amber-400 bg-amber-500/20 text-amber-200"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
            }`}
          >
            {n.name}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <svg viewBox="0 0 320 90" className="w-full h-24">
          <polygon points="150,82 170,82 160,52" fill="#334155" />
          <g transform={`rotate(${zone.tilt} 160 52)`}>
            <line x1="35" y1="52" x2="285" y2="52" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <rect x="25" y="24" width="90" height="24" rx="4" fill="#f43f5e" fillOpacity="0.18" stroke="#fb7185" />
            <text x="70" y="39" textAnchor="middle" fill="#fda4af" fontSize="8" fontFamily="monospace">HIDDEN FEAR</text>
            <rect x="205" y="24" width="90" height="24" rx="4" fill="#f59e0b" fillOpacity="0.18" stroke="#fbbf24" />
            <text x="250" y="39" textAnchor="middle" fill="#fde68a" fontSize="8" fontFamily="monospace">{active.name.toUpperCase()}</text>
          </g>
        </svg>
        <div className="grid gap-2 sm:grid-cols-2 text-xs mt-1">
          <div className="rounded border border-rose-500/25 bg-rose-500/5 p-2">
            <span className="font-mono text-[10px] text-rose-400">INVERSE FEAR: </span>
            <span className="text-slate-300">{active.fear}</span>
          </div>
          <div className="rounded border border-cyan-500/25 bg-cyan-500/5 p-2">
            <span className="font-mono text-[10px] text-cyan-400">DIAGNOSTIC TELL: </span>
            <span className="text-slate-300">{active.tell}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        <div>
          <div className="flex justify-between font-mono text-slate-400">
            <span>Calibration Dosage (Threaten → Overfeed)</span>
            <span className="text-slate-200">{dosage}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={dosage}
            onChange={(e) => setDosage(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2">
          <span className="font-mono text-slate-300">Specificity Mode</span>
          <button
            onClick={() => setFactAnchored((v) => !v)}
            className={`rounded border px-2.5 py-1 font-mono ${
              factAnchored
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                : "border-rose-500/40 bg-rose-500/15 text-rose-300"
            }`}
          >
            {factAnchored ? "FACT-ANCHORED" : "GENERIC FLATTERY"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// M06: THE FATE SWITCHYARD SIMULATOR
// ============================================================================
export function M06Simulator() {
  const [switches, setSwitches] = useState({
    focus: true,
    authority: true,
    tribe: false,
    emotion: true,
  });
  const [dataQuality, setDataQuality] = useState(85);
  const [centralRoute, setCentralRoute] = useState(false);

  const toggle = (k) => setSwitches((s) => ({ ...s, [k]: !s[k] }));
  const allAligned = Object.values(switches).every(Boolean);
  const openCount = Object.values(switches).filter(Boolean).length;
  const logicClears = !centralRoute || dataQuality >= 70;
  const routedApproach = allAligned && logicClears;

  const deployResetValve = () =>
    setSwitches({ focus: true, authority: true, tribe: true, emotion: true });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-violet-400">
            M06 Interactive Lab · Decision Architecture
          </span>
          <h4 className="text-base font-semibold text-slate-100">
            The FATE Switchyard Simulator
          </h4>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-mono ${
            routedApproach
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
              : "border-rose-500/40 bg-rose-500/15 text-rose-300"
          }`}
        >
          {routedApproach ? "RATCHET: APPROACH TRACK" : "RATCHET LOCKED: AVOID SIDING"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["focus", "F · Focus"],
          ["authority", "A · Authority"],
          ["tribe", "T · Tribe"],
          ["emotion", "E · Emotion"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => toggle(k)}
            className={`rounded-lg border px-3 py-2 text-xs font-mono transition ${
              switches[k]
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                : "border-rose-500/50 bg-rose-500/15 text-rose-200"
            }`}
          >
            <div>{label}</div>
            <div className="text-[10px] opacity-80">{switches[k] ? "ALIGNED" : "TRIPPED"}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs">
        <div>
          <div className="flex justify-between font-mono text-slate-400">
            <span>Logical Data Quality</span>
            <span className="text-slate-200">{dataQuality}/100</span>
          </div>
          <input
            type="range"
            min={20}
            max={100}
            value={dataQuality}
            onChange={(e) => setDataQuality(Number(e.target.value))}
            className="w-full accent-violet-400"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setCentralRoute((v) => !v)}
            className={`rounded border px-2.5 py-1.5 font-mono text-xs ${
              centralRoute
                ? "border-violet-400 bg-violet-500/20 text-violet-200"
                : "border-slate-700 bg-slate-950 text-slate-400"
            }`}
          >
            {centralRoute ? "CENTRAL-ROUTE SCRUTINY ON" : "PERIPHERAL ROUTE"}
          </button>
          {!allAligned && (
            <button
              onClick={deployResetValve}
              className="rounded border border-emerald-500/50 bg-emerald-500/20 px-2.5 py-1.5 font-mono text-xs text-emerald-200 hover:bg-emerald-500/30"
            >
              Deploy Reset Valve
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400">
        {routedApproach
          ? `All 4 FATE switches aligned (${openCount}/4) and logic clears scrutiny—proposal enters the Approach track cleanly.`
          : !allAligned
          ? `Early switch tripped (${openCount}/4). Adding more slides only wedges the Avoid ratchet tighter—deploy the Reset Valve to return agenda control.`
          : "FATE opened the door, but Central-Route Scrutiny rejected weak data quality (<70). Emotion opens the track; logic keeps the train on the rails."}
      </p>
    </div>
  );
}
