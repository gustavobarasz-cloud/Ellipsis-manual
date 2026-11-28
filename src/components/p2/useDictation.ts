"use client";
// Web Speech dictation for the debrief's one-sentence takeaway. On Android Chrome recognition runs on Google's
// servers, so it needs a connection; offline or unsupported, the box simply stays a text box.
import { useEffect, useRef, useState } from "react";

export function useDictation(lang: string, onText: (t: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<any>(null);
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!SR);
    return () => rec.current?.abort?.();
  }, []);
  const start = () => {
    setError(null);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return setError("Dictation isn't available in this browser. Type it instead.");
    if (typeof navigator !== "undefined" && navigator.onLine === false) return setError("You're offline, and dictation here needs a connection. Type it instead.");
    try {
      const r = new SR();
      r.lang = lang;
      r.interimResults = false;
      r.continuous = false;
      r.maxAlternatives = 1;
      r.onresult = (e: any) => {
        const t = Array.from(e.results as ArrayLike<any>).map((x: any) => x[0]?.transcript || "").join(" ").trim();
        if (t) onText(t);
      };
      r.onerror = (e: any) => {
        const code = e?.error;
        setError(
          code === "network" ? "Dictation needs a connection here. Type it instead." :
          code === "not-allowed" || code === "service-not-allowed" ? "The microphone is blocked for this site. Type it instead." :
          code === "no-speech" ? "I didn't catch anything. Try again, or type it." :
          "Dictation stopped. Type it instead.",
        );
      };
      r.onend = () => setListening(false);
      rec.current = r;
      r.start();
      setListening(true);
    } catch {
      setListening(false);
      setError("Dictation couldn't start. Type it instead.");
    }
  };
  const stop = () => {
    rec.current?.stop?.();
    setListening(false);
  };
  return { supported, listening, error, start, stop };
}
