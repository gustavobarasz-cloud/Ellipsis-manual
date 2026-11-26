# Communication Dojo (4 Belts) + The Pit — Complete Workstation Drop-In Bundle

All-in-one, zero-dependency drop-in bundle for the **Behavioral Intelligence Workstation** (`ellipsis-manual.vercel.app`).

## Folder Layout Inside This Zip

```text
public/
  dojo/
    white-belt.html        # White Belt Complete Manual v4.2 (Gold Master)
    blue-belt.html         # Blue Belt Complete Field Manual v4.2 Final
    brown-belt.html        # Brown Belt Field Manual v3.2 (Full Deepened + 100% Canon)
    black-belt.html        # Black Belt Field Manual v3 (Complete)
data/
  pitAddendum.js           # Complete Pass C Pit Layer (M01-M12 DEEPENED + 13-Card Codex)
components/
  UnifiedCurriculumApp.jsx # Pre-patched shell with Reader, Audit, DAG, Pit Codex, Post-Mortems & Dojo (4 Belts)
  dojo/
    DojoHubView.jsx        # 4-Belt Hub hosting the live manuals + cross-links to M01-M12 & Pit Codex
  pit/
    PitModuleAddendum.jsx  # Section 6 Operational Addendum inside every module M01-M12
    PitOpsViews.jsx        # 6-Field Pit Codex + Field Post-Mortem Logger (localStorage)
```

## Notes for Claude / Vercel Deployment
1. **`public/dojo/` ALWAYS goes at the repository root** (`<repo>/public/dojo/*.html`) so Next.js serves them at `/dojo/white-belt.html`, `/dojo/blue-belt.html`, `/dojo/brown-belt.html`, and `/dojo/black-belt.html`.
2. **`components/` and `data/`** go at the same level where `UnifiedCurriculumApp.jsx` and `data/loadCurriculum.js` currently live (root or `src/`).
3. **Zero new npm dependencies** (pure React + Tailwind CSS + static HTML).
4. **Why static `/public/dojo/*.html` + iframe?** Preserves 100% of each belt manual's custom woodcut/letterpress CSS, interactive labs, linters, 9-rung Socratic decks, voice rehearsal, `@media print` 1-page Field Cards, and `localStorage` persistence with zero Tailwind CSS collisions or Next.js SSR build issues.
5. Run `npm run build` before pushing to `main` so Vercel deploys cleanly to `ellipsis-manual.vercel.app`.
