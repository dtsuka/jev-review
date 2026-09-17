import { readFile } from 'node:fs/promises';
import path from 'node:path';
export function download(root: string, name: string) {
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) throw new Error('Invalid filename');
  return readFile(path.join(root, name));
}
