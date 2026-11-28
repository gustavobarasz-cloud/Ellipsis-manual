// Parser for the card markdown dialect written by scripts/content/build.py.
// Blocks: ## / ### headings, paragraphs, "- " and "1. " lists (nested by two spaces), "- [ ] " checklists,
// "> " quotes, GFM tables, and containers ":::note Label", ":::warn Label", ":::details Summary",
// ":::dialect Label" (one "@dialect text" line per dialect) and ":::field Label" (a saved reflection box), each closed by ":::".
// Inline: **bold**, *em*, `code`. No raw HTML is ever rendered.

export type Inline = { t: "text"; v: string } | { t: "b"; c: Inline[] } | { t: "i"; c: Inline[] } | { t: "code"; v: string } | { t: "br" };

export interface ListItem { c: Inline[]; sub?: ListBlock; checked?: boolean | null }
export interface ListBlock { t: "list"; ordered: boolean; items: ListItem[]; start?: number }

export type Block =
  | { t: "h"; level: 2 | 3; c: Inline[] }
  | { t: "p"; c: Inline[] }
  | ListBlock
  | { t: "quote"; c: Block[] }
  | { t: "table"; head: Inline[][]; rows: Inline[][][] }
  | { t: "note"; tone: "note" | "warn"; label: string; c: Block[] }
  | { t: "details"; summary: string; c: Block[] }
  | { t: "dialect"; label: string; lines: Record<string, Inline[]> }
  | { t: "field"; label: string; placeholder: string; index: number };

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let i = 0;
  let buf = "";
  const flush = () => {
    if (buf) out.push({ t: "text", v: buf });
    buf = "";
  };
  while (i < src.length) {
    const ch = src[i];
    if (ch === "\n") {
      flush();
      out.push({ t: "br" });
      i++;
      continue;
    }
    if (ch === "`") {
      const j = src.indexOf("`", i + 1);
      if (j > i) {
        flush();
        out.push({ t: "code", v: src.slice(i + 1, j) });
        i = j + 1;
        continue;
      }
    }
    if (ch === "*" && src[i + 1] === "*") {
      const j = src.indexOf("**", i + 2);
      if (j > i + 1) {
        flush();
        out.push({ t: "b", c: parseInline(src.slice(i + 2, j)) });
        i = j + 2;
        continue;
      }
    }
    if (ch === "*" && src[i + 1] !== " " && src[i + 1] !== undefined) {
      // single-star emphasis; the closing star must not be part of a "**"
      let j = i + 1;
      while (j < src.length) {
        j = src.indexOf("*", j);
        if (j < 0) break;
        if (src[j + 1] === "*") { j += 2; continue; }
        break;
      }
      if (j > i + 1 && src[j - 1] !== " ") {
        flush();
        out.push({ t: "i", c: parseInline(src.slice(i + 1, j)) });
        i = j + 1;
        continue;
      }
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}

const OPEN = /^:::(note|warn|details|dialect|field)(?:\s+(.*))?$/;

function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  const cells: string[] = [];
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && s[i + 1] === "|") { cur += "|"; i++; continue; }
    if (s[i] === "|") { cells.push(cur.trim()); cur = ""; continue; }
    cur += s[i];
  }
  cells.push(cur.trim());
  return cells;
}

const LIST_RE = /^(\s*)(?:([-*])|(\d+)\.)\s+(.*)$/;

