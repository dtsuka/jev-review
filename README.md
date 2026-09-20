# jev-review

Project-wide code-review triage powered by TypeSafe AI's Jev System One model, designed to hand a smaller, focused set of files to Codex or another deep reviewer.

The production workflow is:

```text
repository
  -> Jev screening
  -> selected file + review categories
  -> full-file deep review
  -> concrete findings
```

Jev decides **where and in which categories to spend review effort**. It does not diagnose the final root cause. Deep review sees the complete selected file, but not Jev scores or suspicious line ranges, reducing anchoring on the screening output.

## Checks

- `bug`
- `security`
- `refactor`
- `performance`
- `error_handling`
- `type_safety`

## Setup

Requires Node.js 20+ and TypeSafe AI API access.

```bash
pnpm install
cp .env.example .env
# Set TYPESAFE_API_KEY in .env
pnpm build

# Make the CLI available to Codex from any repository.
pnpm link --global

# Install the reusable Codex skill.
bash scripts/install-skill.sh
```

Codex currently discovers user skills from `~/.agents/skills`. The installer creates a symlink, so edits in this repository are immediately reflected in the installed skill.

## CLI usage

```bash
# Production scan
jev-review .

# Development mode
pnpm dev -- .

# Security only
jev-review . --checks security

# Override all thresholds
jev-review . --threshold 0.8
```

A scan writes:

- `.jev-review/report.json` — full Jev scores and diagnostics.
- `.jev-review/runs/report-*.json` — archived screening runs.
- `.jev-review/category-handoff.json` — production deep-review input containing only selected files and categories.

The category handoff is generated automatically by the CLI. `pnpm category-handoff <project>` remains available for regenerating it from an existing report.

## Codex Skill

After installing the skill, invoke it explicitly in Codex with `$jev-review`, or ask for a project-wide Jev review and let Codex match the skill description.

The skill runs Jev screening, reads only the production category handoff, reviews the complete selected files for the requested categories, and writes `.jev-review/category-verified-report.json`.

See `skills/jev-review/SKILL.md` for the workflow and `skills/jev-review/references/category-review.md` for the deep-review contract.

## Why file + category handoff?

Experiments in this repository compare several handoff strategies: strict chunks, chunk attention hints, blind selected files, and category-only review. The current production choice is **file + category**:

- chunks remain useful internally for keeping Jev requests bounded;
- deep review is not constrained to those chunks;
- scores and line hints are hidden from the deep reviewer;
- categories direct attention without asserting that a defect exists.

Evaluation scripts are development tools and must not be read by the reviewer during a real review.

## Safety and limitations

Jev is a triage layer, not an authoritative static analyzer. A high probability does not prove an issue exists, and a low probability does not prove a file is safe. Cross-file issues can still be missed, file-kind policies can suppress categories, and thresholds remain project-dependent.

For security-sensitive projects, combine this workflow with deterministic tools such as the language type checker, linters, dependency auditing, Semgrep, or CodeQL as appropriate.

## Evaluation

Development/evaluation commands currently include:

```bash
pnpm evaluate <project>
pnpm stability <project>
pnpm evaluate:handoff <project>
pnpm evaluate:attention <project>
pnpm evaluate:category <project>
```

These are for calibration and experiments, not the production Skill workflow.

## Environment

```text
TYPESAFE_API_KEY=...
```

The CLI automatically loads `.env` from its current environment. Existing shell environment variables take precedence. Do not commit API keys.

## License

MIT
