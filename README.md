# jev-review

[日本語版 README](README.ja.md)

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

The recommended way to use jev-review is as a Codex Skill. Once installed, Codex can run the Jev screening step and the focused deep review as one workflow.

### 1. Install the CLI and Skill

Clone this repository and install its dependencies:

```bash
git clone https://github.com/dtsuka/jev-review.git
cd jev-review

pnpm install
cp .env.example .env
# Edit .env and set TYPESAFE_API_KEY.

pnpm build
```

Make the `jev-review` command available globally, then install the Skill:

```bash
pnpm link --global
bash scripts/install-skill.sh
```

The installer creates:

```text
~/.agents/skills/jev-review
  -> <path-to-this-repository>/skills/jev-review
```

It is a symbolic link rather than a copy, so updating this repository also updates the installed Skill. If Codex does not notice a newly installed Skill, restart Codex.

You can verify the CLI separately with:

```bash
jev-review --help
```

### 2. Use it from the project you want to review

Open the target repository in Codex. You do **not** need to copy jev-review into that repository.

Invoke the Skill explicitly:

```text
$jev-review Review this project.
```

For example:

```text
$jev-review Review this repository for concrete bugs and security issues.
```

You can also ask Codex for a project-wide Jev review without explicitly naming the Skill; Codex may select it from the Skill description. Using `$jev-review` is recommended when you want to guarantee this workflow is used.

### 3. What the Skill does

Codex follows this pipeline automatically:

```text
target repository
      |
      v
jev-review .
      |
      +-- .jev-review/report.json
      |
      +-- .jev-review/category-handoff.json
                  |
                  v
          Codex deep review
          - reads each selected file in full
          - focuses on the selected categories
          - may follow necessary dependencies/context
          - does not use Jev scores as evidence
          - does not see suspicious chunk locations
                  |
                  v
      .jev-review/category-verified-report.json
                  |
                  v
          findings summarized to you
```

The separation is intentional: Jev decides **where to spend review effort**, while Codex determines whether a concrete problem actually exists and explains the root cause.

### 4. Generated files

The target repository gets a local `.jev-review/` directory. The main production artifacts are:

- `report.json` — complete Jev screening output. This is useful for diagnostics, but the deep reviewer does not use its scores as evidence.
- `category-handoff.json` — the boundary between Jev and Codex. It contains only selected file names and review categories.
- `category-verified-report.json` — concrete findings produced by Codex after full-file review.

The Skill deliberately avoids reading baseline, stability, previous verification, and experimental evaluation artifacts during a real review.

### Updating or uninstalling

Because the Skill is symlinked, updating is normally just:

```bash
cd /path/to/jev-review
git pull
pnpm install
pnpm build
```

There is no need to run the Skill installer again unless the link was removed.

To uninstall the Skill, remove only its symlink:

```bash
rm ~/.agents/skills/jev-review
```

If you no longer want the globally linked CLI, also run:

```bash
pnpm unlink --global jev-review
```

See `skills/jev-review/SKILL.md` for the agent workflow and `skills/jev-review/references/category-review.md` for the deep-review contract.

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
