#!/usr/bin/env python3
"""Builds src/content/** (Track -> Module -> Day -> Cards[]) from the source manuals.

Sources, all already in the repo:
  public/dojo/{white,blue,brown,black}-belt.html, public/dojo/sanctuary.html
  src/data/tier1-6.json (Ellipsis Manual & Six-Minute X-Ray modules), src/data/pitAddendum.js
Run first:  node scripts/content/render-dojo.js && node scripts/content/extract-white.js
Then:       python3 scripts/content/build.py
Prose is copied word for word; only markup changes. verify.py checks that.
"""
import json, os, re, subprocess, sys
from bs4 import BeautifulSoup
sys.path.insert(0, os.path.dirname(__file__))
from mdconv import html_to_md, inline, table_md, plain

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CACHE = os.path.join(os.path.dirname(__file__), ".cache")
DOJO = os.path.join(ROOT, "public", "dojo")
OUT = os.path.join(ROOT, "src", "content")

DIALECTS = ["office_us", "personal_us", "rioplatense", "espana"]
DIAL_FROM = {  # each manual's own keys -> unified keys
    "office_us": "office_us", "us_office": "office_us",
    "personal_us": "personal_us", "us_personal": "personal_us",
    "rio": "rioplatense", "rioplatense": "rioplatense",
    "spain": "espana", "espana": "espana",
}
KIND_LABEL = {"core": "Core Idea", "action": "In Action", "deeper": "Go Deeper", "check": "Check & Apply"}

TOOLS = {}     # tool id -> spec
JOURNAL = {}   # journal tool id -> spec


def soup(path):
    return BeautifulSoup(open(path, encoding="utf8").read(), "lxml")


def jtag(html_path, tag_id):
    s = soup(html_path)
    t = s.find("script", id=tag_id)
    return json.loads(t.string)


def J(path):
    return json.load(open(path, encoding="utf8"))


# ---------------------------------------------------------------- md helpers
def md_blocks(blocks):
    """Convert the manuals' JSON block lists ({t:'p'|'h'|'note'|'steps'|'table'|...})."""
    out = []
    for b in blocks or []:
        t = b.get("t")
        if not isinstance(b, dict):
            out.append(any_md(b)); continue
        if t == "p":
            out.append(b["md"])
        elif t == "h":
            out.append("### " + b["text"])
        elif t == "note":
            out.append(f":::note {b.get('label','')}".rstrip() + "\n" + b["md"] + "\n:::")
        elif t == "steps":
            out.append("\n".join(f"{i+1}. **{it['name']}** {it['md']}" for i, it in enumerate(b["items"])))
        elif t == "list":
            out.append("\n".join(f"- {x if isinstance(x,str) else x.get('md','')}" for x in b.get("items", [])))
        elif t == "table":
            out.append(md_table(b.get("head", []), b.get("rows", []), b.get("title")))
        elif t == "quote":
            out.append("> " + b.get("md", ""))
        else:
            txt = b.get("md") or b.get("text") or ""
            if txt:
                out.append(txt)
    return "\n\n".join(out)


def golden_label(path):
    """The label on the rendered week header's golden-thread callout (e.g. 'Golden Thread · Promotion Project & Script-Book')."""
    if not os.path.exists(path):
        return ""
    sp = BeautifulSoup(open(path, encoding="utf8").read(), "lxml")
    for sec in sp.find_all("section"):
        if "no-print" in (sec.get("class") or []):
            lab = sec.select_one(".callout .callout-label")
            if lab:
                return lab.get_text("", strip=True)
    return ""


def any_md(v, key=None):
    """Generic, lossless-as-text rendering of nested JSON content."""
    if v is None or v is False or v is True:
        return ""
    if isinstance(v, (int, float)):
        return ""
    if isinstance(v, str):
        return v
    if isinstance(v, list):
        if v and all(isinstance(x, dict) and "t" in x for x in v):
            return md_blocks(v)
        if v and all(isinstance(x, dict) and set(x) == {"k", "v"} for x in v):
            return "\n".join(f"- **{x['k']}:** {x['v']}" for x in v)
        if v and all(isinstance(x, list) for x in v):
            return "\n".join("- " + " — ".join(str(y) for y in x) for x in v)
        return "\n\n".join(filter(None, (any_md(x) for x in v)))
    if isinstance(v, dict):
        if "t" in v:
            return md_blocks([v])
        out = []
        d = dict(v)
        if "tableHead" in d or "tableRows" in d:
            out.append(md_table(d.pop("tableHead", []), d.pop("tableRows", []), d.pop("tableTitle", None)))
        if "head" in d and "rows" in d:
            out.append(md_table(d.pop("head", []), d.pop("rows", []), d.pop("title", None) if isinstance(d.get("title"), str) and False else None))
        if "name" in d and "md" in d and len(d) <= 3:
            return f"**{d['name']}** {d['md']}"
        if "label" in d and ("md" in d or "body" in d):
            return note(d["label"], d.get("md") or d.get("body"))
        for k, x in d.items():
            if k in ("id", "t", "k", "belt", "dojo", "button", "mode", "drill"):
                continue
            m = any_md(x, k)
            if not m:
                continue
            if isinstance(x, str) and "\n" not in x and len(x) < 400:
                out.append(f"**{k}.** {m}")
            else:
                out.append(f"**{k}.**\n\n{m}" if not m.startswith(("|", ":::", "- ", "1.")) else f"**{k}.**\n\n{m}")
        return "\n\n".join(out)
    return str(v)


def md_table(head, rows, title=None):
    def c(x):
        return str(x).replace("|", "\\|").replace("\n", " ")
    lines = []
    if title:
        lines.append(f"### {title}\n")
    w = max([len(head)] + [len(r) for r in rows]) if (head or rows) else 0
    head = list(head) + [""] * (w - len(head))
    lines.append("| " + " | ".join(c(h) for h in head) + " |")
    lines.append("|" + "---|" * w)
    for r in rows:
        r = list(r) + [""] * (w - len(r))
        lines.append("| " + " | ".join(c(x) for x in r) + " |")
    return "\n".join(lines)


def note(label, body, tone="note"):
    return f":::{tone} {label}".rstrip() + "\n" + body + "\n:::"


def details(title, body):
    return f":::details {title}\n{body}\n:::"


def dialect_block(label, variants):
    """variants: unified dialect key -> text"""
    lines = [f":::dialect {label}".rstrip()]
    for d in DIALECTS:
        if variants.get(d):
            lines.append(f"@{d} " + variants[d].replace("\n", " "))
    lines.append(":::")
    return "\n".join(lines)


def J2(*parts):
    parts = [p if isinstance(p, str) else any_md(p) for p in parts]
    return "\n\n".join(p for p in parts if p and p.strip())


def card(cid, kind, title, md, tools=None, label=None):
    c = {"id": cid, "kind": kind, "label": label or KIND_LABEL.get(kind, "Card"), "title": title, "md": md.strip()}
    if tools:
        c["tools"] = tools
    return c


def tool(tid, spec):
    TOOLS[tid] = spec
    return tid


def day(did, label, title, cards, author=None, lab=False):
    d = {"id": did, "label": label, "title": title, "cards": [c for c in cards if c and (c["md"] or c.get("tools"))]}
    if author:
        d["author"] = author
    if lab:
        d["lab"] = True
    return d


def split_pages(cid, kind, title, md, label, budget=1400):
    """Split long text-only content into several cards at paragraph breaks."""
    paras = [p for p in md.split("\n\n") if p.strip()]
    pages, cur, n = [], [], 0
    for p in paras:
        if cur and n + len(p) > budget:
            pages.append(cur); cur, n = [], 0
        cur.append(p); n += len(p)
    if cur:
        pages.append(cur)
    out = []
    for i, pg in enumerate(pages):
        lab = label if len(pages) == 1 else f"{label} · {i+1}/{len(pages)}"
        out.append(card(f"{cid}-{i+1}" if len(pages) > 1 else cid, kind, title, "\n\n".join(pg), label=lab))
    return out


def merge_dialect_variants(per_dialect_md, label="Live Dialect Examples"):
    """per_dialect_md: unified dialect -> md string of the same view. Returns (common_md, dialect_md).
    Blocks that differ between dialects become one dialect block per differing position."""
    keys = [d for d in DIALECTS if d in per_dialect_md]
    split = {d: [b for b in per_dialect_md[d].split("\n\n") if b.strip()] for d in keys}
    base = split[keys[0]]
    if any(len(split[d]) != len(base) for d in keys):
        return per_dialect_md[keys[0]], ""
    out, dial = [], []
    for i, b in enumerate(base):
        vs = {d: split[d][i] for d in keys}
        if len(set(vs.values())) == 1:
            out.append(b)
        else:
            dial.append(dialect_block(label, {d: re.sub(r"\s+", " ", plain_keep(v)) for d, v in vs.items()}))
            out.append("{{dialect-slot}}")
    return "\n\n".join(out), "\n\n".join(dial)


def plain_keep(md):
    """Flatten one dialect variant to a line; a note's own label (e.g. 'Dialect Calibrated Question (Office US)') is kept as a bold lead."""
    md = re.sub(r"^:::(?:note|warn|details|field) (.+)$", r"**\1:**", md, flags=re.M)
    md = re.sub(r"^:::\w*.*$", "", md, flags=re.M)
    return md.strip()


