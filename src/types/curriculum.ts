export interface ComparisonTable {
  headers: string[];
  rows: string[][];
}

export interface MechanicSection {
  title: string;
  l2Hook: string;
  prose: string[];
  comparisonTable?: ComparisonTable;
}

export interface MentalModel {
  name: string;
  prose: string[];
}

export interface CurriculumModule {
  id: string;
  number: number;
  title: string;
  sources: string[];
  mentalModel: MentalModel;
  mechanics: MechanicSection[];
}

export interface CurriculumTier {
  tierNumber: number;
  tierId: string;
  title: string;
  subtitle: string;
  modules: CurriculumModule[];
}

export interface L2HookIndexItem {
  hookId: string;
  tierNumber: number;
  moduleId: string;
  moduleTitle: string;
  sectionTitle: string;
}
