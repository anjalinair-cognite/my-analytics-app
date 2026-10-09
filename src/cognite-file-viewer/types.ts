import type React from 'react';
import type { CogniteClient, FileInfo } from '@cognite/sdk';

export type FileSource =
  | { type: 'instanceId'; space: string; externalId: string }
  | { type: 'url'; url: string; mimeType?: string }
  | { type: 'internalId'; id: number };

export type FileViewerType = 'pdf' | 'image' | 'text' | 'unsupported';

export type AnnotationResourceType =
  | 'asset'
  | 'file'
  | 'timeSeries'
  | 'sequence'
  | 'event'
  | 'diagram'
  | 'unknown';

export interface DocumentAnnotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  resourceType: AnnotationResourceType;
  linkedResource?: { space: string; externalId: string };
  text?: string;
  annotationType: string;
}

export interface ResolvedFile {
  url: string;
  mimeType: string;
  fileInfo?: FileInfo;
  instanceId?: { space: string; externalId: string };
}

export interface UseFileResolverResult extends Partial<ResolvedFile> {
  isLoading: boolean;
  error: Error | null;
}

export interface UseDocumentAnnotationsResult {
  annotations: DocumentAnnotation[];
  isLoading: boolean;
  error: Error | null;
}

export interface BoundingRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OverlayRenderInfo {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  pageNumber: number;
  rotation: 0 | 90 | 180 | 270;
}

export interface CogniteFileViewerProps {
  source: FileSource;
  client?: CogniteClient;
  showAnnotations?: boolean;
  onAnnotationClick?: (annotation: DocumentAnnotation) => void;
  onAnnotationHover?: (annotation: DocumentAnnotation | null) => void;
  renderAnnotationTooltip?: (
    annotation: DocumentAnnotation,
    rect: BoundingRect,
  ) => React.ReactNode;
  page?: number;
  onPageChange?: (page: number) => void;
  onDocumentLoad?: (info: { numPages: number }) => void;
  width?: number;
  rotation?: 0 | 90 | 180 | 270;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  panOffset?: { x: number; y: number };
  onPanChange?: (offset: { x: number; y: number }) => void;
  fitMode?: 'width' | 'page';
  onLoadProgress?: (progress: { loaded: number; total: number }) => void;
  renderOverlay?: (info: OverlayRenderInfo) => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;
  renderUnsupported?: (mimeType: string | undefined) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
