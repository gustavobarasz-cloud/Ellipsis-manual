"use client";
// Under Fire Reset: the Black Belt capstone's "Drop Down a Belt" stack, each step with that belt's own pocket cues,
// and a 2-second breath pacer (W1 2-beat exhale). Not offered in Door 3, which keeps timers out.
import { useEffect, useState } from "react";
import resetJson from "@/content/phase2/reset.json";
import type { PocketCard } from "@/lib/types";
import { InlineMd } from "@/components/reader/Md";

const RESET = resetJson as { title: string; line: string; steps: { belt: string; text: string }[]; pacer: { label: string; sourceText: string; seconds: number } };

function Pacer({ seconds, label }: { seconds: number; label: string }) {
  const [on, setOn] = useState(false);
  const [beats, setBeats] = useState(0);
  useEffect(() => {
    if (!on) return;
    setBeats(0);
    const id = setInterval(() => setBeats((b) => b + 1), (seconds * 1000) / 2);
    return () => clearInterval(id);
  }, [on, seconds]);
  const phase = beats % 2 === 0 ? "1" : "2";
  return (
    <div className="pacer">
      <button type="button" className={`pacer-dot ${on ? "on" : ""}`} style={{ animationDuration: `${seconds}s` }} onClick={() => setOn((v) => !v)} aria-pressed={on} aria-label={on ? "Stop the pacer" : "Start the 2-second pacer"}>
        <span>{on ? phase : "2s"}</span>
      </button>
      <div className="min-w-0">
        <p className="font-bold">{label}</p>
        <p className="text-sm muted">{on ? "Breathe out on the beat. Tap to stop." : "Tap the circle to start a 2-second beat."}</p>
      </div>
    </div>
  );
}

export default function UnderFire({ pockets }: { pockets: Record<string, PocketCard> }) {
  return (
    <div className="mt-2 grid gap-3">
      <p className="text-[15px]"><InlineMd text={RESET.line} /></p>
      <Pacer seconds={RESET.pacer.seconds} label={RESET.pacer.label} />
      <ol className="reset-stack">
        {RESET.steps.map((s, i) => (
          <li key={s.belt} data-c={s.belt}>
            <span className="rs-n">{i + 1}</span>
            <div className="min-w-0">
              <p className="font-semibold"><InlineMd text={s.text} /></p>
              {(pockets[s.belt]?.cues || []).map((c) => (
                <p key={c.cue} className="text-sm"><b>{c.cue}</b>{c.sub ? <span className="muted"> {c.sub}</span> : null}</p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
