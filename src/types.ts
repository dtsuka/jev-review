export const CHECKS = [
  'bug',
  'security',
  'refactor',
  'performance',
  'error_handling',
  'type_safety',
] as const;

export type CheckName = (typeof CHECKS)[number];

export const DEFAULT_THRESHOLDS: Record<CheckName, number> = {
  // bug is intentionally lower than the benchmark sweep grid: one seeded bug scored 0.28.
  bug: 0.25,
  security: 0.70,
  refactor: 0.30,
  performance: 0.40,
  error_handling: 0.60,
  type_safety: 0.40,
};

export interface FileResult {
  file: string;
  scores: Partial<Record<CheckName, number>>;
  error?: string;
}

export interface ReviewReport {
  version: 2;
  generatedAt: string;
  root: string;
  thresholds: Record<CheckName, number>;
  checks: CheckName[];
  files: FileResult[];
}
