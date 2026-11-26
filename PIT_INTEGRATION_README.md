# The Pit — Complete Operational Addendum Drop-In Bundle

Zero-dependency drop-in bundle for the **Behavioral Intelligence Workstation** (`ellipsis-manual.vercel.app`).

## Files Included (Drop Directly Into Repo Root or `src/` Root)

1. `data/pitAddendum.js`
   - Complete Pass C operational addendum covering all 12 modules (`M01`–`M12`, all `DEEPENED`).
   - Includes `Live-Room Counter-Play`, `Cross-Corpus Synthesis`, `Operator's Shadow`, and 13 starter **6-Field Pit Codex** entries (`PIT-01`–`PIT-13`).
2. `components/pit/PitModuleAddendum.jsx`
   - Renders **Section 6 · The Pit Operational Addendum** at the bottom of every module in the Reader view, with one-click jumps to the Pit Codex and Field Post-Mortem logger.
3. `components/pit/PitOpsViews.jsx`
   - Exports `PitCodexView` (searchable/filterable 6-Field Codex + live card creator) and `PitPostMortemView` (live encounter debrief logger linked to `M01`–`M12`), both persisted in `localStorage`.
4. `components/UnifiedCurriculumApp.jsx`
   - Pre-patched drop-in replacement for your existing `UnifiedCurriculumApp.jsx` with the `Pit Codex` and `Post-Mortems` top-bar tabs and `<PitModuleAddendum />` already wired in.

## Notes for Claude / Vercel Deployment
- **No new npm packages required** (pure React + Tailwind CSS).
- **Relative import alignment:** If your repo places `components/` and `data/` inside `src/`, drop `components/` and `data/` into `src/` so `../data/...` and `../../data/pitAddendum` resolve cleanly.
- **Verification:** Run `npm run build` before pushing to confirm zero Next.js / Vercel build errors.
