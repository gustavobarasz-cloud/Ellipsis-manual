"use client";
import { downloadText } from "./backup";
import type { Overrides } from "./store";

const stamp = () => new Date().toISOString().slice(0, 10);

export function editsMarkdown(ov: Overrides): string {
  const ids = Object.keys(ov).sort();
  const lines = [`# My edits to the Dojo`, ``, `Exported ${new Date().toISOString()} · ${ids.length} card${ids.length === 1 ? "" : "s"}`, ``];
  for (const id of ids) {
    const e = ov[id];
    lines.push(`## ${e.title || id}`, ``, `Card: \`${id}\` · edited ${e.at}`, ``, e.md.trim(), ``, `---`, ``);
  }
  return lines.join("\n");
}

export function exportEditsMarkdown(ov: Overrides) {
  downloadText(`dojo-edits-${stamp()}.md`, editsMarkdown(ov), "text/markdown");
}
export function exportEditsJson(ov: Overrides) {
  downloadText(`dojo-edits-${stamp()}.json`, JSON.stringify({ format: "dojo-content-overrides", version: 1, savedAt: new Date().toISOString(), overrides: ov }, null, 2));
}
