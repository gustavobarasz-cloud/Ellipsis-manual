import tier1 from "./tier1.json";
import tier2 from "./tier2.json";
import tier3 from "./tier3.json";
import tier4 from "./tier4.json";
import tier5 from "./tier5.json";
import tier6 from "./tier6.json";
import type {
  CurriculumTier,
  CurriculumModule,
  L2HookIndexItem,
} from "@/types/curriculum";

export const CURRICULUM_TIERS: CurriculumTier[] = [
  tier1 as CurriculumTier,
  tier2 as CurriculumTier,
  tier3 as CurriculumTier,
  tier4 as CurriculumTier,
  tier5 as CurriculumTier,
  tier6 as CurriculumTier,
];

export const ALL_MODULES: Array<CurriculumModule & { tierNumber: number; tierTitle: string }> =
  CURRICULUM_TIERS.flatMap((tier) =>
    tier.modules.map((mod) => ({
      ...mod,
      tierNumber: tier.tierNumber,
      tierTitle: tier.title,
    }))
  );

export const ALL_L2_HOOKS: L2HookIndexItem[] = CURRICULUM_TIERS.flatMap((tier) =>
  tier.modules.flatMap((mod) =>
    mod.mechanics.map((sec) => ({
      hookId: sec.l2Hook,
      tierNumber: tier.tierNumber,
      moduleId: mod.id,
      moduleTitle: mod.title,
      sectionTitle: sec.title,
    }))
  )
);