def white_fields(node):
    """Form fields bound to White Belt's data-store keys, with the manual's own labels, placeholders and select options."""
    fields = []
    for el in node.select("[data-store]"):
        lab = el.find_parent("label") or el.find_previous("label")
        lab_txt = ""
        if lab is not None:
            lab_c = BeautifulSoup(str(lab), "lxml")
            for x in lab_c.find_all(["select", "option", "input", "textarea"]):
                x.decompose()
            lab_txt = lab_c.get_text(" ", strip=True)
        f = {"k": el["data-store"], "label": lab_txt, "placeholder": el.get("placeholder", ""), "multi": el.name == "textarea",
             "readonly": el.has_attr("readonly")}
        if el.name == "select":
            opts = [o.get_text(strip=True) for o in el.find_all("option")]
            f["placeholder"] = opts[0] if opts and (not el.find("option").get("value")) else ""
            f["options"] = [o.get_text(strip=True) for o in el.find_all("option") if o.get("value", o.get_text(strip=True))]
        fields.append(f)
    return fields


# ---------------------------------------------------------------- WHITE
def build_white():
    path = os.path.join(DOJO, "white-belt.html")
    s = soup(path)
    consts = J(os.path.join(CACHE, "white", "consts.json"))
    decks = consts["decks"]
    wd = {DIAL_FROM[k]: v for k, v in consts["WHITE_DIALECTS"].items()}
    modules = []

    def white_dialect_md():
        fields = [("note", "Dialect note"), ("cleanNo", "Clean No"), ("fog", "Fogging line"), ("upward", "Upward check")]
        return "\n\n".join(dialect_block(lab, {d: wd[d][f] for d in wd}) for f, lab in fields)

    # Overview
    ov = s.select_one("#view-overview")
    hdr = ov.select_one(".module-header")
    ov_cards = []
    hdr_md = html_to_md(hdr)
    ov_cards.append(card("white-overview.intro.1", "info", "White Belt", hdr_md, label="Overview"))
    i = 1
    for c in ov.find_all("div", class_="card", recursive=False):
        i += 1
        h = c.find(["h2", "h3"])
        title = h.get_text(" ", strip=True) if h else "Overview"
        if "Master Grid" in title:
            ov_cards.append(card(f"white-overview.intro.{i}", "info", title, html_to_md(c), tools=[tool("grid.white", {"type": "grid", "belt": "white"})], label="Master Grid"))
        else:
            ov_cards.append(card(f"white-overview.intro.{i}", "info", title, html_to_md(c), label="Overview"))
    ov_cards.insert(3, card("white-overview.intro.dialect", "info", "4-Way Dojo & Dialect", white_dialect_md(), label="Dialect"))
    modules.append({"id": "white-overview", "belt": "white", "kind": "overview", "title": "White Belt · Overview",
                    "subtitle": inline(hdr.find("p")).strip() if hdr.find("p") else "", "days": [day("intro", "Overview", "Architecture & Rules", ov_cards)]})

    lab_tools = {
        "w1": [tool("bodymap.white", {"type": "bodymap", "zones": [z.get("data-zone") for z in s.select("#w1-lab .body-zone")]}),
               tool("timer.white.beat", {"type": "timer", "title": "2-Beat Micro-Pause", "seconds": 2, "button": "Run 2-Beat Micro-Pause", "display": "2.0s", "tenths": True})],
        "w6": [tool("timer.white.sit", {"type": "timer", "title": "SIT Cap Timer", "seconds": 300, "button": "Start 5-Min SIT Cap", "done": "Cap Reached"})],
    }
    for n in range(1, 7):
        wk = f"w{n}"
        view = s.select_one(f"#view-{wk}")
        hdr = view.select_one(".module-header")
        kicker = hdr.select_one(".module-kicker").get_text(" ", strip=True)
        title = hdr.find("h2").get_text(" ", strip=True)
        sub = inline(hdr.find("p")).strip()
        tabs = [b.get_text(" ", strip=True) for b in view.select(".part-tabs > *")]
        days = []
        for di, dk in enumerate(["mon", "tue", "wed"]):
            panel = view.select_one(f"#{wk}-{dk}")
            cards_ = panel.find_all("div", class_="card", recursive=False)
            l1, l2 = cards_[0], cards_[1]
            deep = panel.find("details", class_="deepening")
            dtitle = l1.find("h3").get_text(" ", strip=True)
            # Layer 2 minus the Handoff item, which goes to Check & Apply
            l2c = BeautifulSoup(str(l2), "lxml").find("div")
            handoff = None
            for li in l2c.select("li"):
                st = li.find("strong")
                if st and st.get_text(strip=True).lower().startswith("handoff"):
                    handoff = inline(li).strip()
                    li.extract()
            l1md = html_to_md(l1)
            l2md = html_to_md(l2c)
            deep_md = html_to_md(BeautifulSoup(str(deep), "lxml").find("details")) if deep else ""
            other = [x for x in panel.find_all(recursive=False) if x not in cards_[:2] and x is not deep]
            extra = "\n\n".join(html_to_md(x) for x in other)
            check_md = J2("- " + handoff if handoff else "", f"The Socratic deck for {wk.upper()} is in this week's Lab day.")
            days.append(day(dk, tabs[di].split("·")[0].strip(), dtitle, [
                card(f"{wk}.{dk}.core", "core", dtitle, l1md),
                card(f"{wk}.{dk}.action", "action", dtitle, l2md),
                card(f"{wk}.{dk}.deeper", "deeper", dtitle, J2(deep_md, extra)),
                card(f"{wk}.{dk}.check", "check", dtitle, check_md),
            ], author=tabs[di].split("·", 1)[1].strip() if "·" in tabs[di] else None))
        # Lab day
        lab = view.select_one(f"#{wk}-lab")
        deck_id = tool(f"deck.white.{wk}", {"type": "deck", "title": f"Socratic Deck · {wk.upper()}", "items": decks[wk]})
        lab_cards = [card(f"{wk}.lab.deck", "check", "Socratic Deck", "", tools=[deck_id], label="Socratic Deck")]
        for ci, c in enumerate(lab.find_all("div", class_="card", recursive=False)):
            h = c.find("h3")
            ttl = h.get_text(" ", strip=True) if h else "Lab"
            fields = white_fields(c)
            jid = f"white.{wk}" if ci == 0 or f"white.{wk}" not in JOURNAL else f"white.{wk}.{ci+1}"
            tl = list(lab_tools.get(wk, [])) if ci == 0 else []
            if fields:
                JOURNAL[jid] = {"id": jid, "belt": "white", "module": wk.upper(), "title": ttl, "store": "white", "fields": fields}
                tl.append(tool(f"form.{jid}", {"type": "form", "journal": jid}))
            cmd = html_to_md(c)
            lab_cards.append(card(f"{wk}.lab.tool{ci+1}", "action", ttl, cmd, tools=tl, label="Lab"))
        days.append(day("lab", "Thu/Fri", tabs[3].split("·", 1)[1].strip() if len(tabs) > 3 else "Lab", lab_cards, lab=True))
        modules.append({"id": wk, "belt": "white", "kind": "week", "kicker": kicker, "title": title, "subtitle": sub, "days": days})

    # Sanctuary layer 1 (as written in the White manual)
    sv = s.select_one("#view-sanctuary")
    hdr = sv.select_one(".module-header")
    gate = sv.select_one(".callout")
    tabs = [b.get_text(" ", strip=True) for b in sv.select(".part-tabs > *")]
    sdays = []
    for di, pid in enumerate(["s1-1", "s1-2", "s1-3"]):
        panel = sv.select_one(f"#{pid}")
        cs = panel.find_all("div", class_="card", recursive=False)
        deep = panel.find("details")
        ttl = cs[0].find("h3").get_text(" ", strip=True) if cs and cs[0].find("h3") else tabs[di]
        l2 = BeautifulSoup(str(cs[1]), "lxml").find("div") if len(cs) > 1 else None
        marker = None
        if l2 is not None:
            for li in l2.select("li"):
                st = li.find("strong")
                if st and "marker" in st.get_text(strip=True).lower():
                    marker = inline(li).strip(); li.extract()
        sdays.append(day(pid, tabs[di].split("·")[0].strip(), ttl, [
            card(f"white-s1.{pid}.core", "core", ttl, html_to_md(cs[0])),
            card(f"white-s1.{pid}.action", "action", ttl, html_to_md(l2) if l2 is not None else ""),
            card(f"white-s1.{pid}.deeper", "deeper", ttl, html_to_md(BeautifulSoup(str(deep), "lxml").find("details")) if deep else ""),
            card(f"white-s1.{pid}.check", "check", ttl, ("- " + marker) if marker else "", tools=[tool(f"marker.white-s1.{pid}", {"type": "marker", "id": f"white-s1.{pid}", "text": marker or ""})]),
        ]))
    jp = sv.select_one("#s1-journal")
    jfields = white_fields(jp)
    JOURNAL["white.s1"] = {"id": "white.s1", "belt": "white", "module": "S1", "title": jp.find("h3").get_text(" ", strip=True) if jp.find("h3") else "Sanctuary Journal", "store": "white", "fields": jfields, "sanctuary": True}
    sdays.append(day("journal", "Journal", tabs[3] if len(tabs) > 3 else "Sanctuary Journal", [
        card("white-s1.journal.1", "check", "Sanctuary Journal", html_to_md(jp), tools=[tool("form.white.s1", {"type": "form", "journal": "white.s1"})], label="Journal")], lab=True))
    modules.append({"id": "white-s1", "belt": "white", "kind": "sanctuary", "title": hdr.find("h2").get_text(" ", strip=True),
                    "kicker": hdr.select_one(".module-kicker").get_text(" ", strip=True) if hdr.select_one(".module-kicker") else "",
                    "subtitle": inline(hdr.find("p")).strip() if hdr.find("p") else "", "gate": inline(gate).strip() if gate else "", "days": sdays})

    # Capstone
    cv = s.select_one("#view-capstone")
    hdr = cv.select_one(".module-header")
    cap_cards = [card("white-capstone.test.intro", "info", hdr.find("h2").get_text(" ", strip=True), html_to_md(hdr), label="Capstone")]
    for ci, c in enumerate(cv.find_all("div", class_="card", recursive=False)):
        h = c.find("h3")
        ttl = h.get_text(" ", strip=True) if h else "Capstone"
        tl = []
        if "Belt Tests" in ttl:
            tests = []
            for tr in c.select("tbody tr"):
                tds = tr.find_all("td")
                cb = tds[0].find("input")
                tests.append({"k": cb.get("data-check") if cb else f"t{len(tests)+1}", "name": tds[1].get_text(" ", strip=True), "setting": tds[2].get_text(" ", strip=True), "pass": tds[3].get_text(" ", strip=True)})
            deb = c.find("textarea")
            JOURNAL["white.capstone"] = {"id": "white.capstone", "belt": "white", "module": "Capstone", "title": ttl, "store": "white", "tests": tests,
                                         "fields": [{"k": "cap_debrief", "label": "Post-Test Debrief Paragraph", "placeholder": deb.get("placeholder", "") if deb else "", "multi": True}]}
            tl = [tool("form.white.capstone", {"type": "form", "journal": "white.capstone"})]
        elif "Evidence" in ttl:
            tl = [tool("evidence.white", {"type": "evidence", "belt": "white", "cols": [th.get_text(" ", strip=True) for th in c.select("thead th")]})]
        cap_cards.append(card(f"white-capstone.test.{ci+1}", "info", ttl, html_to_md(c), tools=tl, label="Capstone"))
    other_cap = [x for x in cv.find_all(recursive=False) if "card" not in (x.get("class") or []) and "module-header" not in (x.get("class") or []) and "pocket-card" not in (x.get("class") or [])]
    for ci, x in enumerate(other_cap):
        m = html_to_md(x)
        if m:
            cap_cards.append(card(f"white-capstone.test.x{ci+1}", "info", "Capstone", m, label="Capstone"))
    modules.append({"id": "white-capstone", "belt": "white", "kind": "capstone", "title": "White Belt · Capstone", "subtitle": inline(hdr.find("p")).strip(),
                    "days": [day("test", "Belt Test", hdr.find("h2").get_text(" ", strip=True), cap_cards)]})
    pocket = {"belt": "white", "front": "Breathe out. Triage. One reason.",
              "frontSub": "Jaw loose, feet down, name the feeling · Style, blind spot, or tactic? · Proposal, then stop.",
              "back": "Would I accept their no?",
              "backSub": 'If the honest answer is no, you are not asking—you are pressuring. (Sanctuary check: "Am I here, and are they?")'}
    grid = {"belt": "white", "column": "Guard", "stages": consts["WHITE_GUARD_STAGES"]}
    return modules, pocket, grid, wd


