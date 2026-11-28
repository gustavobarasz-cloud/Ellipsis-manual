"use client";
import { useEffect, useRef, useState } from "react";
import type { ToolSpec } from "@/lib/types";

/** Countdown timers (2-beat pause, SIT cap, 30s sweep, 45s compressor), with the manuals' phase prompts. */
export default function Timer({ spec }: { spec: ToolSpec }) {
  const total = Number(spec.seconds) || 30;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const end = useRef(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const ms = Math.max(0, end.current - Date.now());
      setLeft(ms / 1000);
      if (ms <= 0) {
        setRunning(false);
        setFinished(true);
        try { navigator.vibrate?.(200); } catch { /* ignore */ }
      }
    }, spec.tenths ? 100 : 250);
    return () => clearInterval(id);
  }, [running, spec.tenths]);
  const start = () => {
    end.current = Date.now() + total * 1000;
    setLeft(total);
    setFinished(false);
    setRunning(true);
  };
  const phases: [number, string][] = spec.phases || [];
  const phase = running ? phases.find(([at]) => left > at)?.[1] : undefined;
  const fmt = spec.tenths ? `${left.toFixed(1)}s` : left >= 60 ? `${Math.floor(Math.ceil(left) / 60)}:${String(Math.ceil(left) % 60).padStart(2, "0")}` : `${Math.ceil(left)}s`;
  return (
    <section className="tool">
      <h3>{spec.title}</h3>
      {spec.help && <p className="help">{spec.help}</p>}
      <p className="big-num" aria-live="polite">{running || finished ? fmt : spec.display || fmt}</p>
      <div className="meter mt-3"><i style={{ width: `${(1 - left / total) * 100}%` }} /></div>
      {phase && <p className="mt-2 font-semibold">{phase}</p>}
      {finished && spec.done && <p className="mt-2 font-semibold" role="status">{spec.done}</p>}
      <div className="btn-row mt-3">
        {!running ? (
          <button type="button" className="btn primary" onClick={start}>{spec.button || "Start"}</button>
        ) : (
          <button type="button" className="btn" onClick={() => { setRunning(false); setLeft(total); }}>Stop</button>
        )}
      </div>
    </section>
  );
}
