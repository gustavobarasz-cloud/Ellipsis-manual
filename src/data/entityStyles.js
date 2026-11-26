// Canonical 5-Primitive Entity Type Styling Registry
export const ENTITY_STYLES = {
  "Signal/Indicator": {
    token: "cyan",
    layer: "Sensor",
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    dot: "bg-cyan-400",
    border: "border-cyan-500/40",
    text: "text-cyan-300",
  },
  "Internal State/Driver": {
    token: "amber",
    layer: "Interpreter",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    dot: "bg-amber-400",
    border: "border-amber-500/40",
    text: "text-amber-300",
  },
  "Cognitive Mechanism": {
    token: "violet",
    layer: "Bridge",
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    dot: "bg-violet-400",
    border: "border-violet-500/40",
    text: "text-violet-300",
  },
  "Tactical Lever": {
    token: "emerald",
    layer: "Actuator",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
    border: "border-emerald-500/40",
    text: "text-emerald-300",
  },
  "Failure Mode": {
    token: "rose",
    layer: "Audit",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    dot: "bg-rose-400",
    border: "border-rose-500/40",
    text: "text-rose-300",
  },
};

export const VERDICT_STYLES = {
  REINFORCES: {
    label: "REINFORCES",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  REFINES_MECHANISM_DIFFERS: {
    label: "REFINES / MECHANISM DIFFERS",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  REFUTES_SPECULATIVE: {
    label: "REFUTES / SPECULATIVE",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
};
