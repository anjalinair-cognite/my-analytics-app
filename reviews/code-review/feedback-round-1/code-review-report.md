# My Analytics App — Flows code review

This document is the platform review for My Analytics App, conducted as part of the Cognite Flows app certification process.

## What this review covers

- **Protect the user and the customer** — no known bugs, correct SDK usage, healthy dependencies, adequate test coverage, and a clean codebase.
- **Protect Cognite services** — efficient DMS query patterns, server-side filtering, bounded pagination, and graceful rate-limit handling.
- **Protect the brand** — UI consistency with the Aura design system.

Scores are 1–5. A score of 1–2 on any criterion blocks approval. Score 3 is acceptable with tracked follow-up. Scores 4–5 are good.

## Path to approval

This review found **0 must-fix item(s)** that block approval. Nine should-fix items (coverage scope, 429 handling, ErrorBoundary, Vitest advisory) and five nice-to-fix items remain; none score 1–2. Once the should-fix items are addressed, re-run `flows-code-review` if you want a clean follow-up round; it is not required to proceed to `flows-design-review`.

---

## Review details

### Summary
Asset 360 is a coherent Flows app: host-synced search/selection/tab, Cognite SDK + `CogniteSdkProvider`, interface-based services injected through `Asset360ViewModelContext`, and Aura combobox/tabs/DataGrid/empty/skeleton usage. Industrial reads go through `instances.search` / `retrieve` / `query` / `list` with explicit limits and a 15-slot `cdfTaskRunner`. No criterion scores 1–2. Remaining risk is operational rather than broken: no ErrorBoundary, `connectToHostApp` has no rejection handler, related lists stop at 100 without a cursor, there is no 429 backoff, and coverage tooling omits the vendored file viewer so the 84% line figure is not full-`src/` scope.

### Reviewed commit
`83d6f2f2f7eb5360016d9b5c3e2e3e8854ad39d9` (HEAD) plus the uncommitted Asset 360 working tree reviewed in this round.

### Test coverage
- **Framework:** Vitest 4.1.10 (`npx vitest run --coverage`)
- **Tests run:** 65 passed, 0 failed, 0 skipped (18 files)
- **Coverage:** Statements: 84.42% | Branches: 73.85% | Functions: 85.78% | Lines: 84.38% (400/474)
- **Notable gaps:** `src/cognite-file-viewer/**` is in `test.exclude` and is never imported in tests (`DefaultFileViewer` is `vi.mock`ed), so those production files are absent from the coverage table. `TimeSeriesPanel.tsx` 54.54% lines; `cdm/parse.ts` 65.78%; `shared/utils/semaphore.ts` 76.92%; `services/response.ts` 70%; no dedicated tests for `semaphore.ts`, `response.ts`, or `hooks/use-theme-mode.ts`. `vitest.config.ts` has no `coverage.include` of all `src/` and `coverage.all` is not enabled.

### Package & security summary
- **Total packages:** 13 dependencies, 25 devDependencies
- **Health:** 9 pass, 3 warn, 1 fail (production); vitest stack Warn (moderate CVE)
- **Vulnerabilities:** 0 critical, 0 high, 4 moderate, 4 low
- Full details: see `review-packages.md`

### Scores

