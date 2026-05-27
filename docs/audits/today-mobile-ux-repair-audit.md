# Today Mobile UX Repair Audit

Date: 2026-05-27

## Verdict

The Today UX repair passes the requested audit list.

This pass is scoped to the current Today screen layout, mobile density, top navigation, active feed timer fit, and sticky action dock behavior.

## Audit Items

| Concern | Status | Proof |
|---|---|---|
| Timeline / Journal / Review stay in one row on mobile | VERIFIED | `tests/e2e/today-mobile.spec.ts` measures the three controls at 390px and verifies their `y` positions match within 1px. |
| Three-dot overflow shares the top Today header row | VERIFIED | `tests/e2e/today-mobile.spec.ts` measures the overflow control at 390px and verifies it is horizontally aligned with the `Today / 今天` heading. |
| Secondary modes are hidden behind overflow | VERIFIED | `tests/e2e/today-mobile.spec.ts` opens the overflow menu and verifies `Compact / 简洁` is reachable from the menu instead of the main tab row. |
| Mobile layout reduces excess top and section padding | VERIFIED | `npm run test:playwright -- tests/e2e/today-mobile.spec.ts` verifies the updated 390px layout, sticky dock, and tab row after the spacing reduction in `src/client/global.css`. |
| Timeline and Now share the mobile workbench instead of becoming long stacked panels | VERIFIED | `src/client/routes/TodayPage.tsx` separates the active feed slot, timeline column, and now column; `tests/e2e/today-mobile.spec.ts` verifies `today-log-preview` and `today-now-panel` are both visible in the mobile layout. |
| Active feed stopwatch fits on mobile | VERIFIED | `tests/e2e/today-mobile.spec.ts` starts `Left feed` at 390px, measures `active-feed-card`, `active-feed-elapsed`, and `active-feed-current-segment`, and verifies they remain inside the card and viewport. |
| Sticky dock stays pinned to the bottom | VERIFIED | `tests/e2e/today-mobile.spec.ts` measures the dock before and after scrolling and verifies `dock.y + dock.height` equals the 844px viewport bottom within 1px. |
| Sticky dock keeps full-width mobile shape and top-only rounding | VERIFIED | `tests/e2e/today-mobile.spec.ts` verifies dock width is at least 388px at a 390px viewport, x starts at the left edge, top radii are non-zero, and bottom radii are zero. |
| Overall typography avoids oversized mobile display type | REVIEWED | `src/client/global.css` removes viewport-scaled `clamp()` sizing from the Today title and active feed stopwatch and uses fixed mobile sizes under the 767px breakpoint. |

## Verification Commands

```sh
npm test -- tests/today-page.test.tsx tests/feed-active-timer.test.tsx
npm run build
npm run test:playwright -- tests/e2e/today-mobile.spec.ts
npm test
npm run test:playwright
```

All listed commands passed.
