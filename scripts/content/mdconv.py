"""HTML -> card markdown converter used by build.py.

Card markdown is the small dialect the app's renderer understands:
  # / ## / ### headings, paragraphs, '- ' and '1. ' lists (two levels),
  '> ' quotes, GFM tables, ':::note Label' / ':::details Summary' /
  ':::dialect Label' blocks closed by ':::', and '{{tool:id}}' lines.
Text is kept word for word; only markup changes.
"""
import re
from bs4 import NavigableString, Tag, Comment

DROP = {"script", "style", "input", "textarea", "select", "button", "svg", "option", "noscript", "canvas"}
BLOCK = {"p", "div", "section", "article", "header", "footer", "main", "aside", "nav", "figure", "form", "fieldset"}
NOTE_CLASSES = {"callout", "c-note", "note", "ex-box", "lab-box", "sub-card", "save-pill-wrap", "deep-note", "guard", "warn", "tip"}


def esc_cell(s):
    return s.replace("|", "\\|").replace("\n", " ")


def norm_ws(s):
    return re.sub(r"[ \t\r\f\v]+", " ", s)


def inline(node):
    """Inline markdown for a node's children."""
    out = []
    for c in node.children:
        if isinstance(c, Comment):
            continue
        if isinstance(c, NavigableString):
            out.append(norm_ws(str(c)).replace("\n", " "))
            continue
        if not isinstance(c, Tag):
            continue
        n = c.name
        if n in DROP:
            continue
        if n == "br":
            out.append("\n")
            continue
        inner = inline(c)
        if n in ("strong", "b"):
            t = inner.strip()
            if t:
                lead = " " if inner[:1].isspace() else ""
                trail = " " if inner[-1:].isspace() else ""
                out.append(f"{lead}**{t}**{trail}")
        elif n in ("em", "i", "cite"):
            t = inner.strip()
            if t:
                lead = " " if inner[:1].isspace() else ""
                trail = " " if inner[-1:].isspace() else ""
                out.append(f"{lead}*{t}*{trail}")
        elif n == "code":
            out.append(f"`{inner.strip()}`")
        else:
            out.append(inner)
    s = "".join(out)
    s = re.sub(r"[ ]{2,}", " ", s)
    s = re.sub(r" *\n *", "\n", s)
    s = re.sub(r"\*\* ([.,;:!?)])", r"**\1", s)
    return s


def table_md(t):
    rows = []
    for tr in t.find_all("tr"):
        cells = [esc_cell(inline(td).strip()) for td in tr.find_all(["th", "td"], recursive=False)]
        if any(cells):
            rows.append(cells)
    if not rows:
        return ""
    width = max(len(r) for r in rows)
    rows = [r + [""] * (width - len(r)) for r in rows]
    head = rows[0]
    lines = ["| " + " | ".join(head) + " |", "|" + "---|" * width]
    for r in rows[1:]:
        lines.append("| " + " | ".join(r) + " |")
    return "\n".join(lines)


def list_md(lst, depth=0):
    lines = []
    ordered = lst.name == "ol"
    i = 0
    for li in lst.find_all("li", recursive=False):
        i += 1
        sub = []
        body = []
        for c in li.children:
            if isinstance(c, Tag) and c.name in ("ul", "ol"):
                sub.append(list_md(c, depth + 1))
            elif isinstance(c, Tag) and c.name in BLOCK | {"p"}:
                body.append(inline(c).strip())
            else:
                frag = Tag(name="span")
                body.append(inline_one(c))
        text = "".join(x for x in body if x).strip()
        text = re.sub(r"\s*\n\s*", " ", text)
        text = re.sub(r"[ ]{2,}", " ", text)
        marker = f"{i}." if ordered else "-"
        if text:
            lines.append("  " * depth + f"{marker} {text}")
        lines.extend(s for s in sub if s)
    return "\n".join(lines)


def inline_one(c):
    if isinstance(c, Comment):
        return ""
    if isinstance(c, NavigableString):
        return norm_ws(str(c))
    holder = Tag(name="span")
    holder.append(c.__copy__())
    return inline(holder)


def note_label(div):
    for sel in ["span.callout-label", "span.nlabel", ".nlabel", ".callout-label", ".ex-label", ".label", "span.layer-tag", ".eyebrow"]:
        lab = div.select_one(sel)
        if lab and lab.get_text(strip=True):
            t = lab.get_text(" ", strip=True)
            lab.extract()
            return t
    return ""


