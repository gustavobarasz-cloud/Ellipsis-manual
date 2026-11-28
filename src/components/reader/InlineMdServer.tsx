// Inline markdown for server-rendered text (module intros and meta). No HTML is rendered from content.
import { Fragment } from "react";
import { parseInline, type Inline } from "@/lib/md";

function Inl({ c }: { c: Inline[] }) {
  return (
    <>
      {c.map((n, i) =>
        n.t === "text" ? <Fragment key={i}>{n.v}</Fragment> :
        n.t === "b" ? <strong key={i}><Inl c={n.c} /></strong> :
        n.t === "i" ? <em key={i}><Inl c={n.c} /></em> :
        n.t === "code" ? <code key={i}>{n.v}</code> : <br key={i} />,
      )}
    </>
  );
}

export function InlineMdServer({ text }: { text: string }) {
  return <Inl c={parseInline(text)} />;
}
