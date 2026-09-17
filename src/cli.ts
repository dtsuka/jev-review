#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Command } from 'commander';
import pc from 'picocolors';
import { collectFiles, readSource, relativeFile } from './scanner.js';
import { loadProjectContext } from './context.js';
import { reviewWithJev } from './jev.js';
import { CHECKS, type CheckName, type FileResult, type ReviewReport } from './types.js';

const program = new Command()
  .name('jev-review')
  .description('Project-wide code review triage powered by TypeSafe AI Jev')
  .argument('[directory]', 'directory to review', '.')
  .option('-t, --threshold <number>', 'attention threshold', '0.70')
  .option('-c, --checks <checks>', 'comma-separated checks')
  .option('--max-files <number>', 'maximum number of files to scan')
  .option('--concurrency <number>', 'parallel Jev requests', '4')
  .parse(withoutPnpmSeparator(process.argv));

const directory = path.resolve(program.args[0] ?? '.');
const options = program.opts();
const threshold = Number(options.threshold);
const concurrency = Math.max(1, Number(options.concurrency));
const apiKey = process.env.TYPESAFE_API_KEY;

if (!apiKey) {
  console.error(pc.red('TYPESAFE_API_KEY is required.'));
  process.exit(1);
}
if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
  console.error(pc.red('--threshold must be between 0 and 1.'));
  process.exit(1);
}

const checks = parseChecks(options.checks);
let files = await collectFiles(directory);
if (options.maxFiles) files = files.slice(0, Math.max(0, Number(options.maxFiles)));
const projectContext = await loadProjectContext(directory);

console.log(pc.bold(`Jev Review — ${files.length} files`));
console.log(pc.dim(`Checks: ${checks.join(', ')} | threshold: ${threshold}`));

const results = await mapLimit(files, concurrency, async (file): Promise<FileResult> => {
  const relative = relativeFile(directory, file);
  try {
    const source = await readSource(file);
    const scores = await reviewWithJev({ file: relative, source, projectContext, checks, apiKey });
    const hits = Object.entries(scores).filter(([, score]) => (score ?? 0) >= threshold);
    if (hits.length) {
      console.log(`${pc.yellow('⚠')} ${relative}  ${hits.map(([k, v]) => `${k} ${Math.round((v ?? 0) * 100)}%`).join('  ')}`);
    } else {
      console.log(`${pc.green('✓')} ${pc.dim(relative)}`);
    }
    return { file: relative, scores };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`${pc.red('✗')} ${relative}  ${pc.red(message)}`);
    return { file: relative, scores: {}, error: message };
  }
});

const report: ReviewReport = {
  version: 1,
  generatedAt: new Date().toISOString(),
  root: directory,
  threshold,
  checks,
  files: results,
};

const outputDir = path.join(directory, '.jev-review');
await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

const attention = results.filter((r) => Object.values(r.scores).some((score) => (score ?? 0) >= threshold));
const errors = results.filter((r) => r.error);
console.log(`\n${pc.bold('Summary')}: ${results.length} scanned, ${pc.yellow(String(attention.length))} need attention, ${errors.length} errors`);
console.log(pc.dim(`Report: ${path.relative(process.cwd(), path.join(outputDir, 'report.json'))}`));
if (errors.length > 0) process.exitCode = 1;

function parseChecks(input?: string): CheckName[] {
  if (!input) return [...CHECKS];
  const values = input.split(',').map((v) => v.trim()).filter(Boolean);
  const invalid = values.filter((v) => !(CHECKS as readonly string[]).includes(v));
  if (invalid.length) throw new Error(`Unknown checks: ${invalid.join(', ')}`);
  return values as CheckName[];
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function withoutPnpmSeparator(argv: string[]): string[] {
  return argv[2] === '--' ? [...argv.slice(0, 2), ...argv.slice(3)] : argv;
}
