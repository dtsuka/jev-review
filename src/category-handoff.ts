import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ReviewReport } from './types.js';

export interface CategoryHandoffFile {
  file: string;
  categories: string[];
}

export interface CategoryHandoff {
  version: 1;
  generatedAt: string;
  sourceReportGeneratedAt: string;
  files: CategoryHandoffFile[];
}

export function buildCategoryHandoff(report: ReviewReport): CategoryHandoff {
  const files = report.files
    .filter((file) =>
      file.forceReview ||
      file.error ||
      Object.entries(file.scores).some(
        ([category, score]) => (score ?? 0) >= (report.thresholds[category as keyof typeof report.thresholds] ?? 1),
      ),
    )
    .map((file) => ({
      file: file.file,
      categories:
        file.forceReview || file.error
          ? [...report.checks]
          : Object.entries(file.scores)
              .filter(
                ([category, score]) =>
                  (score ?? 0) >= (report.thresholds[category as keyof typeof report.thresholds] ?? 1),
              )
              .map(([category]) => category),
    }));

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    sourceReportGeneratedAt: report.generatedAt,
    files,
  };
}

export async function writeCategoryHandoff(root: string, report: ReviewReport): Promise<string> {
  const outputDir = path.join(root, '.jev-review');
  const outputPath = path.join(outputDir, 'category-handoff.json');
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, JSON.stringify(buildCategoryHandoff(report), null, 2) + '\n');
  return outputPath;
}
