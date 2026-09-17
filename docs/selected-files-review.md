# Blind selected-file review protocol

Read `.jev-review/selected-files.json` and review **only the files listed in its `files` array**.

This is a blind evaluation. The file list was selected by an upstream screening stage, but you must not inspect or infer that stage's scores, categories, chunks, thresholds, or reasons for selection.

Rules:

- Review the entire contents of every listed file for concrete issues in: `bug`, `security`, `refactor`, `performance`, `error_handling`, and `type_safety`.
- You may inspect imports, referenced definitions, callers, callees, types, configuration, and other project files only when necessary to understand a listed file. Do not independently broaden the task into a full-project review or report new findings whose root cause is solely in an unlisted file.
- For `.patch` / `.diff` files, evaluate behavior introduced by added lines together with surrounding diff context. Removed lines represent previous behavior and must not be treated as current code.
- Test-only casts, mocks, malformed fixtures, and negative-test inputs are not production defects unless they invalidate the test itself.
- Intentionally propagated errors in bridge/wrapper code are not defects unless the layer loses errors, corrupts context, or violates its contract.
- Do not report style preferences or hypothetical concerns without a concrete failure mode.
- De-duplicate one root cause that appears through multiple categories or call paths. Give it one primary category.
- Do not read any other `.jev-review/*` file, including `report.json`, `handoff.json`, baseline reports, verified reports, attention reports, evaluations, or archived runs. Only `selected-files.json` is allowed from `.jev-review/`.
- Do not modify project source files.

Write the result to `.jev-review/selected-files-verified-report.json` using this structure:

```json
{
  "version": 1,
  "generatedAt": "<ISO-8601>",
  "sourceManifest": {
    "generatedAt": "<copy exactly from selected-files.json>",
    "sourceReportGeneratedAt": "<copy exactly from selected-files.json>"
  },
  "reviewedFiles": [
    {
      "file": "src/example.ts",
      "findings": [
        {
          "category": "bug",
          "severity": "medium",
          "locations": [{ "startLine": 125, "endLine": 132, "symbol": "exampleFunction" }],
          "problem": "Concrete explanation",
          "proposedFix": "Concrete fix"
        }
      ]
    }
  ]
}
```

Requirements:

- Create exactly one `reviewedFiles` entry for every file in `selected-files.json`, including files with no findings.
- Do not include unlisted files in `reviewedFiles`.
- Finish only after the JSON file has been written.
- At the end print the reviewed file count and concrete finding count.

For repeated stability trials, preserve each completed result before starting the next run, for example as `selected-files-verified-report-1.json`, `-2.json`, and `-3.json`. Each trial must start fresh and must not read prior trial outputs.
