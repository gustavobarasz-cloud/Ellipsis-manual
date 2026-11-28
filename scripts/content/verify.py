#!/usr/bin/env python3
"""Checks the migrated content against the source manuals.

1. Counts: 18 lesson parts per belt, 162 Socratic rungs each for Blue and Brown,
   7 resolved seams, 13 Sanctuary modules, 7 cautions, 12 Ellipsis modules.
2. Text diff: every text string in the sources must appear, word for word
   (markup aside), somewhere in the migrated cards or tool data.
Writes scripts/content/verify-report.md and exits 1 if a count is off.
"""
import glob, json, os, re, sys
from bs4 import BeautifulSoup
sys.path.insert(0, os.path.dirname(__file__))
from mdconv import plain, norm_text

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CACHE = os.path.join(os.path.dirname(__file__), ".cache")
DOJO = os.path.join(ROOT, "public", "dojo")
C = os.path.join(ROOT, "src", "content")

mods = {}
for f in glob.glob(os.path.join(C, "modules", "*", "*.json")):
    m = json.load(open(f, encoding="utf8"))
    mods[m["id"]] = m
tools = json.load(open(os.path.join(C, "tools.json"), encoding="utf8"))
journal = json.load(open(os.path.join(C, "journal.json"), encoding="utf8"))
extras = json.load(open(os.path.join(C, "extras.json"), encoding="utf8"))


def leaves(v, skip=("id", "t", "k", "key", "belt", "dojo", "mode", "picker", "status", "pitStage", "moduleId", "stage", "accent", "ans_key", "l2Hook", "codexIds")):
    if isinstance(v, str):
        yield v
    elif isinstance(v, list):
        for x in v:
            yield from leaves(x, skip)
    elif isinstance(v, dict):
        for k, x in v.items():
            if k in skip:
                continue
            yield from leaves(x, skip)


# ---- output corpus
parts = []
for m in mods.values():
    for k in ("title", "subtitle", "kicker", "guardrail", "golden", "gate", "intro", "question", "assembly", "tierTitle", "tierSubtitle", "goldenLabel"):
        if isinstance(m.get(k), str):
            parts.append(plain(m[k]))
    for d in m["days"]:
        parts.append(norm_text(d["title"]))
        parts.append(norm_text(d.get("author") or ""))
        for c in d["cards"]:
            parts.append(plain(c["md"]))
            parts.append(norm_text(c["title"]))
TOOL_TYPES = {"deck", "rungs", "drill", "timer", "linter", "form", "bodymap", "grid", "marker", "evidence", "faceweight", "radar", "legacy"}
for t_ in tools.values():
    if t_.get("type") in TOOL_TYPES:
        t_ = {k: v for k, v in t_.items() if k != "type"}
    parts.extend(norm_text(x) for x in leaves(t_, skip=()))
for s in leaves([journal, extras], skip=("type",)):
    parts.append(norm_text(s))
CORPUS = "\n".join(parts)


CHROME = [r"^(Brown|Black) Belt · B[rk]\d · Deliverable: ",  # header composed from module id + deliverable name, both migrated
          r"^Mark \w+ Complete$",
          # live widget readouts (scores, counters, timers) are computed by the tool at run time, not lesson text
          r"^~\d+s \(Target", r"Socratic Rungs Answered: \d+ / \d+", r"\(1–5\) \d+/5$", r"Currently logged: \d+ entr", r"^Stamp Deliverable", r"Tap to test exit", r"^Run it with Claude$", r"^Begin the (minute|read)$",
          r"^L\d · \w+$", r"^(Br|Bk)\d · "]


def src_norm(s):
    s = re.sub(r"<[^>]+>", " ", s)
    s = s.replace("&amp;", "&").replace("&nbsp;", " ")
    return plain(s)


def check(name, strings, min_len=12):
    total = missing = 0
    miss = []
    for s in strings:
        n = src_norm(s)
        if any(re.search(p, n) for p in CHROME):
            continue
        if len(n) < min_len or not re.search(r"[A-Za-zÁÉÍÓÚáéíóúñ]{3}", n):
            continue
        total += 1
        if n in CORPUS:
            continue
        # tolerate a string split across blocks: every sentence must be present
        sents = [x.strip() for x in re.split(r"(?<=[.!?…])\s+", n) if len(x.strip()) >= min_len]
        if sents and all(x in CORPUS for x in sents):
            continue
        # a short label run into its content ("Incoming Push: “…”"): both halves must be present
        m_ = re.match(r"^(.{3,60}?):\s+(.+)$", n)
        if m_ and m_.group(1) in CORPUS and m_.group(2) in CORPUS:
            continue
        missing += 1
        miss.append(n[:220])
    return total, missing, miss


CHROME_CLASSES = {"part-tabs", "dialect-bar", "layer-tag", "save-pill", "day-nav", "week-nav", "pocket-card", "pocket",
                  "timer", "no-print-md", "tabbar", "topbar", "bottom-nav", "td-lbl"}
