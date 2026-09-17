import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';

const DEFAULT_EXTENSIONS = [
  'js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx', 'mts', 'cts',
  'py', 'php', 'rb', 'go', 'rs', 'java', 'kt', 'kts', 'cs',
  'vue', 'svelte', 'astro', 'css', 'scss', 'sql', 'sh',
];

const IGNORE = [
  '**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**',
  '**/.next/**', '**/.nuxt/**', '**/.output/**', '**/coverage/**',
  '**/vendor/**', '**/.venv/**', '**/venv/**', '**/.jev-review/**',
  '**/*.min.js', '**/*.map',
];

export async function collectFiles(root: string): Promise<string[]> {
  const pattern = `**/*.{${DEFAULT_EXTENSIONS.join(',')}}`;
  return fg(pattern, {
    cwd: root,
    absolute: true,
    onlyFiles: true,
    unique: true,
    dot: false,
    ignore: IGNORE,
    gitignore: true,
  });
}

export async function readSource(file: string, maxChars = 120_000): Promise<string> {
  const text = await readFile(file, 'utf8');
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n/* jev-review: truncated */`;
}

export function relativeFile(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join('/');
}
