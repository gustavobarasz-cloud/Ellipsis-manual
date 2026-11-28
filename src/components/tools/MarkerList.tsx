"use client";
import Link from "next/link";
import Marker from "./Marker";

export default function MarkerList({ items }: { items: { id: string; text: string; where: string; href: string; module: string }[] }) {
  let last = "";
  return (
    <div className="grid gap-3">
      {items.map((x) => {
        const head = x.module !== last ? x.module : "";
        last = x.module;
        return (
          <div key={x.id}>
            {head && <h2 className="display text-[19px] mt-3 mb-2">{head}</h2>}
            <Marker spec={{ type: "marker", id: x.id, text: x.text }} />
            <Link href={x.href} className="text-sm muted underline mt-1 inline-block">{x.where}</Link>
          </div>
        );
      })}
    </div>
  );
}
