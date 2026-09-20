# Category-only deep review

For each file in `.jev-review/category-handoff.json`:

- Read the complete selected file.
- Investigate all listed categories across the file.
- Scores and suspicious line ranges are intentionally unavailable.
- A listed category means “check this carefully”, not “there is a defect”.
- Follow only dependencies or context necessary to establish a concrete finding.
- Do not turn the review into an unrelated full-repository scan.
- For patch/diff files, added lines describe introduced behavior; removed lines describe previous behavior.
- Test fixtures, deliberate invalid inputs, and mocks are not production defects by themselves.
- Error propagation through bridge/wrapper layers can be intentional.
- Avoid style-only findings and speculative concerns without a failure mode.
- De-duplicate a root cause even if it spans categories.
- Return exact file and line locations when possible.
