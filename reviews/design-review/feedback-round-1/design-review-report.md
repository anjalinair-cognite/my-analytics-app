# Design Review — My Analytics App — round 1

## User and tasks

- **Primary user:** Operations Analyst / Reliability Engineer investigating a flagged asset from a desk laptop (large monitor, office or control room)
- **Tasks evaluated:**
  1. Search an asset/equipment by tag and select it from ranked type-ahead
  2. Understand status: identity, related time series chart (range), and work orders without leaving the page
  3. Open related documents / preview a file from the same dashboard
- **Context:** Experienced, time-pressured investigation. Desktop/laptop only. Success = search + chart + file in one page (minutes, not hours).

## Task walkthrough findings

- **Task 1 — Search and select:** User confirmed the live path completed (Fusion / localhost). No stuck points, confusion, or errors reported.
- **Task 2 — Status (identity, chart, work orders):** User confirmed the live path completed on the same page. No stuck points reported.
- **Task 3 — Documents / file preview:** User confirmed the live path completed from the same dashboard. No stuck points reported.

## Scores

| Question | Score | Rationale | Improvement note |
| --- | --- | --- | --- |
| Q1 Aura consistency | 4 | Aura 0.3.5 used in 11 files (Topbar, combobox, tabs, DataGrid, empty/skeleton, badge, button, chart). `aura/no-overriding-styles` clean. Hard-coded hex/`rgb` only in the vendored file viewer. Identity uses a custom `<dl>`; Topbar home uses a native `<button>`. | Prefer an Aura Button (or documented BreadcrumbLink) in `AppShell`; keep viewer chrome on Aura tokens. |
| Q2 Navigation & hierarchy | 4 | Single-page Asset 360. Aura Topbar breadcrumbs (`My Analytics App` → selected name), Read-only metadata, home via breadcrumb. Location is usually clear after selection. Walkthrough reported no getting lost. | Keep the selected name in the Topbar as the primary “where am I” cue; consider collapsing the sidebar on very narrow desktop widths. |
| Q3 Labels & language | 5 | Specific labels: Search assets and equipment, Time series / Work orders / Documents, Preview, Last 24 hours / Last 7 days. No vague Submit/OK/Click here. Placeholder is supplementary to a visible Label. | None. |
| Q4 Feedback & validation | 5 | Skeletons, error Alerts, ErrorBoundary, host-connect failure, truncation notice. Every data panel has loading + error + empty. Read-only (no form mutations). | None. |
| Q5 Clickability | 5 | No `<div onClick>` / `<span onClick>`. Combobox, series rows, and file Preview are Aura Buttons; tabs are Aura Tabs. Hover/focus come from Aura. | None. |
| Q6 Error prevention | 5 | Read-only app; no destructive actions. Rubric scores this 5 by default. | None. |
| Q7 Responsive | 4 | Intentionally desktop-only per App-Brief. Viewport meta present. Main layout is `w-1/3 min-w-80` with almost no `sm`/`md` breakpoints; error screens use `sm:p-8`. | Verify 13" laptop; avoid squeezing the sidebar below usable search width. |
| Q8 Empty states | 5 | Aura EmptyState on identity (no selection / not found), search CommandEmpty, time series, datapoints, work orders, and documents. First-time next step: “Select an asset or equipment from search results.” | None. |
| Q9 Performance | 4 | Search limit 20, related lists 100 with truncation notice, 300ms debounce, React Query, Aura DataGrid. Bundle size not re-measured this round (`dist` check blocked). Single page (no `React.lazy`). Code review 2.3/2.4 = 5. | Optional: measure gzipped bundle; code-split the pdf.js viewer. |
| Q10 Accessibility | 4 | Search, tabs, DataGrids, and loading regions have `aria-label` / `aria-live`. Two viewer `<img>` tags use empty `alt`. `user-scalable=no` on viewport. Annotation hit-targets are pointer-only SVG rects. | Meaningful `alt` on file preview images; drop `user-scalable=no`; keyboard path for annotation rects if they remain interactive. |

## Summary

- Average score: 4.5
- Quality level: Excellent

## Must Fix (any score < 3)

_None._

## Should Fix (any score 3 – 3.7)

_None._

## Nice to Fix (any score 3.8 – 4.4)

- Q1 — Use an Aura Button (or documented BreadcrumbLink) instead of a raw `<button>` in the Topbar (`src/shell/AppShell.tsx`). Align file-viewer loading/error chrome with Aura tokens.
- Q2 — Keep selected-asset breadcrumbs as the location cue; test that the two-column layout still reads as “search | details” on a 13" laptop.
- Q7 — Confirm the `min-w-80` sidebar + main column on a 13" laptop; add a stack/collapse only if that width is in scope.
- Q9 — Measure gzipped `dist` size; lazy-load the pdf.js viewer so first paint stays light.
- Q10 — Give file-preview `<img>` a non-empty `alt`; remove `user-scalable=no` from `index.html`; add a keyboard path for annotation rects if they stay clickable.
