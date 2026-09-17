import { readFile } from 'node:fs/promises';
import path from 'node:path';

const CONTEXT_FILES = [
  'package.json', 'tsconfig.json', 'README.md', 'pyproject.toml',
  'requirements.txt', 'composer.json', 'Cargo.toml', 'go.mod',
];

export async function loadProjectContext(root: string): Promise<string> {
  const parts: string[] = [];
  for (const name of CONTEXT_FILES) {
    try {
      const content = await readFile(path.join(root, name), 'utf8');
      parts.push(`--- ${name} ---\n${content.slice(0, 20_000)}`);
    } catch {
      // Optional context file.
    }
  }
  return parts.join('\n\n').slice(0, 50_000);
}
