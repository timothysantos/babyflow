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
