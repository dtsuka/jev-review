import type { CheckName } from './types.js';

const API_URL = 'https://api.typesafe.ai/v1/systemone';

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

  const questions = Object.fromEntries(
    args.checks.map((check) => [check, { type: 'boolean', description: QUESTIONS[check] }]),
  );

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${args.apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: 'jev-latest', state, questions }),
  });

  if (!response.ok) {
    throw new Error(`Jev API ${response.status}: ${await response.text()}`);
  }

  const data = await response.json() as Record<string, unknown>;
  const answers = ((data.answers ?? data.output ?? data.results ?? data) as Record<string, unknown>);
  const scores: Partial<Record<CheckName, number>> = {};

  for (const check of args.checks) {
    const raw = answers[check];
    const score = extractYesProbability(raw);
    if (score === undefined) {
      throw new Error(`Unexpected Jev response for ${check}: ${JSON.stringify(raw)}`);
    }
    scores[check] = score;
  }
  return scores;
}

function extractYesProbability(value: unknown): number | undefined {
  if (typeof value === 'number') return normalize(value);
  if (!value || typeof value !== 'object') return undefined;
  const obj = value as Record<string, unknown>;
  for (const key of ['yes', 'true', 'probability', 'p', 'confidence']) {
    if (typeof obj[key] === 'number') return normalize(obj[key] as number);
  }
  if (obj.probabilities && typeof obj.probabilities === 'object') {
    const probs = obj.probabilities as Record<string, unknown>;
    for (const key of ['yes', 'true', 'Yes', 'True']) {
      if (typeof probs[key] === 'number') return normalize(probs[key] as number);
    }
  }
  if (typeof obj.value === 'boolean' && typeof obj.confidence === 'number') {
    const confidence = normalize(obj.confidence);
    return obj.value ? confidence : 1 - confidence;
  }
  return undefined;
}

function normalize(n: number): number {
  return n > 1 ? n / 100 : n;
}
