"use client";
// Pitch check: record yourself, play it back, throw it away. The recording lives only in this tab's memory:
// nothing is saved or uploaded, and it is gone when you leave the card. Without a microphone (or with
// MediaRecorder missing) it falls back to a visual timer.
import { useEffect, useRef, useState } from "react";
import type { ToolSpec } from "@/lib/types";
import { InlineMd } from "@/components/reader/Md";

type Mode = "idle" | "rec" | "done";

export default function PitchCheck({ spec }: { spec: ToolSpec }) {
  const target = Number(spec.seconds) || 0;
  const [supported, setSupported] = useState<boolean | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [t, setT] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [timerOnly, setTimerOnly] = useState(false);
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const start = useRef(0);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && typeof (window as any).MediaRecorder === "function" && !!navigator.mediaDevices?.getUserMedia);
  }, []);
  useEffect(() => {
    if (mode !== "rec") return;
    const id = setInterval(() => {
      const s = (Date.now() - start.current) / 1000;
      setT(s);
      if (target && s >= target && timerOnly) stop();
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, target, timerOnly]);
  // Forget the recording when the card closes.
  useEffect(() => () => {
    stream.current?.getTracks().forEach((x) => x.stop());
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  const begin = async () => {
    setErr(null);
    if (url) {
      URL.revokeObjectURL(url);
      setUrl(null);
    }
    const timer = () => {
      setTimerOnly(true);
      start.current = Date.now();
      setT(0);
      setMode("rec");
    };
    if (!supported) return timer();
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;
      const r = new MediaRecorder(s);
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = () => {
        s.getTracks().forEach((x) => x.stop());
        stream.current = null;
        setUrl(URL.createObjectURL(new Blob(chunks, { type: r.mimeType || "audio/webm" })));
      };
      rec.current = r;
      r.start();
      setTimerOnly(false);
      start.current = Date.now();
      setT(0);
      setMode("rec");
    } catch {
      setErr("The microphone isn't available here, so this runs as a timer only.");
      timer();
    }
  };
  const stop = () => {
    if (rec.current && rec.current.state !== "inactive") rec.current.stop();
    rec.current = null;
    setMode("done");
  };
  const discard = () => {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setMode("idle");
    setT(0);
  };

  const over = target > 0 && t > target;
  return (
    <section className="tool">
      <h3>{spec.title}</h3>
      {spec.prompt && <p className="help"><InlineMd text={spec.prompt} /></p>}
      <p className="big-num" aria-live="polite" style={over ? { color: "var(--action-red)" } : undefined}>
        {t.toFixed(1)}s{target ? <span className="text-base muted"> / {target}s</span> : null}
      </p>
      {target > 0 && <div className="meter mt-3"><i style={{ width: `${Math.min(100, (t / target) * 100)}%` }} /></div>}
      <div className="btn-row mt-3">
        {mode === "rec" ? (
          <button type="button" className="btn primary" onClick={stop}>Stop</button>
        ) : (
          <button type="button" className="btn primary" onClick={begin}>{supported === false ? "Start the timer" : mode === "done" ? "Record again" : "Record"}</button>
        )}
        {mode === "done" && url && <button type="button" className="btn" onClick={discard}>Discard</button>}
      </div>
      {url && <audio className="mt-3 w-full" controls src={url} />}
      {err && <p className="text-sm mt-2" role="status">{err}</p>}
      <p className="text-xs muted mt-2">
        {supported === false
          ? "This browser can't record audio, so this is a visual timer."
          : "The recording stays in this tab's memory only. Nothing is saved or uploaded, and it's gone when you leave this card."}
      </p>
    </section>
  );
}
