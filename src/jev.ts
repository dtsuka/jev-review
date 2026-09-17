import { noul, TypeSafeClient } from '@typesafe-ai/sdk';
import type { CheckName } from './types.js';

const QUESTIONS: Record<CheckName, string> = {
  bug: 'Does this file contain an issue likely to cause incorrect runtime behavior or a real malfunction?',
  security: 'Does this file contain a security vulnerability, authorization flaw, unsafe data handling, injection risk, or other security issue?',
  refactor: 'Does this file materially need refactoring because of excessive complexity, duplication, coupling, poor maintainability, or unclear structure?',
  performance: 'Does this file contain a meaningful performance or resource-efficiency problem?',
  error_handling: 'Does this file have inadequate error handling that is likely to cause failures, hidden errors, data loss, or poor recovery?',
  type_safety: 'Does this file contain a meaningful type-safety issue that could allow incorrect values or behavior to escape static checks?',
};

export async function reviewWithJev(args: {
  file: string;
  source: string;
  projectContext: string;
  checks: CheckName[];
  apiKey: string;
}): Promise<Partial<Record<CheckName, number>>> {
  const state = [
    'You are screening one source file for code-review risks. Judge the actual code, not style preferences. A yes answer means the issue is sufficiently plausible that a deeper code review is warranted.',
    `TARGET FILE: ${args.file}`,
    args.projectContext ? `PROJECT CONTEXT:\n${args.projectContext}` : '',
    `SOURCE:\n${args.source}`,
  ].filter(Boolean).join('\n\n');

  const client = new TypeSafeClient({ apiKey: args.apiKey });
  const questions = Object.fromEntries(args.checks.map((check) => [check, noul(QUESTIONS[check])]));
  const { answers } = await client.systemOne({ model: 'jev-latest', state, questions });
  const scores: Partial<Record<CheckName, number>> = {};

  for (const check of args.checks) {
    const answer = answers[check];
    if (!answer || answer.type !== 'noul') {
      throw new Error(`Unexpected Jev response for ${check}: ${JSON.stringify(answer)}`);
    }
    scores[check] = answer.noul;
  }
  return scores;
}
