# Category-only deep review

The handoff file is `.jev-review/category-handoff.json`.

For each entry:
- Read the complete selected file.
- Investigate all listed categories across the whole file.
- Scores and suspicious line ranges are intentionally unavailable.
- A category means “check this carefully”, not “there is a defect”.
- Follow only dependencies or context necessary to establish a concrete finding.
- Do not turn the review into an unrelated full-repository scan.
- For patch/diff files, evaluate introduced behavior using surrounding context; removed lines describe prior behavior.
- Test fixtures, deliberate invalid inputs, and mocks are not production defects by themselves.
- Error propagation through bridge/wrapper layers can be intentional.
- Avoid style-only findings and speculative concerns without a failure mode.
- De-duplicate a root cause even if it spans categories.
- Return exact file and line locations when possible.

Write `.jev-review/category-verified-report.json`:

```json
{
  "version": 1,
  "generatedAt": "<ISO-8601>",
  "sourceHandoff": {
    "generatedAt": "<copy from category-handoff.json>",
    "sourceReportGeneratedAt": "<copy from category-handoff.json>"
  },
  "reviewedFiles": [
    {
      "file": "src/example.ts",
      "categories": ["bug", "security"],
      "findings": [
        {
          "category": "bug",
          "severity": "medium",
          "locations": [{"startLine": 1, "endLine": 2, "symbol": "example"}],
          "problem": "Concrete explanation",
          "proposedFix": "Concrete fix"
        }
      ]
    }
  ]
}
```

Create exactly one `reviewedFiles` entry per handoff file. Copy its categories exactly. Include entries with no findings. Findings should normally use one of the requested categories, but when investigation reveals a concrete root cause whose best final classification differs, report the best classification rather than forcing a misleading label.
