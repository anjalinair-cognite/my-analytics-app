import { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';

import { DocumentAnnotationOverlay } from './DocumentAnnotationOverlay';
import type { CogniteFileViewerProps } from './types';
import { useDocumentAnnotations } from './useDocumentAnnotations';
import { computeBaseWidth, useViewport } from './useViewport';
import { DefaultError, DefaultLoading } from './viewerFallbacks';

const PDF_LOAD_ERROR = new Error('Failed to load PDF');

export type PdfRendererProps = Omit<
  CogniteFileViewerProps,
  'source' | 'className' | 'style' | 'renderUnsupported'
> & {
  url: string;
  instanceId?: { space: string; externalId: string };
};

export function PdfRenderer(props: PdfRendererProps) {
  const {
    url,
    instanceId,
    client,
    showAnnotations = true,
    onAnnotationClick,
    onAnnotationHover,
    renderAnnotationTooltip,
    page: controlledPage,
    onPageChange,
    onDocumentLoad,
    width,
    rotation = 0,
    fitMode,
    onLoadProgress,
    renderLoading,
    renderError,
    renderOverlay,
  } = props;

  const {
    currentZoom,
    effectivePan,
    containerDims,
    viewportRef,
    cursor,
    handleMouseDown,
    handlePanChange,
  } = useViewport(props);

  const [internalPage, setInternalPage] = useState(1);
  const currentPage = controlledPage ?? internalPage;

  const handlePageChange = useCallback(
    (newPage: number) => {
      setInternalPage(newPage);
      onPageChange?.(newPage);
    },
    [onPageChange],
  );

  const handlePanChangeRef = useRef(handlePanChange);
  handlePanChangeRef.current = handlePanChange;
  useEffect(() => {
    handlePanChangeRef.current({ x: 0, y: 0 });
  }, [currentPage]);

  const [pageDims, setPageDims] = useState({ width: 0, height: 0 });
  const pageObserverRef = useRef<ResizeObserver | null>(null);

  const pageWrapperRef = useCallback((node: HTMLDivElement | null) => {
    if (pageObserverRef.current) {
      pageObserverRef.current.disconnect();
      pageObserverRef.current = null;
    }
    if (node) {
      const measure = () => {
        const w = node.clientWidth;
        const h = node.clientHeight;
        setPageDims((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
      };
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      measure();
      pageObserverRef.current = observer;
    }
  }, []);

  useEffect(() => {
    return () => {
      pageObserverRef.current?.disconnect();
      pageObserverRef.current = null;
    };
  }, []);

  const [pageNaturalSize, setPageNaturalSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  const handlePageLoadSuccess = useCallback(
    (page: { originalWidth?: number; originalHeight?: number }) => {
      const { originalWidth: w, originalHeight: h } = page;
      if (w && h) setPageNaturalSize({ width: w, height: h });
    },
    [],
  );

  const baseWidth = computeBaseWidth(fitMode, width, containerDims, pageNaturalSize);
  const annotationsEnabled = showAnnotations && instanceId !== undefined;

  const { annotations } = useDocumentAnnotations(client, instanceId, currentPage, {
    enabled: annotationsEnabled,
  });

  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  const handleLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      onDocumentLoad?.({ numPages });
      if (currentPageRef.current > numPages) handlePageChange(1);
    },
    [onDocumentLoad, handlePageChange],
  );

  return (
    <div
      ref={viewportRef}
      style={{ overflow: currentZoom > 1 ? 'hidden' : 'auto', cursor, height: '100%' }}
      onMouseDown={handleMouseDown}
    >
      <Document
        file={url}
        onLoadSuccess={handleLoadSuccess}
        onLoadProgress={onLoadProgress}
        loading={renderLoading ? renderLoading() : <DefaultLoading />}
        error={renderError ? renderError(PDF_LOAD_ERROR) : <DefaultError error={PDF_LOAD_ERROR} />}
      >
        <div
          ref={pageWrapperRef}
          style={{
            position: 'relative',
            display: 'inline-block',
            transform:
              effectivePan.x !== 0 || effectivePan.y !== 0
                ? `translate(${effectivePan.x}px, ${effectivePan.y}px)`
                : undefined,
          }}
        >
          <Page
            pageNumber={currentPage}
            width={baseWidth}
            scale={currentZoom}
            rotate={rotation}
            onLoadSuccess={handlePageLoadSuccess}
          />
          {annotationsEnabled && pageDims.width > 0 && annotations.length > 0 ? (
            <DocumentAnnotationOverlay
              annotations={annotations}
              containerWidth={pageDims.width}
              containerHeight={pageDims.height}
              rotation={rotation}
              onAnnotationClick={onAnnotationClick}
              onAnnotationHover={onAnnotationHover}
              renderAnnotationTooltip={renderAnnotationTooltip}
            />
          ) : null}
          {renderOverlay && pageDims.width > 0 && pageDims.height > 0 && pageNaturalSize
            ? renderOverlay({
                width: pageDims.width,
                height: pageDims.height,
                originalWidth: pageNaturalSize.width,
                originalHeight: pageNaturalSize.height,
                pageNumber: currentPage,
                rotation,
              })
            : null}
        </div>
      </Document>
    </div>
  );
}
