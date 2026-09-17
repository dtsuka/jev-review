export const CHECKS = [
  'bug',
  'security',
  'refactor',
  'performance',
  'error_handling',
  'type_safety',
] as const;

export type CheckName = (typeof CHECKS)[number];

export interface FileResult {
  file: string;
  scores: Partial<Record<CheckName, number>>;
  error?: string;
}

export interface ReviewReport {
  version: 1;
  generatedAt: string;
  root: string;
  threshold: number;
  checks: CheckName[];
  files: FileResult[];
}
