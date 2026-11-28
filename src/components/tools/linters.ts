// Text checks ported from the original manuals (blue-belt.html B1 and B5, brown-belt.html Br1 and Br6).
export interface Seg { text: string; cls?: "hl-bad" | "hl-ok"; title?: string }

function segments(raw: string, matches: { start: number; end: number; cls: Seg["cls"]; title?: string }[]): Seg[] {
  const out: Seg[] = [];
  let idx = 0;
  for (const m of matches) {
    if (m.start < idx) continue;
    if (m.start > idx) out.push({ text: raw.slice(idx, m.start) });
    out.push({ text: raw.slice(m.start, m.end), cls: m.cls, title: m.title });
    idx = m.end;
  }
  if (idx < raw.length) out.push({ text: raw.slice(idx) });
  return out;
}

const CAMERA_RE = /\b(defensive|evasive|lying|liar|nervous|anxious|annoyed|angry|hostile|arrogant|manipulative|insincere|guarded|bored|rude|cold|hiding|guilty|insecure)\b/gi;
export function analyzeCamera(raw: string) {
  const matches = Array.from(raw.matchAll(CAMERA_RE)).map((m) => ({ start: m.index!, end: m.index! + m[0].length, cls: "hl-bad" as const, title: "A camera could not record this" }));
  return { score: raw.trim() ? Math.max(0, 100 - 25 * matches.length) : 0, segs: segments(raw, matches), count: matches.length };
}

export function analyzeLabel(val: string): string[] {
  const errs: string[] = [];
  if (!/^(it seems|it sounds|it looks|seems like|sounds like|looks like|parece que|suena a)/i.test(val)) errs.push("Start with a neutral stem (It seems / sounds / looks like...).");
  if (/\?/.test(val)) errs.push("No question marks (?) — labels are statements.");
  if (/\bi understand\b/i.test(val)) errs.push('Drop "I understand" — it invites "No, you don\'t."');
  if (/\b(but|pero)\b/i.test(val)) errs.push('Drop "but/pero" — it cancels the label.');
  return errs;
}

export function analyzePeriodBut(v: string): { tone: "bad" | "warn" | "ok"; text: string } {
  const hasBut = /\b(but|pero|however|sorry|lo siento)\b/i.test(v);
  const hasPeriod = /\.\s+\S/.test(v);
  if (hasBut) return { tone: "bad", text: 'Flagged: replace "but/pero/sorry" with a hard Period (.)' };
  if (!hasPeriod) return { tone: "warn", text: "Add a second sentence after a full period." };
  return { tone: "ok", text: 'Clean Period-Not-"But" Empathy Boundary!' };
}

const POWERLESS_RE = /(?:^|[\s"“‘(])(sorry to bother|sorry|i just wanted to check|would it maybe|would it be okay if|is it alright if|if it'?s not too much trouble|just|maybe|kind of|sort of|possibly|i guess|perhaps|perd[oó]n que te moleste|perd[oó]n por molestar|disculpa la molestia|solo quer[ií]a ver si|si no es mucha molestia|capaz que|por ah[ií] podr[ií]amos|no s[eé] si se podr[ií]a|haha|\.\.\.)(?=$|[\s.,?!;"”’)])/gi;
const EPISTEMIC_RE = /\b(based on|from the data|i estimate|our projection|current range|as of)\b/gi;
const PROPOSAL_RE = /\b(i'?d like|i am asking|i'?m asking|i propose|let'?s|can we|would you|me gustaría|propongo|prefiero|quiero|necesito|podemos)\b/i;

export function analyzeAsk(raw: string) {
  if (!raw.trim()) return { score: 0, segs: [] as Seg[], notes: ["Write an ask to score it."], empty: true };
  const ms: { start: number; end: number; cls: Seg["cls"]; title: string; kind: "p" | "e" }[] = [];
  for (const m of Array.from(raw.matchAll(POWERLESS_RE))) {
    // the group starts after the optional leading space or quote
    const start = m.index! + m[0].length - m[1].length;
    ms.push({ start, end: start + m[1].length, cls: "hl-bad", title: "Powerless hedge/plea", kind: "p" });
  }
  for (const m of Array.from(raw.matchAll(EPISTEMIC_RE))) ms.push({ start: m.index!, end: m.index! + m[0].length, cls: "hl-ok", title: "Credible epistemic precision", kind: "e" });
  ms.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const clean: typeof ms = [];
  let cur = 0, bad = 0, ep = 0;
  for (const x of ms) if (x.start >= cur) { clean.push(x); x.kind === "p" ? bad++ : ep++; cur = x.end; }
  const hasProposal = PROPOSAL_RE.test(raw);
  let score = 100 - bad * 15;
  if (!hasProposal) score -= 22;
  if (ep > 0) score = Math.min(100, score + 5);
  score = Math.max(0, Math.min(100, score));
  const notes: string[] = [];
  if (bad) notes.push(`Strip ${bad} powerless hedge/plea phrase(s) highlighted in red.`);
  if (!hasProposal) notes.push("No clear proposal verb detected (“I'd like…”, “I'm asking…”, “Me gustaría…”). Make sure the ask survives the wrap!");
  if (ep) notes.push("Credible epistemic precision detected (green) — keep this!");
  if (!bad && hasProposal) notes.push("Strong intact proposal! The ask survives its wrap cleanly.");
  return { score, segs: segments(raw, clean), notes, empty: false };
}

const TOXIC_RE = /(?:^|[\s"“‘(])(sorry you felt|sorry if you felt|if i offended|if you were offended|i was only trying|i was just trying|i didn'?t mean to|my intention was|never meant to|you also|you made me|can you forgive me|hope you can forgive|forgive me|me perdon[aá]s|perd[oó]name|no fue mi intenci[oó]n|solo intentaba|but|pero)(?=$|[\s.,?!;"”’)])/gi;

export function analyzeRepair(raw: string) {
  if (!raw.trim()) return { score: 0, segs: [] as Seg[], checks: null as null | Record<string, boolean>, empty: true };
  const ms = Array.from(raw.matchAll(TOXIC_RE)).map((m) => {
    const start = m.index! + m[0].length - m[1].length;
    return { start, end: start + m[1].length, cls: "hl-bad" as const, title: "Defensive / excuse pattern — remove or replace with full period" };
  });
  const checks = {
    act: /\b(i interrupted|i steamrolled|i missed|i went quiet|i snapped|i dropped|i didn'?t|i was late|te interrumpí|me cerré|me equivoqué|no te dejé)\b/i.test(raw) || raw.split(/\s+/).length >= 10,
    own: /\b(i was wrong|my mistake|that was on me|i own|i'?m sorry for|i apologize for|me equivoqué|fue mi error|te pido disculpas)\b/i.test(raw),
    mech: /\b(because i|i got anxious|i rushed|i slipped into|me puse nervioso|por apurarme)\b/i.test(raw),
    offer: /\b(next time|going forward|i'?ll|i will|let me|can i|en la próxima|voy a|te doy)\b/i.test(raw),
    affirm: /\b(value|care about|respect|important to me|matters to me|me importa|valoro)\b/i.test(raw),
  };
  let score = 0;
  if (checks.act) score += 20;
  if (checks.own) score += 25;
  if (checks.mech) score += 15;
  if (checks.offer) score += 25;
  if (checks.affirm) score += 15;
  score = Math.max(0, score - ms.length * 22);
  return { score, segs: segments(raw, ms), checks, empty: false };
}
