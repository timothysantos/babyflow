# BabyFlow Codex Workflow Prompt

Use this prompt to merge the BabyFlow AI coding workflow into a new project or to re-establish it in an existing one.

---

## Prompt

You are working inside an AI-assisted codebase that uses a slice-based delivery process.

Merge the following workflow into the project’s AI coding process and follow it for all future implementation work:

1. Build domain-first.
- Model the business behavior in types and domain services before UI.
- Keep events, sessions, interventions, transitions, corrections, review layers, and projections distinct when they represent different semantics.

2. Treat projections as first-class.
- The same underlying reality may need multiple views:
  - operational view
  - summary view
  - review view
  - compact view
  - paper-compatible or audit-compatible view
- Keep those projections synchronized and test them together.

3. Keep route orchestration thin.
- Page components should coordinate, not contain the whole system.
- Extract helpers/services when pages become large or hold too many responsibilities.

4. Use runtime proof for user-facing behavior.
- Prefer real browser or real local Worker verification over source inspection.
- Use unit tests for domain logic.
- Use E2E tests for visible user flows.
- When behavior matters, verify what the user actually sees and can do.

5. Build in slices.
- Each slice should represent one meaningful architectural step.
- Define:
  - what is in scope
  - what is not in scope
  - what proof is required to call it complete
- Keep slices small enough to verify but large enough to be meaningful.

6. Make continuity an invariant.
- Preserve state across rerender, route change, correction, and review where required.
- Do not treat continuity as polish. It is part of the architecture.

7. Treat corrections and review as serious system behavior.
- Support update, delete, merge, restore, undo, and reason capture where relevant.
- Maintain correction history.
- Ensure corrections propagate consistently across all projections.

8. Be honest in audits.
- For each slice, write an audit verdict.
- Explicitly state:
  - what was proven
  - what remains incomplete
  - what future slices must handle
- Do not overclaim completion.

9. Prefer user-friendly language in the visible UI.
- Avoid internal jargon in visible copy.
- Use operational language for the main surface.
- Put deeper interpretation in a dedicated review surface.

10. Keep tests aligned with architecture.
- Add tests for:
  - runtime behavior
  - projection consistency
  - correction parity
  - mobile usability
  - manual/local runtime behavior
- Add tests when a new slice introduces a new invariant.

Execution style:
- Implement the slice end-to-end.
- Update docs and audits together with code.
- Run verification.
- Commit in small logical batches.
- Keep the worktree clean when done.

---

## Repository Rules To Add

Add these rules to the project’s AI workflow documentation or agent instructions:

### Slice Rule
Each slice must prove one meaningful architectural step end-to-end.

### Parity Rule
If multiple surfaces represent the same domain reality, corrections and state must stay synchronized across them.

### Runtime Rule
If a user experiences it, verify it in the runtime, not only in source.

### Audit Rule
Never mark a slice complete unless the slice contract is proven by tests and runtime behavior.

### Orchestration Rule
Keep route/page orchestration thin. Extract services and view-models when a page begins to accumulate multiple responsibilities.

---

## How To Use This Prompt

1. Paste the prompt into the target project’s AI workflow instructions.
2. Merge it into the agent or repository rules that govern coding work.
3. Use slice-based implementation for new features.
4. Require every slice to end with:
   - code
   - tests
   - docs
   - audit verdict
5. Re-run the audit whenever a new semantic layer is added.

---

## Post-Slice Audit Checklist

After each slice, the audit must answer all of the following:

1. Did the implementation match the slice contract?
- State clearly whether the intended slice goal is complete, partial, or not met.

2. Was the runtime behavior verified?
- Confirm whether the user-visible behavior was checked in the real runtime, not only in source or mocks.

3. Are the projections consistent?
- Verify whether all visible surfaces that represent the same reality stay synchronized.

4. Are corrections or review behaviors consistent?
- If the slice introduces edits, deletes, merges, restores, or review flows, confirm they work across every relevant surface.

5. Were the tests added or updated?
- List the test files that prove the slice behavior.
- Call out any missing coverage as a weakness.

6. Were docs updated?
- Confirm whether user docs, in-app help, repo rules, or slice audits were updated.

7. What remains incomplete?
- State the exact remaining gap, not just a general risk.

8. What should the next slice not take on?
- Preserve slice boundaries so future work does not blur into the current slice.

9. Is there any orchestration pressure?
- Call out large routes, monolithic pages, or growing coordination layers that should be extracted later.

10. Is the final verdict honest?
- Mark the slice complete only if the contract is proven.
- Otherwise mark it incomplete and explain why.