# ---------------------------------------------------------------- BLUE
BLUE_STRIPS = {("B1", 2): "displayQ", ("B2", 2): "checkBack", ("B3", 1): "interestQ", ("B4", 0): "metaQ", ("B4", 2): "loop",
               ("B5", 0): "audit", ("B5", 2): "boundary", ("B6", 0): "warmth", ("B6", 1): "invite", ("B6", 2): "ping"}


def build_blue():
    D = jtag(os.path.join(DOJO, "blue-belt.html"), "dojo-data")
    bd = {DIAL_FROM[k]: v for k, v in D["dialects"].items()}
    modules = []
    meta = D["meta"]
    intro_md = md_blocks(D["blueIntro"].get("teaches", [])) if isinstance(D["blueIntro"], dict) else ""
    extra_intro = []
    if isinstance(D["blueIntro"], dict):
        for k, v in D["blueIntro"].items():
            if k == "teaches":
                continue
            if isinstance(v, list) and v and isinstance(v[0], dict) and "t" in v[0]:
                extra_intro.append(md_blocks(v))
            elif isinstance(v, str):
                extra_intro.append(v)
            elif v:
                extra_intro.append(any_md(v))
    bm = D["beltMeta"]
    bm_md = any_md(bm)
    ov_cards = [card("blue-overview.intro.1", "info", meta["title"], J2(f"*{meta['question']}*", meta.get("subtitle", ""), intro_md), label="Overview")]
    for i, x in enumerate(extra_intro):
        ov_cards.append(card(f"blue-overview.intro.x{i+1}", "info", "Blue Belt", x, label="Overview"))
    if bm_md:
        ov_cards.append(card("blue-overview.intro.meta", "info", "Blue Belt", bm_md, label="Overview"))
    gu = D.get("gridUse")
    ov_cards.append(card("blue-overview.intro.grid", "info", "Master Grid · Blue Belt Columns",
                         J2(any_md(gu), any_md(D.get("gridFooter"))),
                         tools=[tool("grid.blue", {"type": "grid", "belt": "blue"})], label="Master Grid"))
    ov_cards.append(card("blue-overview.intro.dialect", "info", "Dialect scripts", "\n\n".join(
        dialect_block(f, {d: bd[d].get(f, "") for d in bd}) for f in ["note"]), label="Dialect"))
    modules.append({"id": "blue-overview", "belt": "blue", "kind": "overview", "title": "Blue Belt · Overview", "subtitle": meta.get("subtitle", ""),
                    "question": meta["question"], "days": [day("intro", "Overview", "Read & Bond", ov_cards)]})

    labs = D["labs"]
    lab_map = {"B1": ["B1_clusters"], "B2": ["B2_drills"], "B3": ["B3_drills"], "B4": ["B4_drills"], "B5": ["B5_prompts"], "B6": ["B6_drills"]}
    for w in D["weeks"]:
        wid = w["id"]; mid = wid.lower()
        o = w["orig"]; dp = o["deepened"]["parts"]
        days = []
        for i, p in enumerate(w["parts"]):
            dk = ["mon", "tue", "wed"][i]
            ttl = p["title"]
            dn = p.get("deepNote")
            action = J2(note("Decision Rule", p["decisionRule"]), note("Office Dojo", p["officeEx"]), note("Personal Dojo", p["personalEx"]),
                        note("Non-Example", p["nonEx"], "warn"))
            f = BLUE_STRIPS.get((wid, i))
            if f:
                action = J2(action, dialect_block(f"Translation strip · {f}", {d: bd[d].get(f, "") for d in bd}))
            pre = md_blocks(dp[i].get("pre"))
            deeper = J2(f"**Lens.** {p['lens']}", md_table(p.get("tableHead", []), p.get("tableRows", []), p.get("tableTitle")),
                        f"### {p['layer3Title']}\n\n{p['layer3Body']}",
                        note(dn["label"], dn["body"]) if isinstance(dn, dict) else (dn or ""),
                        details(f"Canon notes · {dp[i]['title']}", J2(f"*{dp[i].get('anchor','')}*" if dp[i].get("anchor") else "", pre)))
            rung_items = []
            for blk in dp[i]["prompts"]:
                if blk.get("t") == "steps":
                    rung_items += blk["items"]
            rid = tool(f"rungs.blue.{wid}.p{i+1}", {"type": "rungs", "belt": "blue", "key": f"{wid}_P{i+1}", "title": f"Socratic rungs · {dp[i]['title']}", "items": rung_items})
            other = [b for b in dp[i]["prompts"] if b.get("t") != "steps"]
            check = J2(note("Handoff", p["handoff"]), md_blocks(other))
            days.append(day(dk, p["day"].split("·")[0].strip(), ttl, [
                card(f"{mid}.{dk}.core", "core", ttl, p["mechanism"]),
                card(f"{mid}.{dk}.action", "action", ttl, action),
                card(f"{mid}.{dk}.deeper", "deeper", ttl, deeper),
                card(f"{mid}.{dk}.check", "check", ttl, check, tools=[rid]),
            ], author=p["author"]))
        # Lab (Thu) + Deliverable (Fri)
        lab_tools = [tool(f"drill.blue.{wid}.{k}", {"type": "drill", "set": k, "belt": "blue", "items": labs[k]}) for k in lab_map[wid]]
        if wid == "B1":
            lab_tools = [tool("linter.blue.camera", {"type": "linter", "kind": "camera", "title": "Live Camera-vs-Story Linter (DePaulo & Bond)",
                                                     "help": "Type a baseline observation below. Flags mind-reading/motive words a video camera could never record.",
                                                     "placeholder": "Try: 'Marcus looked defensive and evasive when I asked about Friday...'"}),
                         tool("timer.blue.sweep", {"type": "timer", "title": "Guided 30-Second Silent Sweep Timer (Hughes)", "seconds": 30, "button": "Start 30s Sweep",
                                                   "help": "Scan without staring: 10s Posture/Space -> 10s Voice/Pace -> 10s Hands/Gaze.",
                                                   "phases": [[20, "Zone 1: Posture & Space"], [10, "Zone 2: Voice, Pace & Formality"], [0, "Zone 3: Hands & Gaze (Peripheral)"]],
                                                   "done": "Sweep Complete — Say 1 neutral baseline sentence."})] + lab_tools
        if wid == "B5":
            lab_tools = [tool("linter.blue.labelminute", {"type": "linter", "kind": "labelMinute", "title": "Live Label Minute Simulator (Voss)", "prompts": labs["B5_prompts"],
                                                          "help": "Respond using ONLY a neutral label (It seems / sounds / looks like...). Questions (?), I understand, and but are blocked, followed by a 3-second Dynamic Silence lock.",
                                                          "placeholder": "It sounds like..."}),
                         tool("linter.blue.periodbut", {"type": "linter", "kind": "periodBut", "title": "Period-Not-\"But\" Boundary Linter (Singer & Klimecki)",
                                                        "placeholder": "It sounds like you're under huge pressure. I'm still not able to drop the rate."})]
        thu = w["assembly"][3] if len(w["assembly"]) > 3 else {"ingredient": "Lab"}
        fri = w["assembly"][4] if len(w["assembly"]) > 4 else {"ingredient": "Deliverable"}
        canon_core = J2(f"**{o['name']}.** {o['lead']}", md_blocks(o["teaching"]))
        canon_action = J2(note("Drill", o["drill"]), note("Office dojo", o["office"]), note("Personal dojo", o["personal"]))
        conn, res = o["deepened"].get("connect"), o["deepened"].get("research")
        canon_deeper = J2(f"### {conn['title']}\n\n" + md_blocks(conn["blocks"]) if conn else "", f"### {res['title']}\n\n" + md_blocks(res["blocks"]) + ("\n\n" + note("Research prompt", res["prompt"]) if res.get("prompt") else "") if res else "")
        deliv = o["deliverable"]
        days.append(day("canon", "Canon", o["name"], [
            card(f"{mid}.canon.core", "core", o["name"], canon_core),
            card(f"{mid}.canon.action", "action", o["name"], canon_action),
            card(f"{mid}.canon.deeper", "deeper", o["name"], canon_deeper),
            card(f"{mid}.canon.check", "check", deliv["name"], J2(f"**{deliv['name']}.** {deliv['md']}", note("Prompt", w.get("prompt", "")))),
        ]))
        days.append(day("thu", "Thursday", thu["ingredient"], [card(f"{mid}.thu.lab", "action", thu["ingredient"], f"**{thu.get('step','')}** · {thu['ingredient']}", tools=lab_tools, label="Lab")], lab=True))
        jid = f"blue.{wid}"
        days.append(day("fri", "Friday", fri["ingredient"], [card(f"{mid}.fri.deliverable", "check", fri["ingredient"],
                     J2(note(f"Deliverable Spec · {deliv['name']}", deliv["md"])), tools=[tool(f"form.{jid}", {"type": "form", "journal": jid})], label="Deliverable")], lab=True))
        asm = md_table(["Day", "Step", "Ingredient"], [[a["day"], a["step"], a["ingredient"]] for a in w["assembly"]])
        modules.append({"id": mid, "belt": "blue", "kind": "week", "kicker": f"Blue Belt · Module {wid}", "title": w["title"], "subtitle": w["subtitle"],
                        "guardrail": w.get("guardrail", ""), "assembly": asm, "days": days})

    ht = D["hooksTool"]
    JOURNAL["blue.hooks"] = {"id": "blue.hooks", "belt": "blue", "module": "W3 → B3", "title": ht["name"], "store": "blue", "path": "w3Hooks",
                             "help": f"Started: {ht.get('started','')} · Grows: {ht.get('grows','')} · Holds: {ht.get('holds','')}",
                             "fields": [{"k": f["k"], "label": f["label"], "placeholder": f.get("hint", ""), "multi": True} for f in ht["fields"]]}

    # Sanctuary layer 2 as written in the Blue manual
    sl = D["sanctuaryLayer2"]
    sdays = []
    for m in sl["modules"]:
        sid = m["id"].lower().replace(".", "-")
        deep = m.get("deep") or {}
        deep_md = any_md(deep)
        teach = "\n".join(f"- **{t['name']}** {t['md']}" for t in m.get("teaching", []))
        sdays.append(day(sid, m["id"], m["name"], [
            card(f"blue-s2.{sid}.core", "core", m["name"], J2(f"*{m.get('authors','')}*", teach)),
            card(f"blue-s2.{sid}.deeper", "deeper", m["name"], deep_md),
            card(f"blue-s2.{sid}.check", "check", m["name"], f"- **Marker:** {m.get('marker','')}", tools=[tool(f"marker.blue-s2.{sid}", {"type": "marker", "id": f"blue-s2.{sid}", "text": m.get("marker", "")})]),
        ]))
    caut = "\n".join(f"{i+1}. **{c['name']}** {c['md']}" for i, c in enumerate(D.get("sanctuaryCautions", [])))
    sdays.append(day("cautions", "Cautions", "The 7 Cautions", [card("blue-s2.cautions.1", "info", "The 7 Cautions", caut, label="Cautions")]))
    JOURNAL["blue.sanctuary"] = {"id": "blue.sanctuary", "belt": "blue", "module": "S2", "title": "Sanctuary Journal", "store": "blue", "list": "sanctuaryJournal",
                                 "fields": [{"k": f["k"], "label": f["label"], "multi": True} for f in D["sanctuaryJournalFields"]], "sanctuary": True}
    modules.append({"id": "blue-s2", "belt": "blue", "kind": "sanctuary", "title": f"Sanctuary Layer 2 · {sl['name']}", "subtitle": sl.get("shift", ""),
                    "gate": sl.get("intro", ""), "days": sdays})

    # Capstone
    cap = D["capstone"]
    rows = [[t["name"], t["setting"], t["pass"]] for t in cap["tests"]]
    cap_md = J2(cap.get("intro", ""), md_table(["Test", "Setting", "Observable pass criteria"], rows))
    extra = {k: v for k, v in cap.items() if k not in ("belt", "intro", "tests")}
    extra_md = "\n\n".join(f"**{k}.** {v}" for k, v in extra.items() if isinstance(v, str))
    JOURNAL["blue.capstone"] = {"id": "blue.capstone", "belt": "blue", "module": "Capstone", "title": "Blue Belt Test", "store": "blue",
                                "tests": [{"k": t["id"], "name": t["name"], "setting": t["setting"], "pass": t["pass"]} for t in cap["tests"]],
                                "fields": [{"k": "debrief", "label": "Post-Test Debrief", "multi": True}]}
    pocket = {"belt": "blue", "front": " ".join(meta["pocket"]["cues"]), "frontSub": " · ".join(meta["pocket"]["notes"]), "back": meta["pocket"]["back"], "backSub": ""}
    cap_cards = [card("blue-capstone.test.1", "info", "Blue Belt Test", cap_md, tools=[tool("form.blue.capstone", {"type": "form", "journal": "blue.capstone"})], label="Capstone")]
    if extra_md:
        cap_cards.append(card("blue-capstone.test.2", "info", "Blue Belt Test", extra_md, label="Capstone"))
    cap_cards.append(card("blue-capstone.test.evidence", "info", "Blue Belt Evidence", "\n".join(f"- {c['label']}" for c in meta["evidenceCols"]),
                          tools=[tool("evidence.blue", {"type": "evidence", "belt": "blue", "cols": [c["label"] for c in meta["evidenceCols"]]})], label="Evidence"))
    modules.append({"id": "blue-capstone", "belt": "blue", "kind": "capstone", "title": "Blue Belt · Capstone", "subtitle": cap.get("intro", ""),
                    "days": [day("test", "Belt Test", "Three tests", cap_cards)]})
    grid = {"belt": "blue", "column": "Read & Bond", "stages": D["gridStages"], "cols": D.get("gridCols")}
    return modules, pocket, grid, bd, D


