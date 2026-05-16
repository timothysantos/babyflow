# Slice 2 Audit Report

Verdict: COMPLETE

## Blocking Gaps

- None.

## Required Files

| File | Status | Notes |
|---|---|---|
| `src/domain/baby/baby.types.ts` | EXISTS | Domain types, validation, and age-week calculation exist. |
| `src/infrastructure/db/schema/babies.ts` | EXISTS | Baby row schema exists. |
| `src/infrastructure/repositories/baby-repository.ts` | WIRED | Create/list/select repository is wired to in-memory storage. |
| `src/infrastructure/mappers/baby-mapper.ts` | WIRED | Repository rows map to `BabyDTO`. |
| `src/infrastructure/api/routes/babies.ts` | WIRED | `/babies` route handles create/list/select. |
| `src/client/routes/BabySelectPage.tsx` | WIRED | Page mounts baby create/select UI and locale preview. |
| `src/client/components/baby/BabyForm.tsx` | WIRED | Baby form is mounted in the page flow. |
| `src/client/components/i18n/LanguageToggle.tsx` | VERIFIED | Button-based toggle changes locale state in tests. |
| `src/client/query/use-babies.ts` | EXISTS | Query hook exists. |
| `src/client/router.tsx` | WIRED | Root route mounts `BabySelectPage`. |
| `docs/audits/slice-2-audit.md` | EXISTS | Downloadable audit artifact exists. |

## Acceptance Criteria

| Criterion | Status | Proof |
|---|---|---|
| User can create a baby. | VERIFIED | `tests/baby-select-page.test.tsx` passed and `tests/babies-route.test.tsx` passed. |
| User can select a baby. | VERIFIED | `tests/baby-select-page.test.tsx` passed and exercised `Select first baby`. |
| Age week is calculated from birthDate. | VERIFIED | `tests/baby-domain.test.tsx` passed. |
| Language can be English, Chinese, or bilingual. | VERIFIED | `tests/bilingual-render.test.tsx` passed and `tests/baby-select-page.test.tsx` switched the page to bilingual. |
| Bilingual mode renders journal labels with English and Chinese. | VERIFIED | `tests/bilingual-render.test.tsx` and `tests/baby-select-page.test.tsx` passed with bilingual label output. |

## Audit Checklist

| Item | Status | Proof |
|---|---|---|
| No domain logic in React components | REVIEWED | Manual source review of `BabySelectPage.tsx`, `BabyForm.tsx`, and `LanguageToggle.tsx` found UI-only logic and delegated domain helpers. |
| API returns BabyDTO only | VERIFIED | `tests/babies-route.test.tsx` passed and asserted `selectedAt` was absent from the response. |
| Locale toggle is wired into the page | WIRED | `src/client/routes/BabySelectPage.tsx` mounts `LanguageToggle`. |
| Bilingual preview renders on the page | VERIFIED | `tests/baby-select-page.test.tsx` passed and asserted bilingual label text. |
| Tests pass | VERIFIED | `npm test`, Playwright smoke test, and `npm run build` passed under Node 22. |

## Tests Run

| Command | Result |
|---|---|
| `npm test` | PASS |
| `node node_modules/@playwright/test/cli.js test --config=playwright.config.ts tests/e2e/boot.spec.ts` | PASS |
| `npm run build` | PASS |

## Final Notes

- Slice 2 was validated under Node 22 via `nvm use 22`.
- The browser smoke test still verifies the dark boot canvas and root page render.
- D1 is not exercised with a real local database in this slice; the proof remains a mock-env worker test for the slice-1 worker boundary.
- Slice commits:
  - [`<pending>`](https://github.com/timothysantos/babyflow/commit/<pending>) `feat: implement slice 2 baby profiles and locale`
