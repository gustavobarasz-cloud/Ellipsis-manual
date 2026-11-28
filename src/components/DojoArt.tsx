"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import practice from "@/data/practice.json";

/* Woodcut art from the Communication Dojo, served from /public/dojo/art. */

export const artSrc = (name: string) => `/dojo/art/${name}.jpg`;

type ArtBelt = "white" | "blue" | "brown" | "black" | "sanctuary";

const HERO_ALTS = practice.heroAlts as Record<ArtBelt, string>;
const POCKET = practice.pocketCards as Record<ArtBelt, { cues: string[]; cueNotes: string[]; back: string }>;
const BELT_MODULES = practice.beltModules as Record<string, Array<{ id: string; name: string }>>;
const LAYERS = practice.sanctuaryLayers as Array<{
  n: number;
  name: string;
  shift: string;
  modules: Array<{ id: string; name: string }>;
}>;

/** The belt's hero print, cropped to a banner. */
export function HeroBanner({ belt, className = "" }: { belt: ArtBelt; className?: string }) {
  return (
    <figure className={`dojo-frame ${className}`}>
      <img
        src={artSrc(`hero-${belt}`)}
        alt={HERO_ALTS[belt] ?? ""}
        width={1200}
        height={800}
        decoding="async"
        className="block h-40 w-full object-cover sm:h-56"
      />
    </figure>
  );
}

/** A plain art strip, like the Dojo's view banners. */
export function ArtStrip({ name, className = "" }: { name: string; className?: string }) {
  return (
    <div className={`dojo-frame ${className}`} aria-hidden="true">
      <img
        src={artSrc(name)}
        alt=""
        width={1000}
        height={400}
        loading="lazy"
        decoding="async"
        className="block h-24 w-full object-cover sm:h-32"
      />
    </div>
  );
}

/** The pocket card: woodcut front with the cues, tap to see the question on the back. */
export function PocketCard({ belt }: { belt: ArtBelt }) {
  const [flipped, setFlipped] = useState(false);
  const card = POCKET[belt];
  if (!card) return null;
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={flipped ? `Pocket card question: ${card.back}. Tap to see the cues.` : "Pocket card. Tap to flip."}
      className={`dojo-flip block aspect-[720/567] w-full max-w-[300px] text-left ${flipped ? "flipped" : ""}`}
    >
      <span className="inner block">
        <span
          className="face dojo-frame flex items-end p-3"
          style={{ backgroundImage: `url("${artSrc(`pc-${belt}`)}")` }}
        >
          <span className="dojo-plate block w-full px-3 py-2">
            {card.cues.map((c, i) => (
              <span key={c} className="block font-display text-[13px] leading-snug text-[#1d1710]">
                {c}
                {card.cueNotes[i] ? (
                  <span className="ml-1 font-sans text-[10px] text-stone-600">{card.cueNotes[i]}</span>
                ) : null}
              </span>
            ))}
          </span>
        </span>
        <span
          className="face back dojo-frame flex items-center justify-center p-4"
          style={{ backgroundImage: `url("${artSrc("pc-back")}")` }}
        >
          <span className="dojo-plate block px-4 py-3 text-center font-display text-base leading-snug text-[#1d1710]">
            &ldquo;{card.back}&rdquo;
          </span>
        </span>
      </span>
    </button>
  );
}

/** Six module prints for a belt, with their names. */
export function ModuleStrip({ belt }: { belt: string }) {
  const mods = BELT_MODULES[belt];
  if (!mods) return null;
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {mods.map((m) => (
        <li key={m.id} className="min-w-0">
          <img
            src={artSrc(`mod-${m.id}`)}
            alt=""
            width={640}
            height={640}
            loading="lazy"
            decoding="async"
            className="dojo-thumb block aspect-square w-full"
          />
          <p className="mt-1 font-mono text-[10px] text-stone-500">{m.id}</p>
          <p className="line-clamp-2 text-[11px] leading-tight text-stone-800">{m.name}</p>
        </li>
      ))}
    </ul>
  );
}

/** The four Sanctuary layers, each with its print. */
export function LayerStrip() {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {LAYERS.map((l) => (
        <li key={l.n} className="dojo-frame">
          <img
            src={artSrc(`layer${l.n}`)}
            alt=""
            width={1000}
            height={667}
            loading="lazy"
            decoding="async"
            className="block aspect-[3/2] w-full object-cover"
          />
          <div className="border-t-2 border-[#1d1710] px-3 py-2">
            <p className="font-mono text-[10px] text-stone-500">Layer {l.n}</p>
            <p className="font-display text-sm leading-snug text-[#1d1710]">{l.name}</p>
            <p className="text-[11px] leading-snug text-stone-600">{l.shift}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Small round emblem for a Grid skill (read, bond, reveal, word, steer, guard). */
export function Emblem({ skill, size = 34 }: { skill: string; size?: number }) {
  return (
    <img
      src={artSrc(`em-${skill}`)}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className="shrink-0 rounded-full border border-[#1d1710] object-cover"
      style={{ width: size, height: size }}
    />
  );
}
