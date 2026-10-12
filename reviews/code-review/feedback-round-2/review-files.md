## File inventory: My Analytics App

Round 2. Working tree on `83d6f2f2f7eb5360016d9b5c3e2e3e8854ad39d9` (Asset 360 plus round-1 should-fix follow-up still uncommitted).

| File | Structure | Quality | Patterns | Tests | Notes |
| ---- | --------- | ------- | -------- | ----- | ----- |
| src/main.tsx | 5 | 5 | N/A | N/A | QueryClient uses `shouldRetryQuery`; wires `DefaultFileViewer` via context |
| src/App.tsx | 5 | 5 | 5 | ✓ | ErrorBoundary + connect `.catch`; CogniteSdkProvider |
| src/App.test.tsx | 5 | 5 | 5 | ✓ | Injects viewer through context; covers host-connect failure and render crash |
| src/lib/utils.ts | 5 | 4 | N/A | ✗ | Unused `cn()` (1.5) |
| src/hooks/use-theme-mode.ts | 4 | 4 | 4 | ✓ | localStorage theme |
| src/hooks/use-theme-mode.test.ts | 5 | 5 | 5 | ✓ | |
| src/shell/AppShell.tsx | 4 | 4 | 4 | ✗ | Aura Topbar; native `<button>` in BreadcrumbLink (3.1) |
| src/asset360/Asset360App.tsx | 5 | 5 | 5 | ⚠ | Thin shell |
| src/asset360/Asset360Page.tsx | 5 | 5 | 5 | ✓ | ViewModel once at page |
| src/asset360/Asset360Page.test.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/useAsset360ViewModel.ts | 4 | 4 | 5 | ✓ | Context DI; host-synced; RelatedPage truncated |
| src/asset360/useAsset360ViewModel.test.ts | 5 | 5 | 5 | ✓ | |
| src/asset360/asset360ViewModelContext.ts | 5 | 5 | 5 | N/A | |
| src/asset360/SearchPanel.tsx | 4 | 4 | 4 | ✓ | Command+Popover combobox; 300ms debounce |
| src/asset360/SearchPanel.test.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/IdentityCard.tsx | 5 | 5 | 4 | ✓ | Custom definition list |
| src/asset360/IdentityCard.test.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/RelatedPanels.tsx | 5 | 5 | 5 | ✓ | Aura Tabs |
| src/asset360/RelatedPanels.test.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/TimeSeriesPanel.tsx | 4 | 5 | 4 | ✓ | TruncationNotice; chart + range |
| src/asset360/TimeSeriesPanel.test.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/ActivitiesPanel.tsx | 5 | 5 | 5 | ✓ | DataGrid + truncation |
| src/asset360/ActivitiesPanel.test.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/FilesPanel.tsx | 5 | 5 | 5 | ✓ | DataGrid + truncation |
| src/asset360/FilesPanel.test.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/PanelStatus.tsx | 5 | 5 | 5 | ✓ | Empty/skeleton/alert + TruncationNotice |
| src/asset360/PanelStatus.test.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/KindBadge.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/KindBadge.test.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/skeletons.tsx | 5 | 5 | N/A | N/A | |
| src/asset360/DefaultFileViewer.tsx | 5 | 5 | 4 | N/A | Thin wrapper; excluded from coverage (pdf.js) |
| src/host/appState.ts | 5 | 5 | 5 | ✓ | |
| src/host/appState.test.ts | 5 | 5 | 5 | ✓ | |
| src/host/appStateContext.ts | 5 | 5 | 5 | N/A | |
| src/host/AppStateProvider.tsx | 5 | 5 | 5 | ⚠ | Covered via VM/page |
| src/host/hostApiContext.ts | 5 | 5 | 5 | N/A | |
| src/host/HostApiProvider.tsx | 5 | 5 | 5 | ⚠ | |
| src/host/useAppState.ts | 5 | 5 | 5 | ⚠ | Throw path untested |
| src/host/useHostApi.ts | 5 | 5 | 5 | ⚠ | Throw path untested |
| src/cdm/types.ts | 5 | 5 | N/A | N/A | Includes RelatedPage |
| src/cdm/views.ts | 5 | 5 | N/A | N/A | |
| src/cdm/propertyPath.ts | 5 | 5 | N/A | ⚠ | |
| src/cdm/guards.ts | 5 | 5 | 5 | ✓ | |
| src/cdm/guards.test.ts | 5 | 5 | 5 | ✓ | |
| src/cdm/parse.ts | 5 | 5 | 5 | ✓ | 97% lines |
| src/cdm/parse.test.ts | 5 | 5 | 5 | ✓ | |
| src/services/cdmSearchService.ts | 5 | 5 | 5 | ✓ | search + semaphore |
| src/services/cdmSearchService.test.ts | 5 | 5 | 5 | ✓ | |
| src/services/cdmInstanceService.ts | 5 | 5 | 5 | ✓ | retrieve + query |
| src/services/cdmInstanceService.test.ts | 5 | 5 | 5 | ✓ | |
| src/services/cdmRelatedService.ts | 4 | 5 | 5 | ✓ | list + truncated; limit 100 |
| src/services/cdmRelatedService.test.ts | 5 | 5 | 5 | ✓ | |
| src/services/datapointService.ts | 5 | 5 | 5 | ✓ | Wrapped in cdfTaskRunner |
| src/services/datapointService.test.ts | 5 | 5 | 5 | ✓ | |
| src/services/response.ts | 5 | 5 | 5 | ✓ | isTruncatedList |
| src/services/response.test.ts | 5 | 5 | 5 | ✓ | |
| src/shared/utils/throttleRetry.ts | 5 | 5 | 5 | ✓ | 429 backoff + jitter + Retry-After |
| src/shared/utils/throttleRetry.test.ts | 5 | 5 | 5 | ✓ | |
| src/shared/utils/semaphore.ts | 5 | 5 | 5 | ✓ | Queues + withThrottleRetry; no `as` cast |
| src/shared/utils/semaphore.test.ts | 5 | 5 | 5 | ✓ | |
| src/__mocks__/asset360Harness.tsx | 5 | 5 | 5 | N/A | |
| src/cognite-file-viewer/CogniteFileViewer.tsx | 3 | 3 | 3 | ✗ | Vendored; coverage-excluded (pdf.js OOM) |
| src/cognite-file-viewer/DocumentAnnotationOverlay.tsx | 3 | 4 | N/A | ✓ | |
| src/cognite-file-viewer/fileResolution.ts | 4 | 4 | 3 | ✓ | SDK `client.post` + signed-URL fetch (1.2) |
| src/cognite-file-viewer/useDocumentAnnotations.ts | 4 | 4 | 4 | ✓ | instances.query via cdfTaskRunner |
| src/cognite-file-viewer/useFileResolver.ts | 3 | 3 | N/A | ✓ | `source` in effect deps can loop if identity changes |
| src/cognite-file-viewer/useViewport.ts | 3 | 3 | N/A | ⚠ | computeBaseWidth tested; hook excluded from coverage |
| src/cognite-file-viewer/mimeTypes.ts | 4 | 5 | N/A | ✓ | |
| src/cognite-file-viewer/types.ts | 5 | 5 | N/A | N/A | |
| src/cognite-file-viewer/index.ts | 5 | 5 | N/A | N/A | Barrel |