# ---------------------------------------------------------------- BROWN
def view_md(path):
    s = BeautifulSoup(open(path, encoding="utf8").read(), "lxml")
    return s


def build_brown():
    bdir = os.path.join(CACHE, "brown")
    deep = J(os.path.join(bdir, "deep.json")); canon = J(os.path.join(bdir, "canon.json")); G = J(os.path.join(bdir, "globals.json"))
    dmap = {"us_office": "office_us", "us_personal": "personal_us", "rio": "rioplatense", "spain": "espana"}
    modules = []

    def render_md(tab, dk, main_only=True):
        """md of the day's main card in each dialect, merged into common + dialect blocks."""
        per = {}
        for src, uni in dmap.items():
            s = view_md(os.path.join(bdir, f"{tab}_{dk}_{src}.html"))
            secs = s.find_all("section", recursive=True)
            main = [x for x in secs if "no-print" not in (x.get("class") or [])]
            node = main[0] if (main_only and main) else (s.body or s)
            per[uni] = html_to_md(node)
        return merge_dialect_variants(per)

    # Overview + capstone from the render
    for tab, mid, ttl in [("OV", "brown-overview", "Brown Belt · Overview"), ("CAP", "brown-capstone", "Brown Belt · Capstone")]:
        common, dial = render_md(tab, "mon", main_only=False)
        cards = split_pages(f"{mid}.main", "info", ttl.split("·")[1].strip(), common.replace("{{dialect-slot}}", dial or ""), "Overview" if tab == "OV" else "Capstone", budget=1800)
        if tab == "OV":
            cards.append(card(f"{mid}.main.grid", "info", "Master Grid · Brown Belt Column", "", tools=[tool("grid.brown", {"type": "grid", "belt": "brown"})], label="Master Grid"))
        else:
            cards.append(card(f"{mid}.main.evidence", "info", "Brown Belt Evidence", "\n".join(f"- {c.get('label', c) if isinstance(c, dict) else c}" for c in G["EVIDENCE_COLS"]),
                              tools=[tool("evidence.brown", {"type": "evidence", "belt": "brown", "cols": [c.get("label", "") if isinstance(c, dict) else str(c) for c in G["EVIDENCE_COLS"]]})], label="Evidence"))
        modules.append({"id": mid, "belt": "brown", "kind": "overview" if tab == "OV" else "capstone", "title": ttl, "subtitle": "",
                        "days": [day("intro" if tab == "OV" else "test", "Overview" if tab == "OV" else "Belt Test", ttl, cards)]})

    labs = {"Br2": [("drill", "BR2_SCENARIOS")], "Br3": [("drill", "BR3_WORDS")], "Br5": [("drill", "BR5_QDRILL")], "Br6": [("drill", "BR6_RENO_SIM")]}
    for w in G["WEEKS"]:
        wid = w["id"]; mid = wid.lower(); cn = canon[wid]
        days = []
        for i, (dk, dname) in enumerate([("mon", "Monday"), ("tue", "Tuesday"), ("wed", "Wednesday")]):
            dp = deep[f"{wid}_{dname}"]; cp = cn["parts"][dname]
            common, dial = render_md(wid, dk)
            # pull the render's ex-grid notes into In Action, everything else into Go Deeper
            blocks_ = [b for b in common.split("\n\n") if b.strip()]
            ex = [b for b in blocks_ if b.startswith(":::")]
            rest = [b for b in blocks_ if not b.startswith(":::") and b != "{{dialect-slot}}"]
            ttl = re.sub(r"^Layer 1 · Author Completion:\s*", "", dp["l1Title"])
            core = J2(f"### {dp['l1Title']}", dp["l1Mechanism"])
            exs = "\n\n".join(note(e[0], e[1]) for e in dp.get("l2Examples", []))
            action = J2(dp["l2Mechanism"], exs, note("Decision Rule", dp["decisionRule"]), "\n\n".join(ex), dial)
            deeper = J2(md_table(dp.get("l1Head", []), dp.get("l1Rows", [])), f"### {dp['l3Title']}\n\n{dp['l3Body']}", "\n\n".join(rest),
                        details(f"Canon notes · {cp['title']}", J2("\n\n".join(note(n["label"], n["md"]) for n in cp.get("notes", [])),
                                                                     md_table(cp.get("head", []), cp.get("rows", []), cp.get("tableTitle")))))
            rid = tool(f"rungs.brown.{wid}.{dname}", {"type": "rungs", "belt": "brown", "key": f"{wid}_{dname}", "title": f"Socratic rungs · {cp['title']}", "items": cp["rungs"], "foot": cp.get("guard", "")})
            days.append(day(dk, dname, ttl, [
                card(f"{mid}.{dk}.core", "core", ttl, core),
                card(f"{mid}.{dk}.action", "action", ttl, action),
                card(f"{mid}.{dk}.deeper", "deeper", ttl, deeper),
                card(f"{mid}.{dk}.check", "check", ttl, note("Handoff", dp["handoff"]), tools=[rid]),
            ], author=dp.get("author")))
        canon_core = J2(f"**{cn['name']}.** {cn['lead']}", md_blocks(cn["teaching"]))
        canon_action = J2(note("Drill", cn["drill"]), note("Office dojo", cn["office"]), note("Personal dojo", cn["personal"]))
        cc, rr = cn.get("connect") or {}, cn.get("research") or {}
        canon_deeper = J2(cc.get("intro", ""), md_table(cc.get("head", []), cc.get("rows", [])) if cc.get("head") else "",
                          rr.get("intro", ""), md_table(rr.get("head", []), rr.get("rows", [])) if rr.get("head") else "",
                          "\n\n".join(f"**{k}.** {v}" for k, v in cc.items() if isinstance(v, str) and k not in ("intro",)),
                          any_md(cc.get("notes")) if cc.get("notes") else "",
                          "\n\n".join(f"**{k}.** {v}" for k, v in rr.items() if isinstance(v, str) and k not in ("intro",)),
                          any_md(rr.get("notes")) if rr.get("notes") else "",
                          any_md({k: v for k, v in list(cc.items()) + list(rr.items()) if k not in ("intro", "head", "rows", "notes") and not isinstance(v, str)}))
        dv = cn["deliverable"]
        days.append(day("canon", "Canon", cn["name"], [
            card(f"{mid}.canon.core", "core", cn["name"], canon_core),
            card(f"{mid}.canon.action", "action", cn["name"], canon_action),
            card(f"{mid}.canon.deeper", "deeper", cn["name"], canon_deeper),
            card(f"{mid}.canon.check", "check", dv["name"], f"**{dv['name']}.** {dv['md']}"),
        ]))
        for dk, dname in [("thu", "Thursday"), ("fri", "Friday")]:
            common, dial = render_md(wid, dk)
            md = common.replace("{{dialect-slot}}", dial)
            tl = []
            if dk == "thu":
                if wid == "Br1":
                    tl = [tool("calc.brown.faceweight", {"type": "faceweight"}), tool("linter.brown.ask", {"type": "linter", "kind": "ask", "title": "Live Ask Linter (Proposal Strength Score)"})]
                if wid == "Br4":
                    tl = [tool("timer.brown.compressor", {"type": "timer", "title": "45-Second Compressor", "seconds": 45, "button": "Start 45s", "done": "Time"})]
                if wid == "Br6":
                    tl = [tool("linter.brown.repair", {"type": "linter", "kind": "repair", "title": "Repair Linter"})]
                for _, k in labs.get(wid, []):
                    tl.append(tool(f"drill.brown.{k}", {"type": "drill", "set": k, "belt": "brown", "items": G[k]}))
                tl.append(tool(f"legacy.brown.{wid}", {"type": "legacy", "href": "/dojo/brown-belt.html", "label": f"Open the {wid} lab in the original Brown Belt manual"}))
            else:
                jid = f"brown.{wid}"
                tl = [tool(f"form.{jid}", {"type": "form", "journal": jid})]
            days.append(day(dk, dname, w["map"][3 if dk == "thu" else 4].split(":", 1)[-1].strip(),
                            split_pages(f"{mid}.{dk}.main", "action" if dk == "thu" else "check", dname, md, "Lab" if dk == "thu" else "Deliverable", budget=2200)[:1] +
                            [card(f"{mid}.{dk}.tools", "action", "Tools", "", tools=tl, label="Tools")] if False else
                            [dict(c, tools=(tl if j == 0 else None)) for j, c in enumerate(split_pages(f"{mid}.{dk}.main", "action" if dk == "thu" else "check", dname, md, "Lab" if dk == "thu" else "Deliverable", budget=2200))],
                            lab=True))
        for d_ in days:
            for c in d_["cards"]:
                if c.get("tools") is None:
                    c.pop("tools", None)
        modules.append({"id": mid, "belt": "brown", "kind": "week", "kicker": f"Brown Belt · Module {wid}", "title": w["title"], "subtitle": w["q"],
                        "golden": w.get("golden", ""), "goldenLabel": golden_label(os.path.join(bdir, f"{wid}_mon_us_office.html")), "assembly": md_table(["Day"], [[x] for x in w["map"]]), "days": days})
    # Sanctuary layer 3 as written in the Brown manual
    sdays = []
    for m in G["SANCTUARY_L3"]:
        sid = m["id"].lower().replace(".", "-")
        sdays.append(sanct_day(f"brown-s3.{sid}", m))
    modules.append({"id": "brown-s3", "belt": "brown", "kind": "sanctuary", "title": "Sanctuary Layer 3", "subtitle": "", "days": sdays})
    grid = {"belt": "brown", "column": "Word · Reveal · Steer", "stages": G["BROWN_GRID_STAGES"]}
    return modules, grid, G


