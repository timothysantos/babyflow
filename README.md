# BabyFlow

Canonical workspace for the BabyFlow product spec and implementation.

## Reference spec

The current canonical product doctrine lives in [`docs/spec/babyflow-canonical-master-spec-v8a-full.md`](/Users/tim/22m/ai-projects/babyflow/docs/spec/babyflow-canonical-master-spec-v8a-full.md).

The previous v8 paper-journal parity spec remains available at [`docs/spec/babyflow-canonical-master-spec-v8-full.md`](/Users/tim/22m/ai-projects/babyflow/docs/spec/babyflow-canonical-master-spec-v8-full.md).

The current UI design language lives in [`docs/spec/ui-design-language-2026.md`](/Users/tim/22m/ai-projects/babyflow/docs/spec/ui-design-language-2026.md).

The live user guide lives in [`docs/user-guide.md`](/Users/tim/22m/ai-projects/babyflow/docs/user-guide.md).

Slice audits live under [`docs/audits/`](/Users/tim/22m/ai-projects/babyflow/docs/audits) and are updated after each slice with the proof-level report used to verify the implementation.

Current slice trail:

- Slice 1: shell, routing, providers
- Slice 2: baby profiles and locale
- Slice 3: paper journal Today UI
- Slice 4: cycle events foundation
- Slice 5: feed sessions and feed segments
- Slice 5B: paper journal view parity
- Slice 5C: real timeline stream
- Slice 5D: correction, update, delete, undo

## Local run modes

- Manual user runtime: `npm run dev`
  - UI: `http://localhost:5173`
  - Worker/API: `http://127.0.0.1:8787`
  - Uses the normal local DB
- Isolated test runtime: `npm run dev:test`
  - UI: `http://localhost:5174`
  - Worker/API: `http://127.0.0.1:8788`
  - Uses the separate test DB defined in [`wrangler.test.jsonc`](/Users/tim/22m/ai-projects/babyflow/wrangler.test.jsonc)
- Worker smoke check against the test DB: `npm run test:worker-runtime`
- Playwright against the isolated test runtime: `npm run test:playwright`
- Wipe the manual local DB: `npm run db:wipe:local`
- Wipe the isolated test DB: `npm run db:wipe:test`
