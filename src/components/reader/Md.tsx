"use client";
// Renders card markdown. Dialect blocks follow the dialect chosen in the ⋯ menu; reflection boxes and
// checklists save under the card's id (in Demo Mode they save to the blank demo state, which is thrown away).
import { Fragment, useMemo } from "react";
import { parseMd, type Block, type Inline, type ListBlock } from "@/lib/md";
import { DIALECTS } from "@/lib/types";
import { setAppKey, setSettings, useMaster, useSettings } from "@/lib/store";

export function Inl({ c }: { c: Inline[] }) {
  return (
    <>
      {c.map((n, i) => {
        switch (n.t) {
          case "text": return <Fragment key={i}>{n.v}</Fragment>;
          case "b": return <strong key={i}><Inl c={n.c} /></strong>;
          case "i": return <em key={i}><Inl c={n.c} /></em>;
          case "code": return <code key={i}>{n.v}</code>;
          case "br": return <br key={i} />;
        }
      })}
    </>
  );
}

/** Inline markdown in a plain string (tool text, labels). */
export function InlineMd({ text }: { text: string }) {
  const blocks = useMemo(() => parseMd(text), [text]);
  if (blocks.length === 1 && blocks[0].t === "p") return <Inl c={blocks[0].c} />;
  return <Blocks blocks={blocks} cardId="" counter={{ check: 0 }} />;
}

export default function Md({ md, cardId, className = "prose-card" }: { md: string; cardId: string; className?: string }) {
  const blocks = useMemo(() => parseMd(md), [md]);
  return (
    <div className={className}>
      <Blocks blocks={blocks} cardId={cardId} counter={{ check: 0 }} />
    </div>
  );
}

function Blocks({ blocks, cardId, counter }: { blocks: Block[]; cardId: string; counter: { check: number } }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} b={b} cardId={cardId} counter={counter} />
      ))}
    </>
  );
}

function BlockView({ b, cardId, counter }: { b: Block; cardId: string; counter: { check: number } }) {
  switch (b.t) {
    case "h":
      return b.level === 2 ? <h2><Inl c={b.c} /></h2> : <h3><Inl c={b.c} /></h3>;
    case "p":
      return <p><Inl c={b.c} /></p>;
    case "list":
      return <ListView l={b} cardId={cardId} counter={counter} />;
    case "quote":
      return <blockquote><Blocks blocks={b.c} cardId={cardId} counter={counter} /></blockquote>;
    case "table":
      return (
        <div className="tbl">
          <table>
            <thead>
              <tr>{b.head.map((h, i) => <th key={i}><Inl c={h} /></th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j}><Inl c={c} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "note":
      return (
        <div className={`note ${b.tone === "warn" ? "warn" : ""}`}>
          {b.label && <span className="nl">{b.label}</span>}
          <Blocks blocks={b.c} cardId={cardId} counter={counter} />
        </div>
      );
    case "details":
      return (
        <details>
          <summary>{b.summary}</summary>
          <div className="inner"><Blocks blocks={b.c} cardId={cardId} counter={counter} /></div>
        </details>
      );
    case "dialect":
      return <DialectView label={b.label} lines={b.lines} />;
    case "field":
      return <FieldBox cardId={cardId} index={b.index} label={b.label} placeholder={b.placeholder} />;
  }
}

function ListView({ l, cardId, counter }: { l: ListBlock; cardId: string; counter: { check: number } }) {
  const isChecks = l.items.length > 0 && l.items.every((it) => it.checked !== null && it.checked !== undefined);
  if (isChecks) {
    return (
      <ul className="checks">
        {l.items.map((it, i) => {
          const n = counter.check++;
          return (
            <li key={i}>
              <CheckItem cardId={cardId} n={n} c={it.c} />
              {it.sub && <ListView l={it.sub} cardId={cardId} counter={counter} />}
            </li>
          );
        })}
      </ul>
    );
  }
  const Tag = l.ordered ? "ol" : "ul";
  return (
    <Tag start={l.ordered && l.start && l.start !== 1 ? l.start : undefined}>
      {l.items.map((it, i) => (
        <li key={i}>
          <Inl c={it.c} />
          {it.sub && <ListView l={it.sub} cardId={cardId} counter={counter} />}
        </li>
      ))}
    </Tag>
  );
}

function CheckItem({ cardId, n, c }: { cardId: string; n: number; c: Inline[] }) {
  const m = useMaster();
  const key = `${cardId}#c${n}`;
  const on = m.app.fields[key] === "1";
  if (!cardId) return <span><Inl c={c} /></span>;
  return (
    <label>
      <input type="checkbox" checked={on} onChange={(e) => setAppKey("fields", key, e.target.checked ? "1" : "")} />
      <span><Inl c={c} /></span>
    </label>
  );
}

function FieldBox({ cardId, index, label, placeholder }: { cardId: string; index: number; label: string; placeholder: string }) {
  const m = useMaster();
  const key = `${cardId}#${index}`;
  const value = m.app.fields[key] || "";
  return (
    <label className="rfield">
      <span>{label}</span>
      <textarea className="textarea" value={value} placeholder={placeholder} onChange={(e) => setAppKey("fields", key, e.target.value)} />
    </label>
  );
}

function DialectView({ label, lines }: { label: string; lines: Record<string, Inline[]> }) {
  const { dialect } = useSettings();
  const avail = DIALECTS.filter((d) => lines[d.id]);
  const shown = lines[dialect] ? dialect : avail[0]?.id;
  if (!shown) return null;
  return (
    <div className="dialect">
      <div className="dl">
        <span>{label || "Script"}</span>
        <span className="flex gap-1 no-print" role="group" aria-label="Dialect">
          {avail.map((d) => (
            <button
              key={d.id}
              type="button"
              className="badge"
              style={d.id === shown ? { background: "var(--track-accent)", color: "var(--on-accent)", borderColor: "var(--track-accent)" } : undefined}
              aria-pressed={d.id === shown}
              onClick={() => setSettings({ dialect: d.id })}
            >
              {d.short}
            </button>
          ))}
        </span>
      </div>
      <div><Inl c={lines[shown]} /></div>
    </div>
  );
}