def sanct_day(prefix, m):
    sid = prefix.split(".")[-1]
    ttl = m.get("title") or m.get("name")
    action = J2(note("Stance Rule", m["stanceRule"]) if m.get("stanceRule") else "", note("Worked Example", m["worked"]) if m.get("worked") else "",
                note("Non-Example", m["nonEx"], "warn") if m.get("nonEx") else "")
    known = {"id", "title", "name", "authors", "mechanism", "stanceRule", "worked", "nonEx", "marker", "deepTitle", "deepBody"}
    extra = "\n\n".join(f"**{k}.** {v}" for k, v in m.items() if k not in known and isinstance(v, str))
    return day(sid, m["id"], ttl, [
        card(f"{prefix}.core", "core", ttl, J2(f"*{m.get('authors','')}*" if m.get("authors") else "", m.get("mechanism", ""))),
        card(f"{prefix}.action", "action", ttl, action),
        card(f"{prefix}.deeper", "deeper", ttl, J2(f"### {m['deepTitle']}\n\n{m['deepBody']}" if m.get("deepTitle") else m.get("deepBody", ""), extra)),
        card(f"{prefix}.check", "check", ttl, f"- **Marker:** {m.get('marker','')}" if m.get("marker") else "",
             tools=[tool(f"marker.{prefix}", {"type": "marker", "id": prefix, "text": m.get("marker", "")})]),
    ])