DROP_TAGS = ["button", "select", "option", "script", "style", "textarea", "input", "nav", "svg", "noscript"]
INLINE = {"span", "strong", "b", "em", "i", "a", "code", "small", "label", "br", "sup", "sub"}


def _clean(node):
    """Strip UI chrome (tabs, buttons, layer tags, save pills, form controls) before reading text."""
    import copy
    n = copy.copy(node)
    for t in n.find_all(DROP_TAGS):
        t.decompose()
    for t in n.find_all("br"):
        t.replace_with(" ")
    # controls inside an interactive lab are the lab tool's own UI; the lab is ported as a tool (or linked)
    for box in n.find_all(class_="lab-box"):
        for t in box.find_all("label"):
            t.decompose()
    for t in n.find_all(class_=lambda c: c and set(c.split() if isinstance(c, str) else c) & CHROME_CLASSES):
        t.decompose()
    return n


def html_strings(node):
    node = _clean(node)
    out = []
    for el in node.find_all(["p", "li", "td", "th", "h1", "h2", "h3", "h4", "summary", "label", "blockquote", "div"]):
        if el.find(["p", "li", "ul", "ol", "table", "div", "h1", "h2", "h3", "h4", "label"]):
            continue
        if el.name == "label" and el.find_parent(["p", "li", "td", "th"]):
            continue
        kids = [c for c in el.children if getattr(c, "name", None)]
        direct_text = any(not getattr(c, "name", None) and str(c).strip() for c in el.children)
        if el.name == "div" and kids and all(c.name in INLINE for c in kids) and (len(kids) >= 2 or direct_text):
            # a row of separate inline pieces (label + value, chip strips): check each piece on its own
            for c in el.children:
                t = c.get_text("", strip=False) if getattr(c, "name", None) else str(c)
                if t.strip():
                    out.append(t)
            continue
        out.append(el.get_text("", strip=False))
    return out


report = []
results = {}
# White: static HTML views
ws = BeautifulSoup(open(os.path.join(DOJO, "white-belt.html"), encoding="utf8").read(), "lxml")
wstr = []
for v in ws.select("section.view"):
    wstr += html_strings(v)
wc = json.load(open(os.path.join(CACHE, "white", "consts.json"), encoding="utf8"))
wstr += list(leaves({k: wc[k] for k in ("decks", "WHITE_DIALECTS", "WHITE_GUARD_STAGES")}))
results["White Belt (HTML views + decks, dialects, grid)"] = check("white", wstr)

# Blue: embedded JSON
bs = BeautifulSoup(open(os.path.join(DOJO, "blue-belt.html"), encoding="utf8").read(), "lxml")
BD = json.loads(bs.find("script", id="dojo-data").string)
NOT_MIGRATED = {"drills": "Claude-run drills P4/P6 (worked only inside claude.ai)", "hiddenNeeds": "need list used only by the Claude-run P6 drill"}
for t_ in BD["capstone"]["tests"]:
    t_.pop("rehearse", None)
results["Blue Belt (embedded data)"] = check("blue", list(leaves({k: v for k, v in BD.items() if k not in NOT_MIGRATED})))

# Brown: deep layers, canon, data globals, rendered Thu/Fri/overview/capstone views
bdir = os.path.join(CACHE, "brown")
G = json.load(open(os.path.join(bdir, "globals.json"), encoding="utf8"))
G.pop("defaultState", None)
brs = list(leaves(json.load(open(os.path.join(bdir, "deep.json"), encoding="utf8")))) + list(leaves(json.load(open(os.path.join(bdir, "canon.json"), encoding="utf8")))) + list(leaves(G))
for f in glob.glob(os.path.join(bdir, "*.html")):
    brs += html_strings(BeautifulSoup(open(f, encoding="utf8").read(), "lxml"))
results["Brown Belt (deep layers, canon, data, rendered views in all 4 dialects)"] = check("brown", brs)

# Black: embedded JSON + rendered views
ks = BeautifulSoup(open(os.path.join(DOJO, "black-belt.html"), encoding="utf8").read(), "lxml")
KD = json.loads(ks.find("script", id="black-data").string)
kstr = list(leaves(KD, skip=("id", "t", "k", "body", "head", "map")))  # 'body' is the raw text whose parsed parts are checked
for m in KD["modules"].values():
    for dk in ("thu", "fri"):
        kstr.append(m["days"][dk]["body"])
for f in glob.glob(os.path.join(CACHE, "black", "*.html")):
    kstr += html_strings(BeautifulSoup(open(f, encoding="utf8").read(), "lxml"))
results["Black Belt (embedded data, rendered views in all 4 dialects)"] = check("black", kstr)

