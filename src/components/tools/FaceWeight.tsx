"use client";
// Brown Belt Br1 face-weight calculator: W = D + P + R. The strategy text and dialect phrasing are the manual's own.
import { getAt, setAt, useMaster, useSettings } from "@/lib/store";
import type { Dialect } from "@/lib/types";
import { DIALECTS } from "@/lib/types";

const DIALECT_BR1: Record<Dialect, { autonomy: string; solidarity: string }> = {
  office_us: {
    autonomy: "“I know Q3 budgets are tightly scoped and I don't want to surprise your plan. I'd like to be considered for Senior Analyst this cycle based on the two audit leads I delivered. What would you need to see to support that?”",
    solidarity: "“We've built a great rhythm on this close, and I want to keep that momentum—so I can't take on the ad-hoc deck this week.”",
  },
  personal_us: {
    autonomy: "“Could you help me move two boxes Saturday morning? Totally fine if your weekend is packed.”",
    solidarity: "“I love catching up with you, and I'd rather pick somewhere quieter tonight so we can actually hear each other.”",
  },
  rioplatense: {
    autonomy: "“Sé que el presupuesto está ajustado. Me gustaría que evaluemos mi pase a Senior este ciclo por los dos cierres que lideré. ¿Qué necesitarías ver para apoyarlo?”",
    solidarity: "“¡Qué bueno venir laburando tan bien juntos! Justamente para cuidar la calidad, esta semana no puedo sumar el reporte extra.”",
  },
  espana: {
    autonomy: "“Sé que el presupuesto está muy ajustado. Me gustaría optar al puesto de Senior en este ciclo por los dos proyectos que he liderado. ¿Qué necesitarías ver para apoyarlo?”",
    solidarity: "“Me encanta cómo estamos sacando adelante el trimestre; precisamente por eso, esta semana no puedo asumir este informe adicional.”",
  },
};

const SLIDERS: [string, string, number][] = [
  ["calcD", "Distance (D · 1=close, 5=stranger)", 3],
  ["calcP", "Their Power Over You (P · 1=low, 5=high)", 4],
  ["calcR", "Size of Imposition (R · 1=tiny, 5=major)", 4],
];

export default function FaceWeight() {
  const m = useMaster();
  const { dialect } = useSettings();
  const v = (k: string, d: number) => Number(getAt(m, `belts.brown.br1.${k}`)) || d;
  const D = v("calcD", 3), P = v("calcP", 4), R = v("calcR", 4);
  const face = (getAt(m, "belts.brown.br1.calcFace") as string) || "autonomy";
  const W = D + P + R;
  const dl = DIALECT_BR1[dialect] || DIALECT_BR1.office_us;
  const spanish = dialect === "rioplatense" || dialect === "espana";
  let strat = "", why = "", sample = "";
  if (W <= 5) {
    strat = `Bald On-Record (W = ${W}/15)`;
    why = "Low distance, power, and imposition. Extra wrapping sounds stiff or evasive.";
    sample = spanish ? "“Envíamelo antes de las 5, gracias.”" : "“Please send the Q3 tab by 5pm—thanks.”";
  } else if (W <= 9) {
    strat = `${face === "belonging" ? "Positive Politeness · Solidarity Wrap" : "Light Negative Politeness · Autonomy Wrap"} (W = ${W}/15)`;
    why = face === "belonging" ? "Belonging/approval is at stake—affirm the bond first, then state the ask/no." : "Moderate imposition—acknowledge their autonomy briefly, keep proposal crisp.";
    sample = face === "belonging" ? dl.solidarity : dl.autonomy;
  } else if (W <= 13) {
    strat = `Negative Politeness · Full Autonomy Wrap (W = ${W}/15)`;
    why = "High power gap or high imposition (like a Promotion Ask). Protect their freedom to choose while keeping your proposal verb unhedged.";
    sample = dl.autonomy;
  } else {
    strat = `Off-Record Probe or Pre-Framing (W = ${W}/15)`;
    why = "Maximum weight. Test the waters or frame the conversation purpose in advance before dropping the full ask.";
    sample = "“I'd like to schedule 20 minutes next week to discuss my scope and growth trajectory—does Thursday work?”";
  }
  return (
    <section className="tool">
      <h3>Part A · Face-Weight Calculator (W = D + P + R)</h3>
      <div className="grid gap-3">
        {SLIDERS.map(([k, label, d]) => (
          <label key={k} className="grid gap-1">
            <span className="flex justify-between text-sm font-semibold"><span>{label}</span><span>{v(k, d)}</span></span>
            <input className="range" type="range" min={1} max={5} step={1} value={v(k, d)} onChange={(e) => setAt(`belts.brown.br1.${k}`, Number(e.target.value))} />
          </label>
        ))}
        <div className="seg cols-2" role="group" aria-label="Face at stake">
          {[["autonomy", "Autonomy / Freedom (Ask / Request)"], ["belonging", "Belonging / Approval (Critique / No)"]].map(([k, lbl]) => (
            <button key={k} type="button" aria-pressed={face === k} onClick={() => setAt("belts.brown.br1.calcFace", k)}>{lbl}</button>
          ))}
        </div>
        <div className="surface p-3 grid gap-1">
          <p className="kicker">Recommended Strategy · {strat}</p>
          <p>{why}</p>
          <p className="text-[15px]"><strong>Dialect Phrasing ({DIALECTS.find((d) => d.id === dialect)?.label}):</strong> {sample}</p>
        </div>
      </div>
    </section>
  );
}
