import Link from "next/link";
import { notFound } from "next/navigation";
import { EXTRAS } from "@/lib/content";
import PrintButton from "@/components/shell/PrintButton";

const BELTS = ["white", "blue", "brown", "black", "sanctuary"];
const NAME: Record<string, string> = { white: "White Belt", blue: "Blue Belt", brown: "Brown Belt", black: "Black Belt", sanctuary: "Sanctuary" };

export const dynamicParams = false;

export function generateStaticParams() {
  return BELTS.map((belt) => ({ belt }));
}
export function generateMetadata({ params }: { params: { belt: string } }) {
  return { title: `${NAME[params.belt] || "Belt"} field card` };
}

export default function FieldCardPage({ params }: { params: { belt: string } }) {
  const card = EXTRAS.pockets[params.belt];
  if (!card) notFound();
  return (
    <div>
      <div className="no-print">
        <h1 className="display text-[26px]">Field cards</h1>
        <p className="muted mt-1">Print a card, cut along the border, fold it in half and keep it in your wallet.</p>
        <div className="seg cols-3 sm:grid-cols-5 mt-4" role="group" aria-label="Choose a belt">
          {BELTS.map((b) => (
            <Link key={b} href={`/field-card/${b}`} aria-current={b === params.belt ? "page" : undefined} className="btn sm" style={b === params.belt ? { background: "var(--track-accent)", color: "var(--on-accent)", borderColor: "var(--track-accent)" } : undefined}>
              {NAME[b]}
            </Link>
          ))}
        </div>
        <div className="mt-4"><PrintButton /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 mt-6 print:grid-cols-2 print:mt-0">
        <section className="pocket field-card" aria-label="Front">
          <p className="kicker">{NAME[params.belt]} · Pocket card</p>
          {card.intro && <p className="muted text-sm mt-2">{card.intro}</p>}
          <div className="mt-2">
            {card.cues.map((c, i) => (
              <div className="cue" key={i}>
                <b>{c.cue}</b>
                {c.sub && <small>{c.sub}</small>}
              </div>
            ))}
          </div>
        </section>
        <section className="pocket field-card flex flex-col justify-center" aria-label="Back">
          <p className="kicker text-center">The question</p>
          <div className="back">{card.back}</div>
          {card.backSub && <p className="muted text-center">{card.backSub}</p>}
        </section>
      </div>
    </div>
  );
}
