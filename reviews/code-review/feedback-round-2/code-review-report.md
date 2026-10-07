# My Analytics App — Flows code review

This document is the platform review for My Analytics App, conducted as part of the Cognite Flows app certification process.

## What this review covers

- **Protect the user and the customer** — no known bugs, correct SDK usage, healthy dependencies, adequate test coverage, and a clean codebase.
- **Protect Cognite services** — efficient DMS query patterns, server-side filtering, bounded pagination, and graceful rate-limit handling.
- **Protect the brand** — UI consistency with the Aura design system.

Scores are 1–5. A score of 1–2 on any criterion blocks approval. Score 3 is acceptable with tracked follow-up. Scores 4–5 are good.

## Path to approval

This review found **0 must-fix item(s)** that block approval. Round-1 should-fix items (ErrorBoundary, host-connect catch, Vitest advisory, 429 backoff, semaphore coverage, related-list truncation, unjustified `vi.mock`) are resolved. Five nice-to-fix items remain. Re-run is not required for `Must Fix open: 0`; proceed to `flows-design-review`.

---

## Review details

### Summary
Asset 360 is a coherent Flows app: host-synced search/selection/tab, Cognite SDK + `CogniteSdkProvider`, context DI, ViewModel, Aura combobox/tabs/DataGrid/empty/skeleton, ErrorBoundary, and 429 backoff with jitter. Related lists are capped at 100 with a visible truncation notice. CDF reads go through `cdfTaskRunner`. Round 1’s blocking-adjacent gaps are closed. Remaining work is polish: unused `cn()`, `react-pdf` majors, related `list` vs `query`, Topbar native button, and coverage exclusion of the pdf.js viewer.

### Reviewed commit
`83d6f2f2f7eb5360016d9b5c3e2e3e8854ad39d9` (HEAD) plus the uncommitted Asset 360 working tree reviewed in this round.

### Test coverage
- **Framework:** Vitest 4.1.11 (`npx vitest run --coverage`)
- **Tests run:** 112 passed, 0 failed, 0 skipped (28 files)
- **Coverage:** Statements: 89% | Branches: 77.74% | Functions: 92.57% | Lines: 90.37% (657/727)
- **Notable gaps:** `vitest.config.ts` still excludes `CogniteFileViewer.tsx`, `useViewport.ts`, and `DefaultFileViewer.tsx` because importing pdf.js OOMs happy-dom. Other file-viewer modules are tested. Unused `src/lib/utils.ts` is 0%. Threshold `lines: 80` is configured.

### Package & security summary
- **Total packages:** 14 dependencies, 25 devDependencies
- **Health:** 10 pass, 3 warn, 1 fail (production)
- **Vulnerabilities:** 0 critical, 0 high, 0 moderate, 4 low
- Full details: see `review-packages.md`

### Scores

| Area | Criterion | Score | Notes |
| ---- | --------- | ----- | ----- |
| User & customer | 1.1 Known bugs | 5/5 | ErrorBoundary and host-connect `.catch` in `App.tsx`. Per-panel empty/error/truncation. Connect and render-crash paths tested. |
| User & customer | 1.2 CDF via SDK | 4/5 | Industrial reads use `client.instances.*` and `datapoints.retrieve`. File viewer uses SDK `client.post` for download links; `fetch` is only the signed blob URL (`fileResolution.ts`, `CogniteFileViewer.tsx`). |
| User & customer | 1.3 Packages | 4/5 | Vitest advisory closed. No high/critical/moderate CVEs. `react-pdf` is two majors behind; React 18 vs 19 is Aura-constrained. |
| User & customer | 1.4 Tests & coverage | 4/5 | 112 tests; 90.37% lines with `coverage.include` of `src/` and an 80% threshold. Three pdf.js-bound files remain excluded (secondary viewer). |
| User & customer | 1.5 Dead code | 4/5 | No unused pages. Unused `cn()` in `src/lib/utils.ts`. |
| User & customer | 1.6 Patterns & testability | 5/5 | Interface services, ViewModel context DI, host-synced state. App tests inject the file viewer; no unjustified `vi.mock`. |
| Cognite services | 2.1 DMS query patterns | 4/5 | Search uses `instances.search`; identity uses retrieve + `query`. Related reverse lookups still use `instances.list` + `containsAny`. |
| Cognite services | 2.2 Server-side filter | 5/5 | Filters and projections in the request; search limit 20; related limit 100. |
| Cognite services | 2.3 Limits & pages | 5/5 | Explicit limits; truncated notice instead of prefetching extra pages (`RELATED_LIST_LIMIT`, `isTruncatedList`). |
| Cognite services | 2.4 Call rate | 5/5 | 300ms debounce; React Query staleTime 5 min; `cdfTaskRunner` on search, identity, related, datapoints, and annotation query. |
| Cognite services | 2.5 429 backoff | 5/5 | `withThrottleRetry`: bounded attempts, full jitter, `Retry-After`. QueryClient does not double-retry 429s (`shouldRetryQuery`). |
| Brand | 3.1 Aura | 4/5 | Subpath Aura for combobox, tabs, DataGrid, empty, skeleton, badge, button, chart, Topbar, ErrorBoundary fallback. Isolated custom: identity `<dl>`; Topbar `BreadcrumbLink` native `<button>`. |

### Must fix before deploy

_None._

### Should fix before deploy

_None._

### Nice to fix before deploy
- [ ] Remove unused `cn()` (and `clsx` / `tailwind-merge` if unused elsewhere) — `src/lib/utils.ts:4` — 1.5
- [ ] Plan `react-pdf` 9 → 11 once the vendored viewer supports it — `package.json` — 1.3
- [ ] Prefer `instances.query` for related reverse lookups instead of `instances.list` — `src/services/cdmRelatedService.ts:99` — 2.1
- [ ] Use an Aura Button (or documented BreadcrumbLink pattern) instead of a raw `<button>` in the Topbar — `src/shell/AppShell.tsx:43` — 3.1
- [ ] Upgrade `@cognite/app-sdk` 0.9.0 → 0.10.0 — `package.json` — 1.3

## Summary

- Must Fix open: 0
- Should Fix open: 0
- Nice Fix open: 5
