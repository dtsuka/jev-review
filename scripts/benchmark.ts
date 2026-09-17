import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHECKS, type CheckName } from '../src/types.js';
import { reviewWithJev } from '../src/jev.js';

type Expected = Record<string, Partial<Record<CheckName, boolean>>>;
type Counts = { tp: number; fp: number; tn: number; fn: number };

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const fixtureRoot = path.join(root, 'fixtures');
const threshold = Number(process.env.BENCHMARK_THRESHOLD ?? '0.7');
const apiKey = process.env.TYPESAFE_API_KEY;
if (!apiKey) throw new Error('TYPESAFE_API_KEY is required');

const expected: Expected = JSON.parse(await readFile(path.join(fixtureRoot, 'expected.json'), 'utf8'));
const counts = Object.fromEntries(CHECKS.map((c) => [c, { tp: 0, fp: 0, tn: 0, fn: 0 }])) as Record<CheckName, Counts>;
const results: Record<string, Partial<Record<CheckName, number>>> = {};

for (const [file, labels] of Object.entries(expected)) {
  const source = await readFile(path.join(fixtureRoot, file), 'utf8');
  const checks = Object.keys(labels) as CheckName[];
  const scores = await reviewWithJev({ file, source, projectContext: 'TypeScript benchmark fixture for jev-review. Some fixtures intentionally contain defects; others are clean.', checks, apiKey });
  results[file] = scores;
  console.log(`\n${file}`);
  for (const check of checks) {
    const score = scores[check] ?? 0;
    const predicted = score >= threshold;
    const truth = labels[check] === true;
    const c = counts[check];
    if (truth && predicted) c.tp++;
    else if (truth) c.fn++;
    else if (predicted) c.fp++;
    else c.tn++;
    console.log(`  ${check.padEnd(16)} ${(score * 100).toFixed(1)}%  expected=${truth ? 'yes' : 'no'} ${predicted === truth ? '✓' : '✗'}`);
  }
}

const metric = (n: number, d: number) => d ? n / d : null;
console.log(`\nBenchmark summary @ threshold ${threshold}`);
console.log('check             precision  recall     accuracy');
for (const check of CHECKS) {
  const c = counts[check];
  const precision = metric(c.tp, c.tp + c.fp);
  const recall = metric(c.tp, c.tp + c.fn);
  const accuracy = metric(c.tp + c.tn, c.tp + c.fp + c.tn + c.fn);
  const pct = (v: number | null) => v === null ? 'n/a'.padStart(8) : `${(v * 100).toFixed(1)}%`.padStart(8);
  console.log(`${check.padEnd(17)} ${pct(precision)} ${pct(recall)} ${pct(accuracy)}`);
}

await mkdir(path.join(root, '.jev-review'), { recursive: true });
await writeFile(path.join(root, '.jev-review', 'benchmark.json'), JSON.stringify({ generatedAt: new Date().toISOString(), threshold, counts, results }, null, 2));
console.log('\nRaw results: .jev-review/benchmark.json');