# ---------------------------------------------------------------- BLACK
def build_black():
    D = jtag(os.path.join(DOJO, "black-belt.html"), "black-data")
    kd = {DIAL_FROM[k]: v for k, v in D["dialects"].items()}
    bdir = os.path.join(CACHE, "black")
    dmap = {"us_office": "office_us", "us_personal": "personal_us", "rio": "rioplatense", "spain": "espana"}
    modules = []

    def render_md(tab, dk, main_only=True):
        per = {}
        for src, uni in dmap.items():
            s = view_md(os.path.join(bdir, f"{tab}_{dk}_{src}.html"))
            secs = [x for x in s.find_all("section") if "no-print" not in (x.get("class") or [])]
            node = secs[0] if (main_only and secs) else (s.body or s)
            per[uni] = html_to_md(node)
        return merge_dialect_variants(per)

    for tab, mid, ttl in [("OV", "black-overview", "Black Belt · Overview"), ("CAP", "black-capstone", "Black Belt · Capstone")]:
        common, dial = render_md(tab, "mon", main_only=False)
        cards = split_pages(f"{mid}.main", "info", ttl.split("·")[1].strip(), common.replace("{{dialect-slot}}", dial or ""), "Overview" if tab == "OV" else "Capstone", budget=1800)
        if tab == "OV":
            cards.append(card(f"{mid}.main.grid", "info", "Master Grid · Black Belt Column", "", tools=[tool("grid.black", {"type": "grid", "belt": "black"})], label="Master Grid"))
            seams = "\n\n".join(f"### {i+1}. {s_['title']}\n\n**Tension.** {s_['tension']}\n\n**Resolution.** {s_['resolution']}" +
                                "".join(f"\n\n**{k}.** {v}" for k, v in s_.items() if k not in ("title", "tension", "resolution") and isinstance(v, str))
                                for i, s_ in enumerate(D["seams"]))
            cards.extend(split_pages(f"{mid}.main.seams", "info", "The 7 Resolved Seams", seams, "Seams", budget=1800))
        else:
            cards.append(card(f"{mid}.main.evidence", "info", "Black Belt Evidence", "", tools=[tool("evidence.black", {"type": "evidence", "belt": "black",
                          "cols": ["Rooms mapped", "Dynamics named", "Frames offered", "Taxes triaged", "Codex entries", "Bridges built"]})], label="Evidence"))
        modules.append({"id": mid, "belt": "black", "kind": "overview" if tab == "OV" else "capstone", "title": ttl, "subtitle": "",
                        "days": [day("intro" if tab == "OV" else "test", "Overview" if tab == "OV" else "Belt Test", ttl, cards)]})

    for mid_, m in D["modules"].items():
        mid = mid_.lower()
        days = []
        for dk in ["mon", "tue", "wed"]:
            dd = m["days"][dk]; p = dd["parsed"]
            ttl = dd["head"]
            common, dial = render_md(mid_, dk)
            seam_hits = [s_ for s_ in D["seams"] if f"{mid_} {dk.capitalize()}" in (s_["title"] + s_.get("tension", ""))]
            check = J2(f"**Module question.** {m['q']}", f"**Golden thread.** {m['golden']}",
                       "\n\n".join(note(f"Resolved seam · {s_['title']}", f"**Tension.** {s_['tension']}\n\n**Resolution.** {s_['resolution']}") for s_ in seam_hits))
            days.append(day(dk, {"mon": "Monday", "tue": "Tuesday", "wed": "Wednesday"}[dk], re.sub(r"^Part \d —\s*", "", ttl), [
                card(f"{mid}.{dk}.core", "core", ttl, J2(f"**Thesis Opener:** {p['thesis']}", p["l1"])),
                card(f"{mid}.{dk}.action", "action", ttl, J2(p["l2"], dial)),
                card(f"{mid}.{dk}.deeper", "deeper", ttl, J2(f"### Layer 3 · Optional Deepening ({p['l3Title']})" if p.get("l3Title") else "", p.get("l3", ""))),
                card(f"{mid}.{dk}.check", "check", ttl, check),
            ]))
        for dk in ["thu", "fri"]:
            dd = m["days"][dk]
            common, dial = render_md(mid_, dk)
            tl = []
            if dk == "thu":
                if mid_ == "Bk1":
                    tl.append(tool("radar.black", {"type": "radar"}))
                if mid_ == "Bk5":
                    tl.append(tool("drill.black.dropRope", {"type": "drill", "set": "dropRope", "belt": "black", "items": D["dropRope"],
                                                            "title": "5-Tactic Drop-the-Rope Rehearsal Deck (Click to Reveal Exit)", "promptLabel": "Incoming Push", "answerLabel": "Calm Drop-the-Rope Exit"}))
                tl.append(tool(f"legacy.black.{mid_}", {"type": "legacy", "href": "/dojo/black-belt.html", "label": f"Open the {mid_} lab in the original Black Belt manual"}))
            else:
                tl.append(tool(f"form.black.{mid_}", {"type": "form", "journal": f"black.{mid_}"}))
            rend = common.replace("{{dialect-slot}}", dial or "")
            rend = re.sub(r"^(?:Bk\d · \w+ · [^\n]*\n\n)", "", rend)
            body_lines = [ln for ln in plain(dd["body"]).split("\n") if len(ln) > 12]
            have = plain(rend)
            body = J2(f"## {dd['head']}", dd["body"] if not all(ln in have for ln in body_lines) else "", re.sub(r"^## [^\n]*\n\n", "", rend, count=1))
            days.append(day(dk, {"thu": "Thursday", "fri": "Friday"}[dk], dd["head"].split("—", 1)[-1].strip(),
                            [dict(c, **({"tools": tl} if j == 0 else {})) for j, c in enumerate(split_pages(f"{mid}.{dk}.main", "action" if dk == "thu" else "check", dd["head"], body,
                                                                                                             "Lab" if dk == "thu" else "Deliverable", budget=2200))], lab=True))
        modules.append({"id": mid, "belt": "black", "kind": "week", "kicker": f"Black Belt · Module {mid_}", "title": m["title"], "subtitle": m["q"],
                        "golden": m["golden"], "goldenLabel": golden_label(os.path.join(bdir, f"{m['id']}_mon_us_office.html")), "assembly": md_table(["Day"], [[x] for x in m["map"]]), "days": days})
    sdays = [sanct_day(f"black-s4.{m['id'].lower().replace('.', '-')}", m) for m in D["sanctuary"]]
    modules.append({"id": "black-s4", "belt": "black", "kind": "sanctuary", "title": "Sanctuary Layer 4", "subtitle": "", "days": sdays})
    grid = {"belt": "black", "column": "Bridges", "stages": D["gridStages"]}
    return modules, grid, kd, D


# ---------------------------------------------------------------- SANCTUARY
def build_sanctuary():
    D = jtag(os.path.join(DOJO, "sanctuary.html"), "sanctuary-data")
    s = soup(os.path.join(DOJO, "sanctuary.html"))
    modules = []
    for L in D["layers"]:
        lid = L["id"].lower().replace("l", "s")
        days = [sanct_day(f"{lid}.{m['id'].lower().replace('.', '-')}", m) for m in L["modules"]]
        known = {"id", "short", "belt", "name", "shift", "intro", "modules"}
        extra = "\n\n".join(f"**{k}.** {v}" for k, v in L.items() if k not in known and isinstance(v, str))
        modules.append({"id": lid, "kind": "layer", "title": L["name"], "subtitle": L.get("shift", ""), "kicker": L.get("belt", ""),
                        "intro": J2(L.get("intro", ""), extra), "days": days})
    caut = "\n".join(f"{i+1}. **{c['name']}** {c['md']}" for i, c in enumerate(D["cautions"]))
    modules.append({"id": "cautions", "kind": "cautions", "title": "The 7 Cautions", "subtitle": "Read these before the Sanctuary becomes a playbook.",
                    "days": [day("all", "Cautions", "The 7 Cautions", [card("cautions.all.1", "info", "The 7 Cautions", caut, label="Cautions")])]})
    JOURNAL["sanctuary.journal"] = {"id": "sanctuary.journal", "belt": "sanctuary", "module": "Journal", "title": "3-line I-Thou journal", "store": "sanctuary", "list": "journal",
                                    "fields": [{"k": "happened", "label": "What happened between us", "multi": True},
                                               {"k": "layer", "label": "Which layer it touched, and which armor showed up", "multi": True},
                                               {"k": "marker", "label": "The marker, if there was one", "multi": True}], "sanctuary": True}
    JOURNAL["sanctuary.rim"] = {"id": "sanctuary.rim", "belt": "sanctuary", "module": "S1.3", "title": "Relational Immunity Map", "store": "sanctuary", "path": "rim",
                                "fields": [{"k": "goal", "label": "Goal", "multi": True}, {"k": "instead", "label": "What I do instead", "multi": True},
                                           {"k": "hidden", "label": "Hidden competing commitment", "multi": True}, {"k": "bigAssumption", "label": "Big Assumption", "multi": True},
                                           {"k": "test", "label": "Safe test", "multi": True}], "sanctuary": True}
    # overview text from the static page
    hero = s.find(["header", "section"])
    pocket = {"belt": "sanctuary", "front": "Am I here, and are they?", "frontSub": "", "back": "Am I here, and are they?", "backSub": ""}
    return modules, pocket, D


# ---------------------------------------------------------------- ELLIPSIS
def build_ellipsis():
    pit = json.loads(subprocess.check_output(["node", "-e",
        "import('" + os.path.join(ROOT, "src/data/pitAddendum.js").replace("\\", "/") + "').then(m=>process.stdout.write(JSON.stringify(m)))"]))
    add = pit["PIT_MODULE_ADDENDA"]
    modules = []
    for n in range(1, 7):
        T = J(os.path.join(ROOT, "src", "data", f"tier{n}.json"))
        for m in T["modules"]:
            mid = m["id"].lower()
            mm = m["mentalModel"]
            days = [day("model", "Mental Model", mm["name"], split_pages(f"{mid}.model.core", "core", mm["name"], "\n\n".join(mm["prose"]), "Mental Model", budget=1300))]
            for i, mc in enumerate(m["mechanics"]):
                body = "\n\n".join(mc["prose"])
                cards = split_pages(f"{mid}.chain{i+1}.core", "core", mc["title"], body, f"Causal Chain {i+1}", budget=1300)
                if mc.get("comparisonTable"):
                    ct = mc["comparisonTable"]
                    cards.append(card(f"{mid}.chain{i+1}.deeper", "deeper", mc["title"], md_table(ct["headers"], ct["rows"])))
                cards[-1].setdefault("hook", mc["l2Hook"])
                days.append(day(f"chain{i+1}", f"Chain {i+1}", mc["title"], cards))
            a = add.get(m["id"])
            if a:
                cp = "\n\n".join(note(x["title"], f"**Setting:** {x['setting']}\n\n**Signal:** {x['signal']}\n\n**Counter-move:** {x['counterMove']}\n\n**Break line:** {x['breakLine']}") for x in a["liveRoomCounterPlay"])
                cc = "\n\n".join(note(x["author"], x["insight"]) for x in a["crossCorpusSynthesis"])
                sh = "\n\n".join(note(x["trap"], f"**Mechanism:** {x['mechanism']}\n\n**Calibration:** {x['calibration']}", "warn") for x in a["operatorShadow"])
                stage = pit["PIT_STAGES"][a["pitStage"]]["label"]
                days.append(day("field", "In the Field", "The Pit · " + stage, [
                    card(f"{mid}.field.core", "core", "Operational thesis", a["operationalThesis"], label="Core Idea"),
                    card(f"{mid}.field.action", "action", "Live-room counter-play", cp),
                    card(f"{mid}.field.deeper", "deeper", "Cross-corpus synthesis", cc),
                    card(f"{mid}.field.check", "check", "Operator shadow", sh),
                ]))
            modules.append({"id": mid, "kind": "module", "tier": n, "tierTitle": T["title"], "tierSubtitle": T.get("subtitle", ""), "title": m["title"], "number": m["number"],
                            "subtitle": " · ".join(m["sources"]), "codexIds": (a or {}).get("codexIds", []), "days": days})
    codex = pit["INITIAL_PIT_CODEX"]
    return modules, codex, pit


