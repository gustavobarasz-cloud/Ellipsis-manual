import Link from "next/link";
import { TRACKS } from "@/lib/content";

const BLURB: Record<string, string> = {
  profiling: "Read people accurately: baselines, needs, decisions and influence, across 12 modules in 6 tiers.",
  communication: "Hold your ground, read and bond, shape what you say, then steer the room. Four belts, 18 parts each.",
  presence: "Four layers of closeness: the inner sanctuary, the I-Thou encounter, the poetics of connection and the relational ecosystem.",
};

export default function HomePage() {
  return (
    <div className="pt-2 pb-6">
      <p className="kicker" style={{ color: "var(--muted)" }}>Choose a door</p>
      <h1 className="display text-[30px] sm:text-[40px] mt-1 mb-5">Where do you want to work today?</h1>
      <div className="doors">
        {TRACKS.map((t) => (
          <Link key={t.id} href={`/${t.id}`} className={`door ${t.id}`}>
            <span className="n" aria-hidden="true">{t.door}</span>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
            <p style={{ fontSize: 14, opacity: 0.78 }}>{BLURB[t.id]}</p>
            <span className="go">Enter ›</span>
          </Link>
        ))}
      </div>
      <p className="text-sm muted mt-6">
        Your journal saves in this browser only. Use Export JSON in the ⋯ menu to keep a backup or move it to another device.
      </p>
    </div>
  );
}