| Area | Criterion | Score | Notes |
| ---- | --------- | ----- | ----- |
| User & customer | 1.1 Known bugs | 4/5 | Core search → identity → related tabs work; per-panel empty/error exist. No ErrorBoundary; `connectToHostApp().then` has no `.catch` so host-connect failures stay as an unhandled rejection (`src/App.tsx:61`). |
| User & customer | 1.2 CDF via SDK | 4/5 | Asset 360 services use `client.instances.*` and `client.datapoints.retrieve`. File viewer uses SDK `client.post` to `/files/downloadlink` and `client.documents.preview`; browser `fetch` is only against the signed download URL (`fileResolution.ts:46`, `CogniteFileViewer.tsx:53`). |
| User & customer | 1.3 Packages | 3/5 | No high/critical CVEs. Moderate Vitest GHSA-82fw-gwwq-j7x9 patched in 4.1.11. `react-pdf` is two majors behind (Fail health). React 18 vs 19 and react-table 8 vs 9 are one-major lags. |
| User & customer | 1.4 Tests & coverage | 3/5 | Tooling works; 65 tests; measured lines 84.38% but not full `src/` (file viewer excluded from measurement). Gaps in TimeSeriesPanel, parse, semaphore, response; missing tests for three non-trivial modules. |
| User & customer | 1.5 Dead code | 4/5 | No unused pages. Unused `cn()` in `src/lib/utils.ts` (and thus `clsx` / `tailwind-merge` only serve that helper). Vendored file viewer is used via `DefaultFileViewer`. |
| User & customer | 1.6 Patterns & testability | 4/5 | Interface services + ViewModel context DI; host state in `AppStateProvider`. One `vi.mock` of `DefaultFileViewer` with no justification comment (`App.test.tsx:19`). ViewModel does not hold `useState`. |
| Cognite services | 2.1 DMS query patterns | 4/5 | Search uses `instances.search` (ES). Identity uses retrieve + `instances.query` for parent/asset. Related reverse lookups use `instances.list` + `containsAny` (Postgres-leaning; could move to `query`). |
| Cognite services | 2.2 Server-side filter | 5/5 | Filters and projections are in the request (`containsAny`, targeted `sources`). No download-then-filter of large sets; search limit 20, related limit 100. |
| Cognite services | 2.3 Limits & pages | 4/5 | Explicit limits throughout (`RELATED_LIST_LIMIT = 100`, search 20, datapoints 10_000). Related lists do not follow `nextCursor` or tell the user the list was truncated. |
| Cognite services | 2.4 Call rate | 4/5 | 300ms search debounce; React Query staleTime 5 min; `cdfTaskRunner` cap 15 on search/instance/related. Datapoints and file-viewer `instances.query` skip the semaphore. |
| Cognite services | 2.5 429 backoff | 3/5 | Semaphore serializes but rethrows with no retry/jitter. QueryClient default retry (3) is not 429-aware and has no `Retry-After`. No infinite tight loop. |
| Brand | 3.1 Aura | 4/5 | Subpath Aura imports for Card, Command/Popover combobox, Tabs, DataGrid, EmptyState, Skeleton, Badge, Button, Chart, Topbar. Isolated custom: Identity definition list; `AppShell` native `<button>` via `BreadcrumbLink render` (`AppShell.tsx:43`). Search combobox has `aria-label` and a Label. |

### Must fix before deploy

_None._

### Should fix before deploy
- [ ] Wrap the app tree in an ErrorBoundary with an Aura fallback — `src/App.tsx` — 1.1
- [ ] Handle `connectToHostApp` rejection (`.catch` / try) so Fusion connect failures surface the existing error fallback instead of an unhandled promise — `src/App.tsx:61` — 1.1
- [ ] Bump `vitest`, `@vitest/coverage-v8`, and `@vitest/ui` to 4.1.11 to close GHSA-82fw-gwwq-j7x9 — `package.json` — 1.3
- [ ] Measure coverage at full `src/` scope (`coverage.include` / `coverage.all`; do not hide `cognite-file-viewer`) and raise TimeSeriesPanel / parse branches — `vitest.config.ts` — 1.4
- [ ] Add tests for `src/shared/utils/semaphore.ts`, `src/services/response.ts`, and `src/hooks/use-theme-mode.ts` — 1.4
- [ ] On 429, retry with exponential backoff and jitter; respect `Retry-After`; bound attempts — `src/shared/utils/semaphore.ts`, `src/main.tsx:15` — 2.5
- [ ] Schedule datapoint retrieves and file-viewer `instances.query` through `cdfTaskRunner` — `src/services/datapointService.ts:61`, `src/cognite-file-viewer/useDocumentAnnotations.ts:78` — 2.4
- [ ] Follow `nextCursor` or show that related lists are truncated at `RELATED_LIST_LIMIT` — `src/services/cdmRelatedService.ts:18` — 2.3
- [ ] Add a justification comment for `vi.mock('./asset360/DefaultFileViewer')` or inject the viewer through existing context — `src/App.test.tsx:19` — 1.6

### Nice to fix before deploy
- [ ] Remove unused `cn()` (and `clsx` / `tailwind-merge` if nothing else needs them) — `src/lib/utils.ts:4` — 1.5
- [ ] Plan `react-pdf` 9 → 11 once the vendored viewer supports it — `package.json` — 1.3
- [ ] Prefer `instances.query` for related reverse lookups instead of `instances.list` — `src/services/cdmRelatedService.ts:88` — 2.1
- [ ] Use an Aura Button (or documented BreadcrumbLink pattern) instead of a raw `<button>` in the Topbar — `src/shell/AppShell.tsx:43` — 3.1
- [ ] Upgrade `@cognite/app-sdk` 0.9.0 → 0.10.0 — `package.json` — 1.3

## Summary

- Must Fix open: 0
- Should Fix open: 9
- Nice Fix open: 5
