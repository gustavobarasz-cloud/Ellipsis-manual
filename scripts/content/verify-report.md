# Content migration check

Modules: 53 · days: 223 · cards: 695 · interactive tools: 137 · journal tools: 31

## Counts

| Check | Found | Expected |
|---|---|---|
| White lesson parts | 18 | 18 |
| Blue lesson parts | 18 | 18 |
| Brown lesson parts | 18 | 18 |
| Black lesson parts | 18 | 18 |
| Blue Socratic rungs | 162 | 162 |
| Brown Socratic rungs | 162 | 162 |
| Black resolved seams | 7 | 7 |
| Sanctuary modules (S1.1–S4.3) | 13 | 13 |
| Sanctuary cautions | 7 | 7 |
| Ellipsis modules | 12 | 12 |
| Ellipsis causal chains | 36 | 36 |
| White Socratic deck cards | 18 | — |

## Text diff (source strings found word for word in the migrated content)

| Source | Strings checked | Missing |
|---|---|---|
| White Belt (HTML views + decks, dialects, grid) | 424 | 0 |
| Blue Belt (embedded data) | 2356 | 0 |
| Brown Belt (deep layers, canon, data, rendered views in all 4 dialects) | 5310 | 0 |
| Black Belt (embedded data, rendered views in all 4 dialects) | 4851 | 0 |
| Sanctuary (embedded data) | 204 | 0 |
| Ellipsis Manual & X-Ray modules (tier1–6 + Pit addendum) | 369 | 0 |

## What the diff does not count as lesson text

- Interface chrome: tab strips, day navigation, buttons, layer tags, save pills, pocket-card flip hints, form controls, and the labels of controls inside interactive labs (each lab is ported as a tool or linked to the original page).
- Live widget readouts computed at run time: timers, scores, counters such as "Socratic Rungs Answered: 0 / 162".
- Headers the manuals compose from two migrated parts, such as "Brown Belt · Br4 · Deliverable: …".
- Blue Belt drills P4 and P6 and their need list, which only ran inside claude.ai: Claude-run drills P4/P6 (worked only inside claude.ai); need list used only by the Claude-run P6 drill. Also each capstone test's Claude rehearsal prompt.
- Strings shorter than 12 characters.

## Missing strings

None.

## Days with more than 4 cards (long content paged at paragraph breaks)

black-overview/intro (15), blue-overview/intro (7), brown-overview/intro (10), white-overview/intro (5)
