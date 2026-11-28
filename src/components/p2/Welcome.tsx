"use client";
// A 2-card first-visit guide. Shown once (dojo_welcome_v1); "Replay Welcome Guide" in ⋯ opens it again.
import { useEffect, useState } from "react";

export const WELCOME_KEY = "dojo_welcome_v1";

const CARDS = [
  {
    k: "Welcome to the Dojo",
    h: "Three doors, one way around",
    rows: [
      ["← Back", "returns you to where you came from, even after a jump to another door."],
      ["Pocket card", "your belt's cues, and the Under Fire reset for heated moments."],
      ["⋯", "search all three doors, dialect, theme, Demo Mode, backup."],
      ["Learn · Practice · Journal", "the three tabs inside each door."],
    ],
  },
  {
    k: "Inside every card",
    h: "Link, pin, log",
    rows: [
      ["Coloured pills", "under a card open the same idea in the other doors."],
      ["☆ Star", "pins up to three cards to Active Focus on Learn."],
      ["Log Encounter", "at the top of Journal is a 30-second debrief after a real conversation."],
      ["Demo Mode", "hides every entry, person and log when you show the app to someone."],
    ],
  },
];

export function seenWelcome(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === "1";
  } catch {
    return true;
  }
}

export default function Welcome({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const done = () => {
    try {
      localStorage.setItem(WELCOME_KEY, "1");
    } catch {
      /* ignore */
    }
    onClose();
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && done();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const c = CARDS[i];
  return (
    <>
      <div className="scrim" onClick={done} />
      <div className="modal" role="dialog" aria-modal="true" aria-label="Welcome guide">
        <div className="pocket">
          <p className="kicker">{c.k} · {i + 1} of {CARDS.length}</p>
          <h2 className="display text-[24px] mt-1 mb-3">{c.h}</h2>
          <div>
            {c.rows.map(([a, b]) => (
              <div className="cue" key={a}>
                <b>{a}</b>
                <small>{b}</small>
              </div>
            ))}
          </div>
          <div className="btn-row mt-4">
            {i > 0 && <button type="button" className="btn" onClick={() => setI(i - 1)}>Back</button>}
            {i < CARDS.length - 1 ? (
              <button type="button" className="btn primary flex-1" onClick={() => setI(i + 1)}>Next</button>
            ) : (
              <button type="button" className="btn primary flex-1" onClick={done}>Start</button>
            )}
            <button type="button" className="btn" onClick={done}>Skip</button>
          </div>
        </div>
      </div>
    </>
  );
}
