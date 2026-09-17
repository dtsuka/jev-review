# Attention-guided deep review protocol

This protocol treats Jev chunks as **attention hints**, not hard review boundaries.

## Prompt

Read `.jev-review/handoff.json` and perform a detailed review of every file listed there.

This is an evaluation of a Jev → Codex review pipeline. Jev has selected the files and supplied higher-priority regions, but those regions are hints only.

Rules:

- Review the **entire contents of every file listed in `handoff.json`** for concrete issues in: `bug`, `security`, `refactor`, `performance`, `error_handling`, and `type_safety`.
- Start with the listed chunks/regions as attention hints, but do not assume they contain defects.
- Do not restrict the review to the hinted line ranges. Inspect any part of a selected file needed to find or verify concrete problems.
- You may inspect imports, referenced definitions, callers, callees, types, configuration, and other project files when necessary to understand a selected file. Do not independently broaden the task into a full-project review or search unrelated files for new findings.
- Jev scores are screening signals, not evidence. Do not treat a high score as proof of a defect and do not copy Jev's classification without verifying a concrete failure mode.
- For `.patch` / `.diff` files, evaluate behavior introduced by added lines together with surrounding diff context. Removed lines represent previous behavior and must not be treated as current code.
- Test-only casts, mocks, malformed fixtures, and negative-test inputs are not production defects unless they invalidate the test itself.
- Intentionally propagated errors in bridge/wrapper code are not defects unless the layer loses errors, corrupts context, or violates its contract.
- Do not report style preferences or hypothetical concerns without a concrete failure mode.
- De-duplicate one root cause that appears through multiple hints or categories.
- Do not read `.jev-review/baseline-report.json`, `.jev-review/verified-report.json`, `.jev-review/handoff-verified-report.json`, or previous attention-review results. They are evaluation data and would bias the review.
- Do not modify project source files.

Write `.jev-review/attention-verified-report.json`:

```json
{
  "version": 1,
  "generatedAt": "<ISO-8601>",
  "sourceHandoff": {
    "generatedAt": "<copy exactly from handoff.json>",
    "sourceReportGeneratedAt": "<copy exactly from handoff.json sourceReport.generatedAt>",
    "chunkMargin": 0.1
  },
  "reviewedFiles": [
    {
      "file": "src/example.ts",
      "hints": [
        {
          "chunkIndex": 0,
          "startLine": 1,
          "endLine": 200,
          "categories": ["bug", "security"]
        }
      ],
      "findings": [
        {
          "category": "bug",
          "severity": "medium",
          "locations": [{ "startLine": 125, "endLine": 132, "symbol": "exampleFunction" }],
          "problem": "Concrete explanation",
          "proposedFix": "Concrete fix",
          "hintRelated": true
        }
      ]
    }
  ]
}
```

Requirements:

- Create exactly one `reviewedFiles` entry for every file in `handoff.json`.
- Copy all handoff chunks for that file into `hints`; derive `categories` from each chunk's category keys.
- A finding may be outside every hinted range. Set `hintRelated` to `true` only when the finding overlaps a hint or is directly discovered while following that hint's code path; otherwise set it to `false`.
- A finding must have one primary category. Do not duplicate a root cause merely to increase counts.
- Finish only after `attention-verified-report.json` has been written.

At the end print: reviewed file count, hint count, concrete finding count, and findings outside hinted regions.
