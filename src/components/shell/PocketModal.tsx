"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { PocketCard } from "@/lib/types";
import { IconClose } from "./icons";
import UnderFire from "@/components/p2/UnderFire";

export default function PocketModal({ card, belt, pockets, onClose }: { card: PocketCard; belt: string; pockets: Record<string, PocketCard>; onClose: () => void }) {
  const [flipped, setFlipped] = useState(false);
  // Door 3 (the Sanctuary card) keeps timers out, so it has no Under Fire tab.
  const tabs = belt !== "sanctuary";
  const [tab, setTab] = useState<"cues" | "fire">("cues");
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-label={`${card.belt} pocket card`}>
        <div className="pocket">
          <div className="flex items-center justify-between gap-2">
            <p className="kicker">{card.belt} · Pocket card</p>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <IconClose />
            </button>
          </div>
          {tabs && (
            <div className="seg cols-2 mt-2" role="tablist" aria-label="Pocket card">
              <button type="button" role="tab" aria-selected={tab === "cues"} aria-pressed={tab === "cues"} onClick={() => setTab("cues")}>Pocket Cues</button>
              <button type="button" role="tab" aria-selected={tab === "fire"} aria-pressed={tab === "fire"} onClick={() => setTab("fire")}>Under Fire Reset</button>
            </div>
          )}
          {tab === "fire" && tabs ? (
            <UnderFire pockets={pockets} />
          ) : !flipped ? (
            <div className="mt-2">
              {card.intro && <p className="muted text-sm mb-2">{card.intro}</p>}
              {card.cues.map((c, i) => (
                <div className="cue" key={i}>
                  <b>{c.cue}</b>
                  {c.sub && <small>{c.sub}</small>}
                </div>
              ))}
            </div>
          ) : (
            <div className="back">
              {card.back}
              {card.backSub && <p className="muted mt-3" style={{ fontFamily: "var(--font-body)", fontSize: 15 }}>{card.backSub}</p>}
            </div>
          )}
          <div className="btn-row mt-4" hidden={tab === "fire" && tabs}>
            <button type="button" className="btn primary flex-1" onClick={() => setFlipped((f) => !f)}>
              {flipped ? "Show the front" : "Flip the card"}
            </button>
            <Link href={`/field-card/${belt}`} className="btn">Print</Link>
          </div>
        </div>
      </div>
    </>
  );
}
