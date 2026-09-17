# Baseline review protocol

Run this with Codex/Cursor against the target project **without reading `.jev-review/report.json` or `verified-report.json`**. This avoids biasing the baseline toward Jev-selected files.

## Prompt

Review every source file in this project for concrete issues in these categories: bug, security, refactor, performance, error_handling, type_safety.

Do not modify files. Do not read `.jev-review/report.json` or `.jev-review/verified-report.json` before completing the review. Ignore generated/vendor files. Test-only casts, mocks, malformed fixtures, and intentionally propagated boundary errors are not production defects unless they cause a concrete problem.

Record only concrete findings that warrant engineering attention. Write JSON to `.jev-review/baseline-report.json` with this shape:

```json
{
  "version": 1,
  "generatedAt": "ISO-8601",
  "reviewedFiles": 0,
  "findings": [
    {
      "file": "src/example.ts",
      "category": "bug",
      "severity": "medium",
      "locations": [{ "startLine": 1, "endLine": 2, "symbol": "example" }],
      "problem": "Concrete explanation",
      "proposedFix": "Concrete fix"
    }
  ]
}
```

A finding should have one primary category. If one root cause spans categories, do not duplicate it merely to increase counts.

## Evaluation

After both Jev triage verification and the blind baseline exist:

```bash
pnpm evaluate -- /path/to/project
```

The evaluator reports deep-review file reduction, verified triage precision, baseline issue retention, missed baseline findings, and a file-count cost proxy. File reduction is not actual token/API cost; measured token/cost accounting should be added when the reviewing agent exposes it reliably.