def blocks(node, out):
    """Append markdown block strings for node's children to out."""
    buf = []

    def flush():
        txt = "".join(buf).strip()
        buf.clear()
        if txt:
            out.append(re.sub(r" *\n *", "\n", txt))

    for c in node.children:
        if isinstance(c, Comment):
            continue
        if isinstance(c, NavigableString):
            if str(c).strip():
                buf.append(norm_ws(str(c)))
            continue
        if not isinstance(c, Tag):
            continue
        n = c.name
        if n in DROP or {"no-print-md", "layer-tag", "save-pill", "part-tabs", "dialect-bar", "socratic-deck", "td-lbl"} & set(c.get("class") or []):
            continue
        cls = set(c.get("class") or [])
        if n in ("strong", "b", "em", "i", "code", "span", "a", "cite", "small", "mark", "sup", "sub", "br", "label"):
            if n == "label":
                if not c.find_parent(class_="lab-box"):
                    box = c.find("input", attrs={"type": "checkbox"})
                    if box is not None:
                        flush()
                        t = inline(c).strip()
                        if t:
                            out.append("- [ ] " + t)
                        continue
                    ctl = c.find_next_sibling(["textarea", "input"])
                    if ctl is not None and ctl.name == "textarea" or (ctl is not None and ctl.get("type", "text") == "text"):
                        flush()
                        t = inline(c).strip()
                        ph = (ctl.get("placeholder") or "").strip()
                        if t:
                            out.append(f":::field {t}\n{ph}\n:::" if ph else f":::field {t}\n:::")
                        continue
                continue
            buf.append(inline_one(c))
            continue
        flush()
        if n in ("h1", "h2"):
            t = inline(c).strip()
            if t:
                out.append("## " + t)
        elif n in ("h3", "h4", "h5", "h6"):
            t = inline(c).strip()
            if t:
                out.append("### " + t)
        elif n == "p":
            t = inline(c).strip()
            if t:
                out.append(t)
        elif n in ("ul", "ol"):
            t = list_md(c)
            if t:
                out.append(t)
        elif n == "table":
            t = table_md(c)
            if t:
                out.append(t)
        elif n == "blockquote":
            inner = []
            blocks(c, inner)
            if inner:
                out.append("\n".join("> " + ln for ln in "\n\n".join(inner).split("\n")))
        elif n == "details":
            summ = c.find("summary")
            title = inline(summ).strip() if summ else "More"
            if summ:
                summ.extract()
            inner = []
            blocks(c, inner)
            out.append(f":::details {title}\n" + "\n\n".join(inner) + "\n:::")
        elif n == "summary":
            t = inline(c).strip()
            if t:
                out.append("### " + t)
        elif n == "hr":
            continue
        elif cls & NOTE_CLASSES:
            c2 = c.__copy__()
            label = note_label(c2)
            inner = []
            blocks(c2, inner)
            if inner or label:
                tone = "warn" if ("non" in cls or "warn" in cls) else "note"
                out.append(f":::{tone} {label}".rstrip() + "\n" + "\n\n".join(inner) + "\n:::")
        else:
            blocks(c, out)
    flush()


def html_to_md(node):
    out = []
    blocks(node, out)
    return "\n\n".join(x for x in out if x.strip())


def plain(md):
    """Plain text of card markdown, for diffing."""
    s = re.sub(r"^:::\w*\s?", "", md, flags=re.M)
    s = re.sub(r"\{\{[^}]*\}\}", " ", s)
    s = re.sub(r"^@\w+ ", "", s, flags=re.M)
    s = re.sub(r"^\|?-+(\|-+)*\|?$", " ", s, flags=re.M)
    s = s.replace("\\|", "\u0001").replace("|", " ").replace("\u0001", "|")
    s = re.sub(r"^#+ ", "", s, flags=re.M)
    s = re.sub(r"^\s*(?:[-*]|\d+\.) (?:\[[ x]\] )?", "", s, flags=re.M)
    s = re.sub(r"^> ?", "", s, flags=re.M)
    return norm_text(s)


def norm_text(s):
    s = s.replace("\u00a0", " ")
    s = re.sub(r"\*\*|__|`", "", s)
    s = re.sub(r"(?<![\w*])\*(?!\s)|(?<!\s)\*(?![\w*])", "", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()
