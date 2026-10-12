## File inventory: My Analytics App

Round 3. Reviewed commit `cf75164feb3599d94e18f9d02a240c015b6824c1` (`fixes_1` on `feat/asset-360`). Engineering-review coverage exclusions are gone; the viewer is split.

| File | Structure | Quality | Patterns | Tests | Notes |
| ---- | --------- | ------- | -------- | ----- | ----- |
| src/main.tsx | 5 | 5 | N/A | N/A | Imports pdfWorker; wires DefaultFileViewer + shouldRetryQuery |
| src/App.tsx | 5 | 5 | 5 | ✓ | ErrorBoundary + connect `.catch`; CogniteSdkProvider |
| src/hooks/use-theme-mode.ts | 4 | 4 | 4 | ✓ | |
| src/shell/AppShell.tsx | 4 | 4 | 4 | ✓ | Aura Topbar; native `<button>` in BreadcrumbLink (3.1) |
| src/asset360/Asset360App.tsx | 5 | 5 | 5 | ⚠ | Thin shell |
| src/asset360/Asset360Page.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/useAsset360ViewModel.ts | 4 | 4 | 5 | ✓ | Context DI; host-synced |
| src/asset360/asset360ViewModelContext.ts | 5 | 5 | 5 | N/A | |
| src/asset360/SearchPanel.tsx | 4 | 4 | 4 | ✓ | |
| src/asset360/IdentityCard.tsx | 5 | 5 | 4 | ✓ | Custom `<dl>` |
| src/asset360/RelatedPanels.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/TimeSeriesPanel.tsx | 4 | 5 | 4 | ✓ | |
| src/asset360/ActivitiesPanel.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/FilesPanel.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/PanelStatus.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/KindBadge.tsx | 5 | 5 | 5 | ✓ | |
| src/asset360/skeletons.tsx | 5 | 5 | N/A | N/A | |
| src/asset360/DefaultFileViewer.tsx | 5 | 5 | 4 | ✓ | Imports CogniteFileViewer directly; 100% lines |
| src/host/appState.ts | 5 | 5 | 5 | ✓ | |
| src/host/appStateContext.ts | 5 | 5 | 5 | N/A | |
| src/host/AppStateProvider.tsx | 5 | 5 | 5 | ⚠ | |
| src/host/hostApiContext.ts | 5 | 5 | 5 | N/A | |
| src/host/HostApiProvider.tsx | 5 | 5 | 5 | ⚠ | |
| src/host/useAppState.ts | 5 | 5 | 5 | ⚠ | Throw path untested |
| src/host/useHostApi.ts | 5 | 5 | 5 | ⚠ | Throw path untested |
| src/cdm/types.ts | 5 | 5 | N/A | N/A | |
| src/cdm/views.ts | 5 | 5 | N/A | N/A | |
| src/cdm/propertyPath.ts | 5 | 5 | N/A | ⚠ | |
| src/cdm/guards.ts | 5 | 5 | 5 | ✓ | |
| src/cdm/parse.ts | 5 | 5 | 5 | ✓ | |
| src/services/cdmSearchService.ts | 5 | 5 | 5 | ✓ | |
| src/services/cdmInstanceService.ts | 5 | 5 | 5 | ✓ | |
| src/services/cdmRelatedService.ts | 4 | 5 | 5 | ✓ | `instances.list` + truncated (2.1) |
| src/services/datapointService.ts | 5 | 5 | 5 | ✓ | |
| src/services/response.ts | 5 | 5 | 5 | ✓ | |
| src/shared/utils/throttleRetry.ts | 5 | 5 | 5 | ✓ | |
| src/shared/utils/semaphore.ts | 5 | 5 | 5 | ✓ | |
| src/cognite-file-viewer/CogniteFileViewer.tsx | 5 | 5 | 4 | ✓ | Orchestration only; 100% lines |
| src/cognite-file-viewer/PdfRenderer.tsx | 4 | 4 | 4 | ✓ | PDF only; react-pdf aliased in Vitest |
| src/cognite-file-viewer/ImageRenderer.tsx | 4 | 4 | 4 | ✓ | |
| src/cognite-file-viewer/TextRenderer.tsx | 5 | 5 | 4 | ✓ | `fetch` of resolved blob URL |
| src/cognite-file-viewer/useBlobUrl.ts | 5 | 5 | 4 | ✓ | Signed-URL `fetch`, not CDF REST |
| src/cognite-file-viewer/viewerFallbacks.tsx | 5 | 4 | N/A | ⚠ | Covered via viewer tests |
| src/cognite-file-viewer/pdfWorker.ts | 5 | 4 | N/A | ✗ | Worker URL from `main.tsx`; 0% (cannot import pdf.js in tests) |
| src/cognite-file-viewer/useViewport.ts | 4 | 4 | N/A | ✓ | 89.6% lines |
| src/cognite-file-viewer/useFileResolver.ts | 4 | 4 | 4 | ✓ | |
| src/cognite-file-viewer/useDocumentAnnotations.ts | 3 | 4 | 4 | ✓ | |
| src/cognite-file-viewer/fileResolution.ts | 4 | 4 | 3 | ✓ | SDK `client.post` + signed-URL fetch |
| src/cognite-file-viewer/DocumentAnnotationOverlay.tsx | 3 | 4 | N/A | ⚠ | ~79% lines; rotation branches thin |
| src/cognite-file-viewer/mimeTypes.ts | 4 | 5 | N/A | ✓ | |
| src/cognite-file-viewer/types.ts | 5 | 5 | N/A | N/A | |
| src/__mocks__/asset360Harness.tsx | 5 | 5 | 5 | N/A | |
| src/__mocks__/reactPdf.tsx | 5 | 5 | N/A | N/A | Test-only react-pdf stub |
