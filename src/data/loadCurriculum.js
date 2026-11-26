// Modular Tier Loader, Smart Merger & 4-Invariant Client-Side Validator
import tier1 from "./tier1.json";
import tier2 from "./tier2.json";
import tier3 from "./tier3.json";
import tier4 from "./tier4.json";
import tier5 from "./tier5.json";
import tier6 from "./tier6.json";

export const DEFAULT_TIER_BUNDLES = [tier1, tier2, tier3, tier4, tier5, tier6];

export function mergeCurriculumBundles(bundles) {
  if (!bundles || bundles.length === 0) {
    throw new Error("At least one curriculum bundle is required.");
  }

  const entityTypeRegistry = bundles[0].entityTypeRegistry || {};
  const mergedGlossary = {};
  const tiersMap = {};
  const modulesMap = {};

  for (const b of bundles) {
    const modIdsInBundle = new Set(Object.keys(b.modules || {}));

    // Merge tiers
    for (const t of b.tiers || []) {
      tiersMap[t.id] = t;
    }

    // Merge modules
    for (const [mId, mod] of Object.entries(b.modules || {})) {
      modulesMap[mId] = mod;
    }

    // Smart merge glossary (prefer authoritative introducing module)
    for (const [slug, entry] of Object.entries(b.masterGlossary || {})) {
      if (!mergedGlossary[slug]) {
        mergedGlossary[slug] = { ...entry };
      } else {
        const existing = mergedGlossary[slug];
        const isAuthoritative = modIdsInBundle.has(entry.introducedInModule);
        const primary = isAuthoritative ? { ...entry } : { ...existing };
        const secondary = isAuthoritative ? existing : entry;

        const related = Array.from(
          new Set([...(primary.relatedTerms || []), ...(secondary.relatedTerms || [])])
        );
        if (related.length > 0) primary.relatedTerms = related;
        if (!primary.absorbedSynonyms && secondary.absorbedSynonyms) {
          primary.absorbedSynonyms = secondary.absorbedSynonyms;
        }
        mergedGlossary[slug] = primary;
      }
    }
  }

  const sortedTiers = Object.values(tiersMap).sort((a, b) => a.order - b.order);
  const sortedModules = Object.fromEntries(
    Object.entries(modulesMap).sort(([, a], [, b]) => a.order - b.order)
  );
  const sortedGlossary = Object.fromEntries(
    Object.entries(mergedGlossary).sort(([, a], [, b]) => {
      if (a.introducedInModule !== b.introducedInModule) {
        return (a.introducedInModule || "").localeCompare(b.introducedInModule || "");
      }
      return a.id.localeCompare(b.id);
    })
  );

  return {
    schemaVersion: "1.0.0",
    title: "Unified Behavioral Intelligence Curriculum (6MX + Ellipsis Manual)",
    compiledTiers: sortedTiers.map((t) => t.id),
    pendingTiers: [],
    entityTypeRegistry,
    masterGlossary: sortedGlossary,
    tiers: sortedTiers,
    modules: sortedModules,
    plannedModules: {},
  };
}

export function validateCurriculumDatabase(db) {
  const errors = [];
  const glossaryIds = new Set(Object.keys(db.masterGlossary || {}));

  for (const [modId, mod] of Object.entries(db.modules || {})) {
    const p1 = mod.pass1;
    const p2 = mod.pass2;
    if (!p1 || !p2) {
      errors.push(`${modId}: Missing pass1 or pass2 payload.`);
      continue;
    }

    // 1. L2 Hook Resolution
    const combinedMd = `${p1.mentalModel?.proseMarkdown || ""}
${p1.granularMechanics?.causalChainsMarkdown || ""}`;
    const l2Inline = new Set([...combinedMd.matchAll(/\[L2-HOOK:([^\]]+)\]/g)].map((m) => m[1]));
    const l2Keys = new Set(Object.keys(p2.calibrationLabs || {}));
    for (const h of l2Inline) {
      if (!l2Keys.has(h)) errors.push(`${modId}: Unresolved inline L2 hook ${h}`);
    }

    // 2. L3 Epistemic Guardrail
    const l3Keys = new Set(Object.keys(p2.epistemicDrawers || {}));
    for (const claim of p1.epistemicAudit?.gradedClaims || []) {
      if ((claim.tier === "T2" || claim.tier === "T3") && !claim.linkedL3HookId) {
        errors.push(`${modId}: ${claim.tier} claim ${claim.id} missing linkedL3HookId`);
      }
      if (claim.linkedL3HookId && !l3Keys.has(claim.linkedL3HookId)) {
        errors.push(`${modId}: Missing L3 drawer ${claim.linkedL3HookId}`);
      }
    }

    // 3. Glossary Integrity
    const refs = new Set([
      ...(p1.canonicalTermIds || []),
      ...(p1.dependencies?.forwardLinks || []).map((f) => f.termId),
      ...(p1.appSeed?.fieldCalibrationDrill?.targetSkillTermIds || []),
      ...(p1.crossTextReconciliation?.synonymResolutions || []).map((s) => s.canonicalTermId),
    ]);
    for (const r of refs) {
      if (!glossaryIds.has(r)) errors.push(`${modId}: Missing glossary slug '${r}'`);
    }

    // 4. Layer 1 Patch Merge Verification
    for (const patch of p2.layer1Audit?.causalGapPatches || []) {
      if (patch.status !== "merged") {
        errors.push(`${modId}: Unmerged Layer 1 patch ${patch.id}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function loadDefaultCurriculum() {
  return mergeCurriculumBundles(DEFAULT_TIER_BUNDLES);
}
