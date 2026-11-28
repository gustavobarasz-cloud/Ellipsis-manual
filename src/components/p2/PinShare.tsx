"use client";
// Star (pin up to 3 cards into Active Focus on Learn) and Share (copies a ?card= link) in the card header.
import { useState } from "react";
import { updateP2, useMaster } from "@/lib/store";
import { IconShare, IconStar } from "@/components/shell/icons";

export const MAX_PINS = 3;

export default function PinShare({ cardId, title, where, href }: { cardId: string; title: string; where: string; href: string }) {
  const m = useMaster();
  const pins = m.p2?.pins || [];
  const on = pins.some((p) => p.id === cardId);
  const [msg, setMsg] = useState<string | null>(null);
  const flash = (t: string) => {
    setMsg(t);
    setTimeout(() => setMsg(null), 2200);
  };
  const toggle = () => {
    if (on) return updateP2((p) => ({ ...p, pins: p.pins.filter((x) => x.id !== cardId) }));
    if (pins.length >= MAX_PINS) return flash("Three cards are pinned. Unpin one on Learn first.");
    updateP2((p) => ({ ...p, pins: [...p.pins, { id: cardId, href, title, where }] }));
    flash("Pinned to Active Focus on Learn.");
  };
  const share = async () => {
    const url = `${window.location.origin}/?card=${encodeURIComponent(cardId)}`;
    try {
      await navigator.clipboard.writeText(url);
      flash("Link copied.");
    } catch {
      try {
        if (typeof navigator.share === "function") {
          await navigator.share({ title, url });
          return;
        }
      } catch {
        /* closed */
      }
      flash(url);
    }
  };
  return (
    <span className="pin-share no-print">
      <button type="button" className="icon-btn sm" aria-pressed={on} onClick={toggle} aria-label={on ? "Unpin this card" : "Pin this card to Active Focus"} title={on ? "Unpin" : "Pin to Active Focus"}>
        <IconStar on={on} />
      </button>
      <button type="button" className="icon-btn sm" onClick={share} aria-label="Copy a link to this card" title="Share card">
        <IconShare />
      </button>
      {msg && <span className="pin-msg" role="status">{msg}</span>}
    </span>
  );
}
