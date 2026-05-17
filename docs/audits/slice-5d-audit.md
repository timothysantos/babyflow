# Slice 5D Audit: Correction, Update, Delete, Undo

Verdict: INCOMPLETE

## Blocking Gaps

- Timeline edit now uses a first-class sheet, but the correction flow still lacks richer correction-reason capture and suggested-correction affordances that the v8a UX direction calls for.
- The slice now proves delete/merge/restore/update parity across Timeline, Journal, Compact, and Correction History, but the correction surface is still intentionally narrow rather than fully opinionated.

## Required Files

| File | Status | Notes |
|---|---|---|
| `src/domain/correction/correction-history.types.ts` | EXISTS | `CorrectionHistoryDTO` is now checked into the repo. |
| `src/client/components/timeline/CorrectionHistoryPanel.tsx` | WIRED | Correction history is visible in Timeline View. |
| `src/client/components/timeline/TimelineDetailSheet.tsx` | WIRED | Timeline edit/delete/merge/undo actions exist. |
| `src/client/components/timeline/PaperJournalCellEditSheet.tsx` | WIRED | Journal cell edit, delete, merge, and restore surface exists. |
| `src/client/components/timeline/CompactBlockDetailSheet.tsx` | WIRED | Compact block edit, delete, merge, and restore surface exists. |
| `src/client/routes/TodayPage.tsx` | WIRED | Timeline, Journal, Compact, and correction-history flows are wired into Today and persist correction history in the UI. |
| `docs/audits/slice-5d-audit.md` | EXISTS | Downloadable audit artifact exists. |

## Acceptance Criteria

| Criterion | Status | Proof |
|---|---|---|
| Wrong event time can be corrected. | VERIFIED | `tests/today-page.test.tsx` and `tests/correction-cross-surface-update.test.tsx` passed with sheet-driven update coverage. |
| Soft delete removes event from normal views but preserves correction history. | VERIFIED | `tests/correction-cross-surface-delete.test.tsx` passed and correction history shows `correction.soft_delete` and `correction.restore`. |
| Undo last fresh action works. | VERIFIED | `tests/today-page.test.tsx` passed and restored the prior value for both timeline and sheet-driven edits. |
| Duplicate event can be merged/deleted/kept. | VERIFIED | `tests/correction-cross-surface-merge.test.tsx` passed and merge parity is now covered across timeline, journal, and compact projections. |
| Correction history is test-covered. | VERIFIED | `tests/today-page.test.tsx`, `tests/correction-cross-surface-delete.test.tsx`, `tests/correction-cross-surface-merge.test.tsx`, and `tests/correction-cross-surface-restore.test.tsx` passed and assert visible correction history entries. |

## Audit Checklist

| Item | Status | Proof |
|---|---|---|
| Correction history is visible in the app | VERIFIED | `CorrectionHistoryPanel` is rendered in Timeline View and is covered by tests. |
| Update/delete/undo are visible behaviors, not just data mutations | VERIFIED | Timeline, Journal, and Compact are all covered by cross-surface update/delete/merge/restore tests and the correction history panel now exposes restore actions. |
| Timeline corrections keep the live stream and detail sheet in sync | VERIFIED | The selected timeline item now refreshes after edit/delete actions. |
| Journal cell edit and compact block edit exist and are tested | VERIFIED | `PaperJournalCellEditSheet` and `CompactBlockDetailSheet` both render and update the shared row projection in `tests/today-page.test.tsx`. |
| Journal and Compact delete/merge actions exist | VERIFIED | `PaperJournalCellEditSheet` and `CompactBlockDetailSheet` both expose delete, merge, restore, and update actions. |

## Tests Run

| Command | Result |
|---|---|
| `npm test` | PASS |
| `node node_modules/@playwright/test/cli.js test --config=playwright.config.ts tests/e2e/boot.spec.ts tests/e2e/today-mobile.spec.ts` | PASS |
| `npm run build` | PASS |

## Final Notes

- Slice 5D now covers cross-surface correction parity for delete, merge, update, restore, and correction history exposure across Timeline, Journal, and Compact.
- The remaining v8a work for this slice is richer correction UX: correction reason capture and suggested-correction affordances are still future work, even though the Timeline edit path is now first-class.
- v8a scope clarification: correction behavior must stay synchronized across Timeline, Journal, Compact, and Correction History. This audit now proves update/delete/merge/restore parity across all visible projections.
- Recommended next tests to implement after Slice 5D: add reason-capture and suggested-correction flows, then re-audit those flows under the same projection consistency rules.
- Slice commits:
  - [`39345fa`](https://github.com/timothysantos/babyflow/commit/39345fa) `feat: add v8a timeline stream and correction scaffold`
