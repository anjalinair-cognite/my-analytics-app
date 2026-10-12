# My Analytics App — Flows code review

This document is the platform review for My Analytics App, conducted as part of the Cognite Flows app certification process.

## What this review covers

- **Protect the user and the customer** — no known bugs, correct SDK usage, healthy dependencies, adequate test coverage, and a clean codebase.
- **Protect Cognite services** — efficient DMS query patterns, server-side filtering, bounded pagination, and graceful rate-limit handling.
- **Protect the brand** — UI consistency with the Aura design system.

Scores are 1–5. A score of 1–2 on any criterion blocks approval. Score 3 is acceptable with tracked follow-up. Scores 4–5 are good.

## Path to approval

This review found **0 must-fix item(s)** that block approval. Round-2 nice items `cn()` and `@cognite/app-sdk` 0.10 are closed. Engineering-review coverage exclusions of production viewer files are closed: CogniteFileViewer, useViewport, and DefaultFileViewer are measured and above the gate. Five nice-to-fix items remain. Re-run is not required for `Must Fix open: 0`.

---

## Review details

### Summary
Asset 360 remains a coherent Flows app: host-synced search/selection/tab, Cognite SDK + CogniteSdkProvider, context DI, ViewModel, Aura shell, ErrorBoundary, and 429 backoff with jitter. The file viewer is split (fetch / PDF / image / text). Vitest aliases `react-pdf` so preview paths run without loading pdf.js, while production viewer files stay in the coverage denominator. Overall line coverage is 91.29% with 141 passing tests. Remaining polish: `react-pdf` majors, related `list` vs `query`, Topbar native button, `pdfWorker.ts` at 0%, overlay rotation branches.

### Reviewed commit
`cf75164feb3599d94e18f9d02a240c015b6824c1`

### Test coverage
- **Framework:** Vitest 4.1.11 (`npx vitest run --coverage`)
- **Tests run:** 141 passed, 0 failed, 0 skipped (35 files)
- **Coverage:** Statements: 89.86% | Branches: 78.9% | Functions: 93.92% | Lines: 91.29% (902/988)
- **Notable gaps:** `pdfWorker.ts` is 0% (imported only from `main.tsx` so tests never bundle the real worker). `DocumentAnnotationOverlay.tsx` ~79% lines (rotation branches). `src/__mocks__/**` is excluded as test fixtures, not production UI. Threshold `lines: 80`. Production files CogniteFileViewer 100%, useViewport 89.6%, DefaultFileViewer 100%.

### Package & security summary
- **Total packages:** 12 dependencies, 25 devDependencies
- **Health:** 8 pass, 3 warn, 1 fail (production)
- **Vulnerabilities:** 0 critical, 0 high, 0 moderate, 4 low
- Full details: see `review-packages.md`

### Scores

| Area | Criterion | Score | Notes |
| ---- | --------- | ----- | ----- |
| User & customer | 1.1 Known bugs | 5/5 | ErrorBoundary and host-connect `.catch`. Per-panel empty/error/truncation. Viewer loading/error/unsupported paths tested. |
| User & customer | 1.2 CDF via SDK | 4/5 | Industrial reads use `client.instances.*` and `datapoints.retrieve`. File bytes: SDK download config then `fetch` of the signed blob URL (`fileResolution.ts`, `useBlobUrl.ts`). |
| User & customer | 1.3 Packages | 4/5 | app-sdk 0.10.0. No high/critical/moderate CVEs. `react-pdf` still two majors behind; React 18 vs 19 is Aura-constrained. |
| User & customer | 1.4 Tests & coverage | 5/5 | 141 tests; 91.29% lines; 80% threshold; production viewer files included and covered. Remaining gaps are worker bootstrap and overlay rotation. |
| User & customer | 1.5 Dead code | 5/5 | Unused `cn()` / `clsx` / `tailwind-merge` and the unused viewer barrel are gone. No unused pages. |
| User & customer | 1.6 Patterns & testability | 5/5 | Interface services, ViewModel context DI, host-synced state. No `vi.mock` in `src/`. Viewer tests use a Vitest `react-pdf` alias, not hidden coverage exclusions. |
| Cognite services | 2.1 DMS query patterns | 4/5 | Search uses `instances.search`; identity uses retrieve + `query`. Related reverse lookups still use `instances.list` + `containsAny`. |
| Cognite services | 2.2 Server-side filter | 5/5 | Filters and projections in the request; search limit 20; related limit 100. |
| Cognite services | 2.3 Limits & pages | 5/5 | Explicit limits; truncated notice instead of prefetching extra pages. |
| Cognite services | 2.4 Call rate | 5/5 | 300ms debounce; React Query staleTime 5 min; `cdfTaskRunner` on search, identity, related, datapoints, and annotation query. |
| Cognite services | 2.5 429 backoff | 5/5 | `withThrottleRetry`: bounded attempts, full jitter, `Retry-After`. QueryClient does not double-retry 429s. |
| Brand | 3.1 Aura | 4/5 | Aura combobox, tabs, DataGrid, empty, skeleton, badge, button, chart, Topbar. Isolated custom: identity `<dl>`; Topbar native `<button>`; viewer fallback hex. |

### Must fix before deploy

_None._

### Should fix before deploy

_None._

### Nice to fix before deploy
- [ ] Plan `react-pdf` 9 → 11 once the viewer supports it — `package.json` — 1.3
- [ ] Prefer `instances.query` for related reverse lookups instead of `instances.list` — `src/services/cdmRelatedService.ts:99` — 2.1
- [ ] Use an Aura Button (or documented BreadcrumbLink pattern) instead of a raw `<button>` in the Topbar — `src/shell/AppShell.tsx:43` — 3.1
- [ ] Cover or further isolate `pdfWorker.ts` (0% lines; must not import real pdf.js in tests) — `src/cognite-file-viewer/pdfWorker.ts:5` — 1.4
- [ ] Add overlay tests for 90/180/270 rotation branches — `src/cognite-file-viewer/DocumentAnnotationOverlay.tsx:74` — 1.4

## Summary

- Must Fix open: 0
- Should Fix open: 0
- Nice Fix open: 5
