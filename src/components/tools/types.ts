export interface GridStage { n: string; t?: string; sig?: string; gift?: string; shadow?: string; tell?: string; move?: string; [k: string]: string | undefined }
export type GridMap = Record<string, { belt: string; column: string; stages: GridStage[] }>;
