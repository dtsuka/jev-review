---
name: jev-review
description: Project-wide code-review triage with Jev followed by focused deep review. Use when asked to review a repository for bugs, security, refactoring, performance, error handling, or type-safety issues while reducing the amount of code sent to deep review.
---

# Jev Review

Use the `jev-review` CLI as the screening stage, then perform deep review only on selected files.

## Workflow

1. From the jev-review repository, run the scanner against the target project:
   `pnpm dev -- <project-root>`
2. Generate the category-only handoff:
   `pnpm category-handoff <project-root>`
3. Read only `<project-root>/.jev-review/category-handoff.json` from the generated review artifacts.
4. For every listed file, read the entire file and investigate the listed categories. Categories are review requirements, not proof of defects.
5. Follow the detailed rules in `references/category-review.md`.
6. Write `<project-root>/.jev-review/category-verified-report.json`.

Do not use Jev scores as evidence. Do not restrict investigation to Jev chunks. Do not inspect baseline/evaluation artifacts during a real review.

## Categories

- bug
- security
- refactor
- performance
- error_handling
- type_safety

## Fail-open behavior

If screening reports a file as forced because a chunk failed, review the whole file for all requested categories.

## Evaluation-only material

Files such as baseline reports, attention reports, handoff verification reports, and stability runs exist for development of this workflow. They must not influence a production review.