# ---------------------------------------------------------------- JOURNAL specs for Blue/Brown/Black
def journal_specs(blue_D, brown_G):
    blue_fields = {
        "B1": ("b1Cards", "Three Camera-Clean Baseline Cards", [("person", "Person"), ("setting", "Setting"), ("posture", "Posture & Space (Camera-only)"), ("pace", "Pace, Volume & Formality"),
                                                              ("gaze", "Gaze & Hands"), ("stress", "1 Stress Cluster (only if seen)"), ("display", "Context / Display-Rule Note"), ("myTell", "My Own W1 Tell State")]),
        "B2": ("b2Cards", "Hypothesis Cards", [("person", "Person"), ("currency", "Working Read (Verb-Only)"), ("conf", "Confidence"), ("verdict", "Verdict"),
                                               ("evidence", "Observable Evidence + Role Filter"), ("falsifier", 'Falsifier ("What would change my mind")'), ("outcome", "Check-Back & Outcome")]),
        "B3": ("b3Matrix", "Position-vs-Need Matrix", [("context", "Conversation (Office / Personal)"), ("concern", "Underlying Core Concern / Need"), ("pos", "Stated Position"),
                                                       ("interest", "Real Interest / Non-Accusatory Question"), ("answer", "Honor + Hold Answer")]),
        "B4": ("b4Loops", "Conversation-Type Loops", [("who", "Who / Setting"), ("type", "Conversation Type"), ("res", "Outcome"), ("loop", "What I Distilled Back"), ("rep", "Their Exact Reply & Shift")]),
        "B5": ("b5Audits", "Accusation Audits & Boundary Sentences", [("office", "Office Accusation Audit"), ("personal", "Personal Accusation Audit"), ("b1", "Boundary Sentence #1"),
                                                                      ("b2", "Boundary Sentence #2"), ("b3", "Boundary Sentence #3")]),
        "B6": ("b6Log", "Contact Log", [("who", "Who / Setting"), ("opener", "Opener Tag"), ("light", "Return Light"), ("forecast", "Forecast (0–10)"), ("actual", "Actual (0–10)"),
                                        ("ping", "Initiation or Processed Ping"), ("back", "Their Exact Words Back"), ("next", "Next Move (Specific 2nd Invite if Green)")]),
    }
    for wid, (lst, ttl, fs) in blue_fields.items():
        JOURNAL[f"blue.{wid}"] = {"id": f"blue.{wid}", "belt": "blue", "module": wid, "title": ttl, "store": "blue",
                                  **({"path": lst} if wid == "B5" else {"list": lst}),
                                  "fields": [{"k": k, "label": l, "multi": len(l) > 26} for k, l in fs]}
    # Brown and Black: Friday deliverables written into the manuals' own saved-state shape (so old saves import as-is).
    # Labels and placeholders are the manuals' own, read from the rendered Friday views.
    def F(k, label, ph="", multi=False, options=None):
        f = {"k": k, "label": label, "placeholder": ph, "multi": multi}
        if options:
            f["options"] = options
        return f
    ask = [F("orig", "Original Hedged / Raw Ask", "What you wrote or usually say"), F("threat", "Face-Threat Named", "e.g., High P + R, Negative Face (Autonomy)"),
           F("strat", "Politeness Strategy Chosen", "Autonomy Wrap / Solidarity Wrap / Bald"), F("outcome", "What Happened", "Their actual reply"),
           F("rewrite", "Rewritten Intact Ask (Survives Wrap)", "Clean proposal in EN")]
    turn = [F("words", "Exact Words Said", "What was literally spoken"), F("sig", "Style / Accommodation Signal", "Overlap, pause, convergence, spin"),
            F("msg", "Message (Content Track)", "Literal information"), F("meta", "Metamessage (Relationship Track)", "Claim about power or closeness")]
    brown = {
        "Br1": [{"repeat": "br1.asks", "count": 5, "itemTitles": ["Ask #1", "Ask #2", "Ask #3", "Ask #4 (Spanish target)", "Ask #5 (Spanish target)"], "fields": ask,
                 "itemPlaceholders": [{}, {}, {}, {"rewrite": "Clean proposal in ES"}, {"rewrite": "Clean proposal in ES"}]}],
        "Br2": [{"repeat": "br2.turns", "count": 4, "itemTitles": ["Turn 1 (Counterpart)", "Turn 2 (Me)", "Turn 3 (Counterpart)", "Turn 4 (Me)"], "fields": turn},
                {"fields": [F("br2.frameBreaker", "The One Sentence That Would Have Broken the Frame", "Write the exact single sentence that would have broken the battle frame…", True)]}],
        "Br3": [{"repeat": "br3.lexicon", "count": 12, "itemTitle": "Word", "growable": True,
                 "fields": [F("word", "Word / Concept", "e.g., leverage, loyalty, orgullo"), F("weight", "Emotional Weight For Me", "Which language hits harder?"),
                            F("en", "US English", "Connotation"), F("rio", "Rioplatense", "Connotation"), F("es", "España", "Connotation")]},
                {"title": "1-Page Language-Self Note (English Me vs. Spanish Me)",
                 "fields": [F("br3.selfConflict", "In Conflict", "How do my English self and Spanish self handle friction differently?", True),
                            F("br3.selfAsking", "In Asking", "Which language hedges more, and which states proposals cleaner?", True),
                            F("br3.selfAffection", "In Affection", "Where does warmth feel truer, and when do I use L2 as armor?", True)]}],
        "Br4": [{"repeat": "br4.ladder", "count": 5, "itemTitle": "Rung", "fields": [F("target", "Target person", "Target person (office or personal)"),
                                                                                       F("draft", "4-Part Draft", "4-Part Draft: Frame → Advocate → Illustrate → Inquire", True),
                                                                                       {"k": "processed", "label": "Processed ✓", "check": True}, {"k": "executed", "label": "Executed", "check": True}]}],
        "Br5": [{"fields": [F("br5.map.purpose", "1. Purpose Sentence (Frame upfront)", "One crisp sentence stating why we are meeting", True),
                            F("br5.map.fourPart", "2. Four-Part Ask (Frame + Advocate + Illustrate + Inquire)", "Your ≤45-second pitch", True),
                            F("br5.map.concerns", "3. Counterpart's Likely Positions & Core Concerns", "What budget/status/autonomy concerns might they hold?", True),
                            F("br5.map.questions", "4. Calibrated Questions (Warm-Curious How/What)", "2–3 questions to draw out constraints cleanly", True),
                            F("br5.map.decisionType", "5. Proposed Decision Type (Inform / Consult / Negotiate)", "How you'll clarify who decides", True),
                            F("br5.map.batna", "6. Real Walk-Away Line (BATNA)", "Your concrete, non-bluffing alternative if the answer is no", True),
                            F("br5.map.email", "7. 3-Line Confirming Email", "Agreement + Owner/Date + Warm Close", True)]}],
        "Br6": [{"title": "Part 1 · One Real Repair (Office or Personal)",
                 "fields": [F("br6.repair.context", "Dojo", "", False, ["Office", "Personal"]), F("br6.repair.what", "What Happened", "Specific action and impact", True),
                            F("br6.repair.said", "What You Said (Zero 'but', Accountable Mechanism + Repair)", "Your exact repair words", True),
                            F("br6.repair.received", "How It Was Received", "Their response and whether face was restored", True)]},
                {"title": "Part 2 · One Renovation Tracker (Phases 1–4 + Consent)",
                 "fields": [F("br6.reno.friend", "Friend Chosen", "Who you'd like to deepen with"),
                            F("br6.reno.consent", "Consent Check", "", False, ["Green — welcomed depth", "Yellow — stay steady", "Red — prefers shallows (honored gracefully)"]),
                            F("br6.reno.p1", "Phase 1 · Self-Audit", "How you kept it shallow"), F("br6.reno.p2", "Phase 2 · Micro-Friction", "Preference stated without apology"),
                            F("br6.reno.p3", "Phase 3 · Emotional Pivot", "Processed true thing offered"), F("br6.reno.p4", "Phase 4 · Meta-Conversation", "New contract (only if 2–3 landed)")]}],
    }
    for w in brown_G["WEEKS"]:
        wid = w["id"]
        JOURNAL[f"brown.{wid}"] = {"id": f"brown.{wid}", "belt": "brown", "module": wid, "title": w["deliv"], "store": "brown", "sections": brown[wid]}
    room = lambda r: [F(f"bk1.{r}.pos", "1. Room Construal (Bennett Atmosphere)", "e.g., Minimization / Defense (room, not people)"),
                      F(f"bk1.{r}.rules", "2. Invisible Rules (Schein Contradiction Hunt)", "Espoused value vs. actual reaction when norm is tested", True),
                      F(f"bk1.{r}.rewarded", "3. Rewarded Behaviors", "What earns airtime or approval"),
                      F(f"bk1.{r}.forbidden", "4. Forbidden Truths", "What triggers silence or hallway-only talk"),
                      F(f"bk1.{r}.safety", "5. Safety Climate & Possible Moves (Edmondson)", "Calibrated low-risk move vs. written trail")]
    black = {
        "Bk1": [{"title": "Room A · Office Room Map", "fields": room("office")}, {"title": "Room B · Personal Room Map", "fields": room("personal")}],
        "Bk2": [{"fields": [F("bk2.room", "Target Room (from Bk1 Map)", "Room name + construal + entry currency"), F("bk2.orig", "Original Proposal", "How you originally framed it", True),
                            F("bk2.downshifted", "Downshifted Proposal", "Translated into room's entry currency", True),
                            F("bk2.seq", "Sequence Adjustment", "Relationship-first vs. Task-first / Tribe mandates validated"),
                            F("bk2.survived", "Integrity Audit · Core Stake Survived", "What load-bearing requirement stayed 100% intact"),
                            F("bk2.lost", "What Changed / Was Lost", "Wrapper adjustments vs. any unintended loss")]}],
        "Bk3": [{"fields": [F("bk3.dropped", "1. One Reflexive Translation Tax Dropped", "Situation + what happened when others carried their 50%", True),
                            F("bk3.commitment", "2. One Anchored Commitment", "Nuanced multi-perspectival topic + concrete stance taken", True),
                            F("bk3.reversal", "3. Reversal Check", "One strength & one real limit held for both US and ES/Rioplatense settings", True)]}],
        "Bk4": [{"fields": [F("bk4.circuit", "1. Bowen Circuit Identified", "Triangle / Overfunctioning / Distance + your own node", True),
                            F("bk4.selfMod", "2. Self-Modification First", "Exact habitual move you stopped making before speaking", True),
                            F("bk4.reframe", "3. Tentative Double-Loop Reframe (Torbert)", "Exact soft-clay wording + concrete 5-minute next step", True),
                            F("bk4.readiness", "4. Room Readiness Outcome", "How the room landed + calibration for next time")]}],
        "Bk5": [{"title": "6-Field Dark-Side Literacy Codex (Expanding W4 → Full 20-Entry Target)", "repeat": "bk5.codex", "count": 3, "growable": True, "max": 20, "itemTitle": "Codex",
                 "fields": [F("tactic", "Tactic Name", "e.g., Diversion, Covert Intimidation"), F("context", "1. Context", "Where it typically appears"),
                            F("range", "2. Range", "Who uses it (not just 'types')"), F("harm", "3. Harm", "What it costs when unaddressed"),
                            F("remedy", "4. Remedy / Exit Script", "Calm, factual drop-the-rope response"), F("ethical", "5. Ethical Counterpart", "Legitimate non-manipulative version"),
                            F("temptation", "6. Your Own Temptation (Dark-Side Literacy)", "When am I tempted to pull this exact move?")]},
                {"title": "Pre-Committed Walk-Away Thresholds (BATNA & Rule #9)",
                 "fields": [F("bk5.walkOffice", "Office Walk-Away Line", "Exact condition where I stop negotiating, document, or escalate", True),
                            F("bk5.walkPersonal", "Personal Separation Line", "Exact pattern where I step back to protect dignity/safety", True)]}],
        "Bk6": [{"title": "Part 1 · Dissolved Deadlock & Double-Loop Log",
                 "fields": [F("bk6.deadlock", "One Dissolved Deadlock", "Binary stalemate → Premise questioned → Concrete next step landed", True),
                            F("bk6.doubleLoop", "One Double-Loop / Confidant Conversation", "Fixed constraint accepted vs. modifiable assumption examined (or Confirm → Challenge → Stay)", True)]},
                {"title": "Part 2 · The Systemic Architecture Toolkit",
                 "fields": [F("bk6.toolkitAudit", "1. The Frame Audit (Pre-Meeting Checklist)", "Bennett room position · Schein invisible rules · Real meeting beneath agenda · Likely game", True),
                            F("bk6.toolkitScripts", "2. 'Name the Game' Scripts", "Your calm, neutral sentences for making covert dynamics explicit without accusation", True),
                            F("bk6.toolkitPostMortem", "3. Post-Mortem Systems Map", "Debrief template: how room rules shifted, where frame was lost/won, where the bridge held", True)]}],
    }
    KD = jtag(os.path.join(DOJO, "black-belt.html"), "black-data")
    for mid_, m in KD["modules"].items():
        JOURNAL[f"black.{mid_}"] = {"id": f"black.{mid_}", "belt": "black", "module": mid_, "title": m["deliv"], "store": "black", "sections": black[mid_]}
    JOURNAL["black.Bk5"]["starterCodex"] = KD["starterCodex"]


