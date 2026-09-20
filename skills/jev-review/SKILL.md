---
name: jev-review
description: Review a software repository with Jev triage followed by focused full-file deep review. Use for project-wide bug, security, performance, error-handling, refactoring, or type-safety review when the user wants broad coverage without sending every file to deep review.
---

# Jev Review

Run Jev as a screening stage, then deep-review the selected files. The production handoff is **file + category**. Jev scores and chunk locations are intentionally hidden from deep review to reduce anchoring.

## Run

1. From the target repository, run:
   `jev-review .`
2. Read `.jev-review/category-handoff.json`.
3. Read `references/category-review.md`.
4. For every handoff file, read the complete file and investigate every listed category.
5. Follow dependencies, callers, callees, types, and configuration only when needed to establish or reject a concrete issue.
6. Write `.jev-review/category-verified-report.json` using the schema in the reference.
7. Summarize concrete findings for the user. Distinguish confirmed findings from areas that merely received extra scrutiny.

If `jev-review` is not available on PATH, stop and tell the user to install/link the CLI. Do not silently replace Jev screening with an ordinary whole-project review.

## Rules

- A selected category is a review requirement, not evidence of a defect.
- Do not use Jev probability scores as evidence.
- Do not inspect Jev chunk scores or suspicious line ranges.
- Do not restrict deep review to a chunk; review the entire selected file.
- Do not read baseline, prior verification, evaluation, stability, or experiment artifacts during a real review.
- Do not report style-only concerns or hypothetical risks without a concrete failure mode.
- De-duplicate root causes.
- A concrete issue may ultimately be classified differently from the category that led to its discovery.
- If screening forces a file because of an upstream failure, review the whole file for all requested categories.

## Categories

`bug`, `security`, `refactor`, `performance`, `error_handling`, `type_safety`.
