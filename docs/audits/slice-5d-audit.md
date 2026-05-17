# Slice 5D Audit: Correction, Update, Delete, Undo

Verdict: INCOMPLETE

## Blocking Gaps

- `PaperJournalCellEditSheet` and `CompactBlockDetailSheet` now exist and support update + restore, but delete and merge actions are still timeline-only.
- Soft-delete restore now exists for sheet edits, but not for full cross-surface delete/merge flows.
- Duplicate-merge still exists only for the timeline stream and is not yet surfaced on paper-journal/compact cells.

## Required Files

| File | Status | Notes |
|---|---|---|
| `src/domain/correction/correction-history.types.ts` | EXISTS | `CorrectionHistoryDTO` is now checked into the repo. |
| `src/client/components/timeline/CorrectionHistoryPanel.tsx` | WIRED | Correction history is visible in Timeline View. |
| `src/client/components/timeline/TimelineDetailSheet.tsx` | WIRED | Timeline edit/delete/merge/undo actions exist. |
| `src/client/components/timeline/PaperJournalCellEditSheet.tsx` | WIRED | Journal cell edit and restore surface exists. |
| `src/client/components/timeline/CompactBlockDetailSheet.tsx` | WIRED | Compact block edit and restore surface exists. |
| `src/client/routes/TodayPage.tsx` | WIRED | Timeline, Journal, and Compact correction flow is wired into Today and persists correction history in the UI. |
| `docs/audits/slice-5d-audit.md` | EXISTS | Downloadable audit artifact exists. |

## Acceptance Criteria

| Criterion | Status | Proof |
|---|---|---|
| Wrong event time can be corrected. | VERIFIED | `tests/today-page.test.tsx` passed with sheet-driven update coverage. |
| Soft delete removes event from normal views but preserves correction history. | VERIFIED | `tests/e2e/today-mobile.spec.ts` and `tests/today-page.test.tsx` passed; correction history shows `correction.soft_delete`. |
| Undo last fresh action works. | VERIFIED | `tests/today-page.test.tsx` passed and restored the prior value for both timeline and sheet-driven edits. |
| Duplicate event can be merged/deleted/kept. | INCOMPLETE | `TimelineDetailSheet` still owns merge/delete; Journal and Compact do not yet expose those actions. |
| Correction history is test-covered. | VERIFIED | `tests/today-page.test.tsx` and `tests/e2e/today-mobile.spec.ts` passed and assert visible correction history entries. |

## Audit Checklist

| Item | Status | Proof |
|---|---|---|
| Correction history is visible in the app | VERIFIED | `CorrectionHistoryPanel` is rendered in Timeline View and is covered by tests. |
| Update/delete/undo are visible behaviors, not just data mutations | PARTIALLY VERIFIED | Timeline actions are verified; Journal and Compact update + restore are verified; delete and merge remain timeline-only. |
| Timeline corrections keep the live stream and detail sheet in sync | VERIFIED | The selected timeline item now refreshes after edit/delete actions. |
| Journal cell edit and compact block edit exist and are tested | VERIFIED | `PaperJournalCellEditSheet` and `CompactBlockDetailSheet` both render and update the shared row projection in `tests/today-page.test.tsx`. |
| Journal and Compact delete/merge actions exist | INCOMPLETE | Those actions are still missing from the first-class sheet surfaces. |

## Tests Run

| Command | Result |
|---|---|
| `npm test` | PASS |
| `node node_modules/@playwright/test/cli.js test --config=playwright.config.ts tests/e2e/boot.spec.ts tests/e2e/today-mobile.spec.ts` | PASS |
| `npm run build` | PASS |

## Final Notes

- Slice 5D is now partially implemented as a visible correction surface across Timeline, Journal, and Compact.
- The current implementation covers timeline corrections, undo, soft delete, merge, and history logging on Timeline plus update/restore for Journal and Compact sheets.
- The remaining v8a work for this slice is to add first-class delete/merge actions to Journal and Compact and prove those flows remain synchronized with Timeline.
- v8a scope clarification: correction behavior must stay synchronized across Timeline, Journal, and Compact. This audit proves update/restore cross-surface consistency only.
- Recommended tests still to implement for Slice 5D: Journal delete/merge propagation, Compact delete/merge propagation, soft-delete restore across all surfaces, and cross-surface consistency after delete/merge.
- Slice commits:
  - [`39345fa`](https://github.com/timothysantos/babyflow/commit/39345fa) `feat: add v8a timeline stream and correction scaffold`
