export { CogniteFileViewer } from './CogniteFileViewer';

export {
  DocumentAnnotationOverlay,
  getAnnotationColor,
  getAllAnnotationColors,
} from './DocumentAnnotationOverlay';
export type { DocumentAnnotationOverlayProps } from './DocumentAnnotationOverlay';

export { useFileResolver } from './useFileResolver';
export { useDocumentAnnotations, clearAnnotationCache } from './useDocumentAnnotations';

export { resolveFileDownloadConfig, clearFileCache, clearAllFileCache } from './fileResolution';

export {
  getViewerType,
  getComputedMimeType,
  inferMimeTypeFromUrl,
  isNativelySupportedMimeType,
  doesDocumentPreviewApiSupportFile,
} from './mimeTypes';

export type {
  FileSource,
  FileViewerType,
  DocumentAnnotation,
  AnnotationResourceType,
  BoundingRect,
  OverlayRenderInfo,
  ResolvedFile,
  UseFileResolverResult,
  UseDocumentAnnotationsResult,
  CogniteFileViewerProps,
} from './types';
