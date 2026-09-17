# jev-review

Project-wide code review triage powered by TypeSafe AI's Jev System One model.

`jev-review` scans source files and asks Jev for probabilistic decisions about whether each file warrants deeper review. It is intended as a fast screening layer before a coding agent or human performs detailed investigation.

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
# Edit .env and set TYPESAFE_API_KEY.
pnpm build
```

## Usage

```bash
# Review the current project
node dist/cli.js .

# Development mode
pnpm dev -- .

# Security only
pnpm dev -- . --checks security

# Only treat >= 80% as attention-worthy
pnpm dev -- . --threshold 0.8

# Limit an exploratory run
pnpm dev -- . --max-files 20
```

The full machine-readable result is written to `.jev-review/report.json`.

## Intended workflow

```text
project
  -> jev-review broad screening
  -> suspicious files
  -> Codex / Cursor / human deep review
  -> verify finding and propose fix
```

Jev is used for triage, not as an authoritative static analyzer. A high probability means the file should receive deeper review; it does not prove that a vulnerability or bug exists. Likewise, low probability does not prove a file is safe.

For security-sensitive projects, use this alongside deterministic tools such as the language type checker, linters, dependency auditing, Semgrep or CodeQL as appropriate.

## Current MVP limitations

- First pass is primarily file-level; cross-file bugs can be missed.
- Basic project context is attached, but imported source files are not yet expanded into the request.
- Large source files are truncated.
- Jev's early-access API may evolve; the response adapter is isolated in `src/jev.ts`.
- Thresholds need calibration against real projects and seeded known issues before they should drive automation.

## Environment

```text
TYPESAFE_API_KEY=...
```

The CLI and benchmark commands automatically load `.env` from the current working directory. Existing shell environment variables take precedence. Do not commit API keys.

## License

MIT
