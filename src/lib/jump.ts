"use client";
// Cross-door jumps (pills, search, Lens Flipper, pins) remember where they came from,
// so the top bar's ← Back returns there instead of to the parent page.
const KEY = "dojo_jumps_v1";
interface J { from: string; to: string; live: boolean }
const live = new Set<string>(); // jumps made since this page load, which the browser history can undo

function read(): J[] {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(s: J[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(s.slice(-30)));
  } catch {
    /* ignore */
  }
}
const bare = (href: string) => href.split("#")[0].split("?")[0];

export function recordJump(to: string) {
  if (typeof window === "undefined") return;
  const from = window.location.pathname + window.location.search + window.location.hash;
  if (bare(from) === bare(to)) return;
  const s = read();
  s.push({ from, to: bare(to), live: true });
  live.add(bare(to));
  write(s);
}

/** Where ← Back should go from this page: the page a jump started from, if this page is the jump's target. */
export function backTarget(pathname: string): { from: string; useHistory: boolean } | null {
  const s = read();
  const top = s[s.length - 1];
  if (!top || top.to !== pathname) return null;
  return { from: top.from, useHistory: live.has(pathname) };
}
export function popJump() {
  const s = read();
  const top = s.pop();
  if (top) live.delete(top.to);
  write(s);
}

/** Adds ?thread=<id> before any #card hash. */
export function withThread(href: string, thread?: string) {
  if (!thread) return href;
  const [p, h] = href.split("#");
  return `${p}?thread=${encodeURIComponent(thread)}${h ? `#${h}` : ""}`;
}
