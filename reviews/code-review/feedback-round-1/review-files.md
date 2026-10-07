## File inventory: My Analytics App

Reviewed the working tree (Asset 360 implementation is uncommitted on top of `83d6f2f2f7eb5360016d9b5c3e2e3e8854ad39d9`).

| File | Structure | Quality | Patterns | Tests | Notes |
| ---- | --------- | ------- | -------- | ----- | ----- |
| src/main.tsx | 5 | 5 | N/A | N/A | QueryClient + theme bootstrap; entry is out of coverage scope |
| src/App.tsx | 4 | 4 | 4 | ✓ | CogniteSdkProvider wired; `connectToHostApp().then` has no `.catch`; no ErrorBoundary (1.1) |
| src/App.test.tsx | 4 | 4 | 3 | ✓ | `vi.mock` of DefaultFileViewer has no justification comment (1.6); HostAppAPI `Partial as T` is an allowed test-mock exception |
| src/lib/utils.ts | 5 | 4 | N/A | ✗ | Unused `cn()` helper — dead export (1.5) |
| src/hooks/use-theme-mode.ts | 4 | 4 | 4 | ✗ | localStorage theme; missing dedicated tests (1.4) |
| src/shell/AppShell.tsx | 4 | 4 | 4 | ✗ | Aura Topbar/Breadcrumb; native `<button>` via `BreadcrumbLink render` (3.1) |
| src/asset360/Asset360App.tsx | 5 | 5 | 5 | ⚠ | Thin shell; covered indirectly by page tests |
| src/asset360/Asset360Page.tsx | 5 | 5 | 5 | ✓ | Presentational; ViewModel called once here plus App shell |
| src/asset360/Asset360Page.test.tsx | 5 | 5 | 5 | ✓ | Integration of search, tabs, chart, preview |
| src/asset360/useAsset360ViewModel.ts | 4 | 4 | 5 | ✓ | Context DI; host-synced state; QuerySlice flag bag rather than discriminated union (1.6) |
| src/asset360/useAsset360ViewModel.test.ts | 5 | 5 | 5 | ✓ | Loading/success/error + host sync |
| src/asset360/asset360ViewModelContext.ts | 5 | 5 | 5 | N/A | Default factory context |
| src/asset360/SearchPanel.tsx | 4 | 4 | 4 | ✓ | Aura Command+Popover combobox; debounce 300ms |
| src/asset360/SearchPanel.test.tsx | 5 | 5 | 5 | ✓ | Debounce, loading skeleton, error |
| src/asset360/IdentityCard.tsx | 5 | 5 | 4 | ✓ | Aura Card + KindBadge; definition list is custom markup (3.1) |
| src/asset360/IdentityCard.test.tsx | 5 | 5 | 5 | ✓ | Empty, skeleton, success |
| src/asset360/RelatedPanels.tsx | 5 | 5 | 5 | ✓ | Aura Tabs; host-synced tab |
| src/asset360/RelatedPanels.test.tsx | 5 | 5 | 5 | ✓ | Tab switch |
| src/asset360/TimeSeriesPanel.tsx | 4 | 4 | 4 | ⚠ | Aura Button/Badge/SegmentedControl/Chart; series list not virtualized (small limit) |
| src/asset360/TimeSeriesPanel.test.tsx | 4 | 4 | 4 | ⚠ | Empty/loading/success; chart empty and range branches under-covered (54% lines) |
| src/asset360/ActivitiesPanel.tsx | 5 | 5 | 5 | ✓ | Aura DataGrid + Badge for N/A |
| src/asset360/ActivitiesPanel.test.tsx | 5 | 5 | 5 | ✓ | Grid, empty, skeleton |
| src/asset360/FilesPanel.tsx | 5 | 5 | 5 | ✓ | Aura DataGrid, Badge status, Preview Button |
| src/asset360/FilesPanel.test.tsx | 5 | 5 | 5 | ✓ | Grid + preview |
| src/asset360/PanelStatus.tsx | 5 | 5 | 5 | ✓ | Empty states + skeleton slot + Alert |
| src/asset360/PanelStatus.test.tsx | 5 | 5 | 5 | ✓ | Loading/empty/error |
| src/asset360/KindBadge.tsx | 5 | 5 | 5 | ✓ | Shared Aura Badge for Asset/Equipment |
| src/asset360/KindBadge.test.tsx | 5 | 5 | 5 | ✓ | Both kinds |
| src/asset360/skeletons.tsx | 5 | 5 | N/A | N/A | Presentational Aura Skeleton layouts |
| src/asset360/DefaultFileViewer.tsx | 5 | 5 | 4 | N/A | Thin wrapper; file-viewer loading skeleton |
| src/host/appState.ts | 5 | 5 | 5 | ✓ | Guards on JSON.parse; relatedTab included |
| src/host/appState.test.ts | 5 | 5 | 5 | ✓ | Invalid JSON/kind/tab |
| src/host/appStateContext.ts | 5 | 5 | 5 | N/A | Context type |
| src/host/AppStateProvider.tsx | 5 | 5 | 5 | ⚠ | Covered via page/VM tests |
| src/host/hostApiContext.ts | 5 | 5 | 5 | N/A | Narrow HostApi |
| src/host/HostApiProvider.tsx | 5 | 5 | 5 | ⚠ | Covered via harness |
| src/host/useAppState.ts | 5 | 5 | 5 | ⚠ | Throw path untested (75% lines) |
| src/host/useHostApi.ts | 5 | 5 | 5 | ⚠ | Throw path untested (75% lines) |
| src/cdm/types.ts | 5 | 5 | N/A | N/A | Types only |
| src/cdm/views.ts | 5 | 5 | N/A | N/A | View constants |
| src/cdm/propertyPath.ts | 5 | 5 | N/A | ⚠ | Tiny helper; exercised via related service tests |
| src/cdm/guards.ts | 5 | 5 | 5 | ✓ | Runtime guards, no `any` |
| src/cdm/guards.test.ts | 5 | 5 | 5 | ✓ | |
| src/cdm/parse.ts | 4 | 4 | 5 | ⚠ | 65.8% lines; several parse branches uncovered (1.4) |
| src/cdm/parse.test.ts | 4 | 4 | 5 | ⚠ | Missing identity/file/activity edge branches |
| src/services/cdmSearchService.ts | 5 | 5 | 5 | ✓ | `instances.search` + semaphore; OR operator; limit 20 |
| src/services/cdmSearchService.test.ts | 5 | 5 | 5 | ✓ | Request, parse, non-OK |
| src/services/cdmInstanceService.ts | 5 | 5 | 5 | ✓ | retrieve + query; property split for asset vs equipment |
| src/services/cdmInstanceService.test.ts | 5 | 5 | 5 | ✓ | |
| src/services/cdmRelatedService.ts | 4 | 4 | 5 | ✓ | `instances.list` + containsAny; limit 100, no cursor (2.1, 2.3) |
| src/services/cdmRelatedService.test.ts | 5 | 4 | 5 | ✓ | Equipment files retrieve path partly uncovered |
| src/services/datapointService.ts | 5 | 4 | 4 | ✓ | SDK datapoints; **not** wrapped in `cdfTaskRunner` (2.4, 2.5) |
| src/services/datapointService.test.ts | 5 | 5 | 5 | ✓ | |
| src/services/response.ts | 5 | 5 | 5 | ✗ | Shared parsers; 70% lines; no dedicated tests (1.4) |
| src/shared/utils/semaphore.ts | 4 | 3 | 4 | ✗ | `as AsyncFnResult` cast; no tests; no 429 retry (1.4, 2.5) |
| src/__mocks__/asset360Harness.tsx | 5 | 4 | 5 | N/A | Test harness; `Partial as Concrete` allowed for mocks |
| src/cognite-file-viewer/CogniteFileViewer.tsx | 3 | 3 | 3 | ✗ | Vendored viewer (~431 lines); excluded from test run (1.4) |
| src/cognite-file-viewer/DocumentAnnotationOverlay.tsx | 3 | 3 | N/A | ✗ | Vendored; excluded from tests |
| src/cognite-file-viewer/fileResolution.ts | 3 | 3 | 3 | ✗ | `client.post` to `/files/downloadlink` + `fetch(url)` for bytes (1.2) |
| src/cognite-file-viewer/useDocumentAnnotations.ts | 3 | 3 | 3 | ✗ | Direct `instances.query` without semaphore |
| src/cognite-file-viewer/useFileResolver.ts | 3 | 3 | N/A | ✗ | |
| src/cognite-file-viewer/useViewport.ts | 3 | 3 | N/A | ✗ | |
| src/cognite-file-viewer/mimeTypes.ts | 4 | 4 | N/A | ✗ | |
| src/cognite-file-viewer/types.ts | 5 | 5 | N/A | N/A | |
| src/cognite-file-viewer/index.ts | 5 | 5 | N/A | N/A | Barrel |
