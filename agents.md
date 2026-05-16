# Agents

This repository is built from the canonical BabyFlow spec. The spec is the source of truth for product boundaries, architecture, and slice ordering.

## Canonical References

- Base spec: `/Users/tim/Downloads/babyflow-canonical-master-spec-v7-full.md`
- Checked-in copy: `docs/spec/babyflow-canonical-master-spec-v7-full.md`

## Architecture Rules

1. Timeline capture and decision support are inseparable, but timeline capture comes first.
2. Domain logic stays out of React.
3. UI consumes DTOs and view models, not database rows.
4. Evidence-based interpretation must preserve uncertainty.
5. No fake medical certainty in UI copy or domain labels.
6. Slice order is canonical unless the spec is explicitly updated.

## Slice Execution Rules

1. Each slice must ship with domain, API, UI, and tests as applicable.
2. Keep files small and bounded.
3. Prefer deterministic domain rules with explicit confidence where uncertainty exists.
4. Run audit checks before moving on to the next slice.
5. Commit in small batches so each slice is independently reviewable.
6. After every slice, provide an audit report and list the commits made for that slice.
7. Before declaring a slice complete, re-check its spec requirements line by line and call out any remaining risk explicitly.
8. Preserve the canonical spec as the base reference for all future slices unless the spec itself changes.
9. After every slice commit, push the commit(s) to `origin` before moving on.
10. Every audit report must include a Markdown version that can be copied into docs or issue comments.
11. Never use the word `complete` unless the slice completion gate passes with every required file, criterion, checklist item, and test proven.
12. Slice completion requires adversarial verification, not intent or partial wiring.
13. Every slice must also produce a downloadable Markdown audit artifact in the repo, under `docs/audits/`, using a filename that matches the slice being audited.
14. The audit report, including the downloadable Markdown artifact, must include GitHub links for every commit created in that slice.
15. Optimize audits for preventing false-positive slice completion, not optimistic reporting.
16. Every audit item must use one of: `EXISTS`, `WIRED`, `REVIEWED`, or `VERIFIED`.
17. `EXISTS` only means the file/component/function exists.
18. `WIRED` only means the item is connected into runtime flow.
19. `REVIEWED` only means a human manually inspected source and confirmed the shape or wiring.
20. `VERIFIED` only means runtime behavior is proven with a passing test, DOM assertion, browser validation, command output, API response, screenshot proof, or rendered behavior verification.
21. Do not treat `EXISTS` or `WIRED` as `VERIFIED`.
22. Source inspection alone is insufficient for behavior verification.
23. For UI acceptance criteria involving flashes, layout, themes, rendering, responsiveness, hydration, or transitions, browser-level verification is mandatory.
24. Use measurable proof wording in audits. Avoid subjective phrases like "small", "looks correct", or "appears mounted".
25. Prefer runtime proof, test output, DOM assertions, API responses, browser validation, screenshot proof, or rendered-behavior verification over source inspection whenever behavior is being audited.
26. Reserve `VERIFIED` for repeatable runtime proof; use `REVIEWED` or `SOURCE VERIFIED` for source-only checks.
27. Manual browser inspection is not enough for `VERIFIED` when a repeatable Playwright smoke test is feasible.
28. D1 proof must state `mock-env worker test` unless real local D1 was actually exercised.
29. If a behavior previously caused a false-positive completion, future slices must use stronger proof than before for that behavior.
30. Repository and persistence tests must use an isolated local data directory per test worker or explicit reset between tests.
31. Client components must not import Node-only persistence modules; browser bundles should call route-level APIs or use local UI state instead.
32. If a slice uses transitional infrastructure such as in-memory storage, file-backed storage, or mocks, the audit must explicitly state what is verified, what is not verified, and what future infrastructure is expected.
33. Do not treat placeholder UI, mounted components, or static mode toggles as fully implemented interaction behavior. Audits must explicitly distinguish `SCAFFOLDED`, `PARTIALLY IMPLEMENTED`, and `BEHAVIORALLY VERIFIED` states where relevant.
34. For interaction-heavy slices, audits must verify persistence of user interaction state when it matters. Examples include expanded rows surviving rerender, locale surviving rerender, sticky controls remaining reachable during scroll, and overlays preserving draft state.
35. For mobile-first slices, critical touch ergonomics must be runtime-verified whenever feasible. Examples include touch-target size, sticky control visibility, viewport overflow behavior, interaction persistence during scroll, and safe-area handling. Source review alone is insufficient for mobile UX guarantees when browser measurement is feasible.
36. For route-heavy slices, audits must verify route continuity when it is part of the user flow. Examples include navigating away and back while preserving interaction state, route-scoped layout continuity, and persistence across route transitions.
37. For event-driven slices, audits must verify event continuity when user actions are recorded asynchronously. Examples include freshly recorded events surviving delayed GETs, rerenders not erasing recent events, deterministic ordering, and route/API/UI synchronization. Rendering the event list alone is not sufficient proof of event-system reliability.
38. For event-driven slices, audits must verify deterministic ordering across layers when it matters. Examples include repository newest-first ordering, API serialization order, and UI render order after fetch. Ordering in one layer alone is not enough if the user-visible flow depends on multiple layers.

## Implementation Sequence

1. Slice 1: Cloudflare React Worker Shell
2. Slice 2: Baby Profiles + Locale
3. Slice 3: Paper Journal Today UI
4. Slice 4+: follow the canonical spec order

## Slice 1 Guardrails

- `App.tsx` must remain shell-only.
- `/health` must be available in local dev and worker runtime.
- Providers must be created exactly once at the app root.
- D1 access must be reachable through an infrastructure client, not from components.
- Slice 1 must end with a passed audit report and a commit list.
- Slice 1 must be re-verified against the spec before moving to slice 2.
- Slice 1 must also be pushed to `origin` before the slice is considered complete.
- Slice audit output must include both a concise summary and a Markdown-formatted report.
- Slice 1 must satisfy the slice completion gate in `/Users/tim/Downloads/agents-md-slice-completion-gate.md`.
- Slice 1 must include `src/client/router.tsx` and prove the router is mounted and tested.
- Slice 1 must emit `docs/audits/slice-1-audit.md` as the downloadable Markdown report artifact.
- Slice 1 audit artifacts must include GitHub links for the slice commits.
- Slice 1 audits must distinguish `EXISTS`, `WIRED`, and `VERIFIED` explicitly.
- Slice 1 audits must distinguish `EXISTS`, `WIRED`, `REVIEWED`, and `VERIFIED` explicitly.
- Slice 1 audits must use measurable proof wording, not subjective descriptions.
- Slice 1 audits must use `REVIEWED` or `SOURCE VERIFIED` for source-only checks, and `VERIFIED` only for repeatable runtime proof.
- Slice 1 audits must name D1 proof accurately as `mock-env worker test` unless local D1 is truly exercised.
- Slice 1 audit practices must escalate proof strength for any behavior that previously caused a false-positive.
- Slice 2 and later tests must isolate repository state per worker or reset it explicitly before assertions.
- Transitional infrastructure must never silently become the canonical architecture in an audit.
- Scaffolded UI must never be reported as fully implemented interaction behavior without a runtime proof of the interaction itself.
