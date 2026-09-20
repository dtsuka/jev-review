import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { writeCategoryHandoff } from '../src/category-handoff.js';
import type { ReviewReport } from '../src/types.js';

const root = path.resolve(process.argv[2] ?? '.');
const report: ReviewReport = JSON.parse(
  await readFile(path.join(root, '.jev-review', 'report.json'), 'utf8'),
);
const outputPath = await writeCategoryHandoff(root, report);
const selected = report.files.filter(
  (file) =>
    file.forceReview ||
    file.error ||
    Object.entries(file.scores).some(
      ([category, score]) =>
        (score ?? 0) >= (report.thresholds[category as keyof typeof report.thresholds] ?? 1),
    ),
);

console.log(`Category-only handoff: ${selected.length}/${report.files.length} files`);
console.log(`Handoff: ${path.relative(process.cwd(), outputPath)}`);
