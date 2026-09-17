import { readFile } from 'node:fs/promises';
import path from 'node:path';
export function download(root: string, requestedPath: string) {
  return readFile(path.join(root, requestedPath));
}