function parseList(lines: string[], start: number): [ListBlock, number] {
  const first = LIST_RE.exec(lines[start])!;
  const indent = first[1].length;
  const ordered = !!first[3];
  const block: ListBlock = { t: "list", ordered, items: [], start: ordered ? parseInt(first[3], 10) : undefined };
  let i = start;
  while (i < lines.length) {
    const m = LIST_RE.exec(lines[i]);
    if (!m) {
      // a continuation line indented under the last item
      if (lines[i].trim() && /^\s+/.test(lines[i]) && block.items.length) {
        const last = block.items[block.items.length - 1];
        last.c.push({ t: "br" }, ...parseInline(lines[i].trim()));
        i++;
        continue;
      }
      break;
    }
    const ind = m[1].length;
    if (ind < indent) break;
    if (ind > indent) {
      const [sub, ni] = parseList(lines, i);
      const last = block.items[block.items.length - 1];
      if (last) last.sub = sub;
      else block.items.push({ c: [], sub });
      i = ni;
      continue;
    }
    if (!!m[3] !== ordered) break;
    let text = m[4];
    let checked: boolean | null = null;
    const cm = /^\[( |x|X)\]\s+(.*)$/.exec(text);
    if (cm) { checked = cm[1] !== " "; text = cm[2]; }
    block.items.push({ c: parseInline(text), checked });
    i++;
  }
  return [block, i];
}

/** Parses card markdown into blocks. Field boxes are numbered in order so each can be saved under its card. */
export function parseMd(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const counter = { field: 0 };
  const [blocks] = parseBlocks(lines, 0, false, counter);
  return blocks;
}

function parseBlocks(lines: string[], start: number, nested: boolean, counter: { field: number }): [Block[], number] {
  const out: Block[] = [];
  let i = start;
  let para: string[] = [];
  const flushPara = () => {
    if (para.length) out.push({ t: "p", c: parseInline(para.join("\n")) });
    para = [];
  };
  while (i < lines.length) {
    const line = lines[i];
    const tr = line.trim();
    if (tr === ":::") {
      flushPara();
      if (nested) return [out, i + 1];
      i++;
      continue;
    }
    const open = OPEN.exec(tr);
    if (open) {
      flushPara();
      const kind = open[1];
      const label = (open[2] || "").trim();
      if (kind === "dialect") {
        const ls: Record<string, Inline[]> = {};
        i++;
        while (i < lines.length && lines[i].trim() !== ":::") {
          const m = /^@(\w+)\s?(.*)$/.exec(lines[i].trim());
          if (m) ls[m[1]] = parseInline(m[2]);
          i++;
        }
        out.push({ t: "dialect", label, lines: ls });
        i++;
        continue;
      }
      if (kind === "field") {
        const ph: string[] = [];
        i++;
        while (i < lines.length && lines[i].trim() !== ":::") { ph.push(lines[i]); i++; }
        out.push({ t: "field", label, placeholder: ph.join(" ").trim(), index: counter.field++ });
        i++;
        continue;
      }
      const [inner, ni] = parseBlocks(lines, i + 1, true, counter);
      i = ni;
      if (kind === "details") out.push({ t: "details", summary: label || "More", c: inner });
      else out.push({ t: "note", tone: kind === "warn" ? "warn" : "note", label, c: inner });
      continue;
    }
    if (!tr) { flushPara(); i++; continue; }
    const h = /^(#{2,6})\s+(.*)$/.exec(tr);
    if (h) {
      flushPara();
      out.push({ t: "h", level: h[1].length <= 2 ? 2 : 3, c: parseInline(h[2]) });
      i++;
      continue;
    }
    if (tr.startsWith("|") && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1].trim())) {
      flushPara();
      const head = splitRow(tr).map(parseInline);
      i += 2;
      const rows: Inline[][][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]).map(parseInline));
        i++;
      }
      out.push({ t: "table", head, rows });
      continue;
    }
    if (tr.startsWith(">")) {
      flushPara();
      const q: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        q.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      out.push({ t: "quote", c: parseBlocks(q, 0, false, counter)[0] });
      continue;
    }
    if (LIST_RE.test(line) && !para.length) {
      const [lst, ni] = parseList(lines, i);
      out.push(lst);
      i = ni;
      continue;
    }
    para.push(tr);
    i++;
  }
  flushPara();
  return [out, i];
}

/** Plain text of card markdown (for search and export previews). */
export function mdPlain(md: string): string {
  return md
    .replace(/^:::\w*\s?/gm, "")
    .replace(/^@\w+\s/gm, "")
    .replace(/[*`#>|]/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}