# Sanctuary
ss = BeautifulSoup(open(os.path.join(DOJO, "sanctuary.html"), encoding="utf8").read(), "lxml")
SD = json.loads(ss.find("script", id="sanctuary-data").string)
results["Sanctuary (embedded data)"] = check("sanctuary", list(leaves(SD)))

# Ellipsis modules + Pit addendum
estr = []
for f in sorted(glob.glob(os.path.join(ROOT, "src", "data", "tier*.json"))):
    estr += list(leaves(json.load(open(f, encoding="utf8"))))
estr += list(leaves(extras["codex"]))
results["Ellipsis Manual & X-Ray modules (tier1–6 + Pit addendum)"] = check("ellipsis", estr)

# ---- counts
def week_parts(belt):
    return sum(1 for m in mods.values() if m.get("belt") == belt and m["kind"] == "week"
               for d in m["days"] if d["id"] in ("mon", "tue", "wed") and any(c["kind"] == "core" for c in d["cards"]))

def rungs(belt):
    return sum(len(t["items"]) for t in tools.values() if t["type"] == "rungs" and t.get("belt") == belt)

counts = [
    ("White lesson parts", week_parts("white"), 18),
    ("Blue lesson parts", week_parts("blue"), 18),
    ("Brown lesson parts", week_parts("brown"), 18),
    ("Black lesson parts", week_parts("black"), 18),
    ("Blue Socratic rungs", rungs("blue"), 162),
    ("Brown Socratic rungs", rungs("brown"), 162),
    ("Black resolved seams", sum(c["md"].count("**Tension.**") for d in mods["black-overview"]["days"] for c in d["cards"] if "seams" in c["id"]), 7),
    ("Sanctuary modules (S1.1–S4.3)", sum(len(mods[f"s{i}"]["days"]) for i in range(1, 5)), 13),
    ("Sanctuary cautions", mods["cautions"]["days"][0]["cards"][0]["md"].count("\n") + 1, 7),
    ("Ellipsis modules", sum(1 for m in mods.values() if m["kind"] == "module"), 12),
    ("Ellipsis causal chains", sum(1 for m in mods.values() if m["kind"] == "module" for d in m["days"] if d["id"].startswith("chain")), 36),
    ("White Socratic deck cards", sum(len(t["items"]) for t in tools.values() if t["type"] == "deck"), None),
]
n_cards = sum(len(d["cards"]) for m in mods.values() for d in m["days"])
over4 = [(m["id"], d["id"], len(d["cards"])) for m in mods.values() for d in m["days"] if len(d["cards"]) > 4]

ok = all(exp is None or got == exp for _, got, exp in counts)
report.append("# Content migration check\n")
report.append(f"Modules: {len(mods)} · days: {sum(len(m['days']) for m in mods.values())} · cards: {n_cards} · interactive tools: {len(tools)} · journal tools: {len(journal)}\n")
report.append("## Counts\n")
report.append("| Check | Found | Expected |\n|---|---|---|")
for n, got, exp in counts:
    report.append(f"| {n} | {got} | {exp if exp is not None else '—'} |")
report.append("\n## Text diff (source strings found word for word in the migrated content)\n")
report.append("| Source | Strings checked | Missing |\n|---|---|---|")
all_miss = []
for k, (t, mis, ml) in results.items():
    report.append(f"| {k} | {t} | {mis} |")
    all_miss += [(k, x) for x in ml]
report.append("\n## What the diff does not count as lesson text\n")
report.append("- Interface chrome: tab strips, day navigation, buttons, layer tags, save pills, pocket-card flip hints, form controls, and the labels of controls inside interactive labs (each lab is ported as a tool or linked to the original page).")
report.append("- Live widget readouts computed at run time: timers, scores, counters such as \"Socratic Rungs Answered: 0 / 162\".")
report.append("- Headers the manuals compose from two migrated parts, such as \"Brown Belt · Br4 · Deliverable: …\".")
report.append("- Blue Belt drills P4 and P6 and their need list, which only ran inside claude.ai: " + "; ".join(NOT_MIGRATED.values()) + ". Also each capstone test's Claude rehearsal prompt.")
report.append("- Strings shorter than 12 characters.")
report.append("\n## Missing strings\n")
if not all_miss:
    report.append("None.")
for k, x in all_miss:
    report.append(f"- **{k}:** {x}")
report.append("\n## Days with more than 4 cards (long content paged at paragraph breaks)\n")
report.append(", ".join(f"{a}/{b} ({n})" for a, b, n in over4) or "None.")
open(os.path.join(os.path.dirname(__file__), "verify-report.md"), "w", encoding="utf8").write("\n".join(report) + "\n")
for n, got, exp in counts:
    print(f"{n}: {got}" + (f" (expected {exp})" if exp is not None else ""))
for k, (t, mis, _) in results.items():
    print(f"{k}: {t} checked, {mis} missing")
sys.exit(0 if ok else 1)