# ---------------------------------------------------------------- main
LIVE_READOUT = [r"Proposal Strength: \d+%", r"^\d+ words @ \d+ wpm", r"^~\d+s \(Target", r"Currently logged: \d+ entr", r"\(1–5\) \d+/5$",
                r"Socratic Rungs Answered: \d+ / \d+", r"^\d\d:\d\d$"]


def clean_card_md(md, has_form=False):
    md = re.sub(r"^- \[ \] Mark \w+ Complete\s*$", "", md, flags=re.M)
    if has_form:
        md = re.sub(r":::field [^\n]*\n(?:[^\n]*\n)?:::\n?", "", md)
    out = []
    for ln in md.split("\n"):
        ln2 = re.sub(r"\s*Currently logged: \d+ entr\w*\.?", "", ln)
        if any(re.search(p, ln2.strip()) for p in LIVE_READOUT):
            continue
        out.append(ln2)
    md = "\n".join(out)
    # drop notes left empty
    md = re.sub(r":::(?:note|warn)[^\n]*\n\s*:::\n?", "", md)
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md.strip()


def main():
    os.makedirs(OUT, exist_ok=True)
    white, white_pocket, white_grid, wd = build_white()
    blue, blue_pocket, blue_grid, bd, blue_D = build_blue()
    brown, brown_grid, brown_G = build_brown()
    black, black_grid, kd, black_D = build_black()
    sanct, sanct_pocket, sanct_D = build_sanctuary()
    ell, codex, pit = build_ellipsis()
    journal_specs(blue_D, brown_G)

    pockets = {
        "white": white_pocket, "blue": blue_pocket,
        "brown": {"belt": "brown", "front": "", "frontSub": "", "back": "What reality are my words building?", "backSub": ""},
        "black": {"belt": "black", "front": "1. Read the room before the person. · 2. Name the pattern, not the person. · 3. Offer a better game.", "frontSub": "",
                  "back": "Am I a bridge here, or a code-switcher?", "backSub": ""},
        "sanctuary": sanct_pocket,
    }
    # Brown pocket card front from the manual's modal
    bs = soup(os.path.join(DOJO, "brown-belt.html"))
    pm = bs.select_one("#pocket-modal")
    if pm:
        pockets["brown"]["frontSub"] = re.sub(r"\s+", " ", pm.get_text(" ", strip=True))
    # Belt handoff cards: the manuals' own closing/handoff text, last card of each capstone
    handoffs = {"white": "blue", "blue": "brown", "brown": "black", "black": "loop"}
    belts = {"white": white, "blue": blue, "brown": brown, "black": black}
    for b, mods in belts.items():
        cap = [m for m in mods if m["kind"] == "capstone"][0]
        cap["handoffTo"] = handoffs[b]

    tracks = [
        {"id": "profiling", "door": 1, "title": "Behavioral Profiling & Influence", "subtitle": "The Ellipsis Manual & Six-Minute X-Ray", "modules": ell},
        {"id": "communication", "door": 2, "title": "Communication Mastery", "subtitle": "White → Blue → Brown → Black Belt", "modules": white + blue + brown + black},
        {"id": "presence", "door": 3, "title": "Intimacy & Presence", "subtitle": "The Sanctuary · S1–S4", "modules": sanct},
    ]
    # clean every card: no live-widget readouts, no "Mark X Complete" boxes, no inline fields where a form tool owns them
    for t in tracks:
        for m in t["modules"]:
            for d in m["days"]:
                for c in d["cards"]:
                    c["md"] = clean_card_md(c["md"], has_form=any(TOOLS.get(x, {}).get("type") == "form" for x in c.get("tools", [])))
    # write per-module files + manifest
    manifest = []
    for t in tracks:
        tdir = os.path.join(OUT, "modules", t["id"])
        os.makedirs(tdir, exist_ok=True)
        mods = []
        for m in t["modules"]:
            json.dump(m, open(os.path.join(tdir, m["id"] + ".json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
            mods.append({k: v for k, v in m.items() if k not in ("days",)} | {"days": [{"id": d["id"], "label": d["label"], "title": d["title"], "lab": d.get("lab", False), "cards": len(d["cards"])} for d in m["days"]]})
        manifest.append({k: v for k, v in t.items() if k != "modules"} | {"modules": mods})
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
    json.dump(TOOLS, open(os.path.join(OUT, "tools.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
    json.dump(JOURNAL, open(os.path.join(OUT, "journal.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
    json.dump({"pockets": pockets, "grids": {"white": white_grid, "blue": blue_grid, "brown": brown_grid, "black": black_grid}, "codex": codex,
               "pitStages": pit["PIT_STAGES"], "blackStarterCodex": black_D["starterCodex"]},
              open(os.path.join(OUT, "extras.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
    n_cards = sum(len(d["cards"]) for t in tracks for m in t["modules"] for d in m["days"])
    print("modules", sum(len(t["modules"]) for t in tracks), "cards", n_cards, "tools", len(TOOLS), "journal", len(JOURNAL))


if __name__ == "__main__":
    main()
