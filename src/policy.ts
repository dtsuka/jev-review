import path from 'node:path';
import { CHECKS, type CheckName } from './types.js';

export type FileKind = 'test' | 'style' | 'types' | 'bridge' | 'source';

/** Classify a source path so review checks can account for the file's role. */
export function classifyFile(file: string): FileKind {
  const normalized = file.replaceAll('\\', '/').toLowerCase();
  const base = path.posix.basename(normalized);
  if (/(^|\/)(tests?|__tests__|spec)(\/|$)/.test(normalized) || /\.(test|spec)\.[^.]+$/.test(base)) return 'test';
  if (/\.(css|scss|sass|less)$/.test(base)) return 'style';
  if (/(^|[-_.])(types?|interfaces?)([-_.]|$)/.test(base) || base.endsWith('.d.ts')) return 'types';
  if (/(^|[-_.])(bridge|bindings?|ipc|client)([-_.]|$)/.test(base)) return 'bridge';
  return 'source';
}

/** Limit the requested checks to those that are meaningful for the file's kind. */
export function checksForFile(file: string, requested: CheckName[]): CheckName[] {
  const kind = classifyFile(file);
  const allowed: Record<FileKind, readonly CheckName[]> = {
    source: CHECKS,
    test: ['bug', 'error_handling'],
    style: ['bug', 'performance', 'refactor'],
    types: ['bug', 'type_safety', 'refactor'],
    bridge: ['bug', 'security', 'error_handling', 'type_safety'],
  };
  return requested.filter((check) => allowed[kind].includes(check));
}

/** Describe file-kind-specific guidance to include in the review context. */
export function policyContext(file: string): string {
  const kind = classifyFile(file);
  if (kind === 'test') return 'This is test code. Intentional casts, malformed fixtures, mocks, and negative-test inputs are not production defects unless they invalidate the test itself.';
  if (kind === 'style') return 'This is stylesheet code. Do not infer executable type-safety or application error-handling defects from CSS.';
  if (kind === 'types') return 'This is primarily a types/interfaces module. Judge concrete contract or type-safety risks, not the mere presence of type assertions.';
  if (kind === 'bridge') return 'This is a boundary/bridge module. Propagating errors to callers can be intentional; flag error handling only when this layer loses errors, corrupts context, or violates its contract.';
  return '';
}
