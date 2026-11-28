"use client";
import Link from "next/link";
import { recordJump } from "@/lib/jump";

/** A link to another door or card that ← Back can return from. */
export default function JumpLink({ href, children, className, title, style, onClick, ...rest }: { href: string; children: React.ReactNode; className?: string; title?: string; style?: React.CSSProperties; onClick?: () => void; [k: `data-${string}`]: string | undefined }) {
  return (
    <Link href={href} className={className} title={title} style={style} {...rest} onClick={() => { recordJump(href); onClick?.(); }}>
      {children}
    </Link>
  );
}
