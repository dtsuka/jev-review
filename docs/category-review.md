# Category-only review protocol

Read `.jev-review/category-handoff.json` and review only the listed files.

The upstream screening stage selected each file and one or more review categories. Treat the categories as **review requirements**, not evidence that a defect exists. You are intentionally not given scores, suspicious line ranges, or explanations.

For each file:
- Read the entire file.
- Investigate every listed category thoroughly across the whole file.
- Do not assume a problem exists.
- You may inspect imports, definitions, callers, callees, types, configuration, and other files only as necessary to understand the selected file.
- Do not broaden into an unrelated project-wide review.
- For patches/diffs, evaluate added behavior with surrounding context; removed lines are prior behavior.
- Respect test fixtures and intentional bridge error propagation.
- Report only concrete failure modes; no style-only or hypothetical findings.
- De-duplicate root causes.
- Do not read any other `.jev-review/*` file.
- Do not modify source files.

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

Create exactly one reviewedFiles entry per handoff file, copy categories exactly, include files with no findings, and do not report findings outside the requested categories.
