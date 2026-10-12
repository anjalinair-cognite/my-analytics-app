import type { CSSProperties, ReactNode } from 'react';

import { ImageRenderer } from './ImageRenderer';
import { getViewerType } from './mimeTypes';
import { PdfRenderer } from './PdfRenderer';
import { TextRenderer } from './TextRenderer';
import type { CogniteFileViewerProps } from './types';
import { useFileResolver } from './useFileResolver';
import { DefaultError, DefaultLoading, DefaultUnsupported } from './viewerFallbacks';

export function CogniteFileViewer(props: CogniteFileViewerProps) {
  const { source, client, renderLoading, renderError, renderUnsupported, className, style } = props;

  const { url, mimeType, instanceId, isLoading, error } = useFileResolver(source, client);

  const viewerType = getViewerType(mimeType);
  const rotation = props.rotation ?? 0;

  let content: ReactNode;
  if (isLoading) {
    content = renderLoading ? renderLoading() : <DefaultLoading />;
  } else if (error || !url) {
    const resolvedError = error ?? new Error('No URL resolved');
    content = renderError ? renderError(resolvedError) : <DefaultError error={resolvedError} />;
  } else if (viewerType === 'pdf') {
    content = <PdfRenderer {...props} url={url} instanceId={instanceId} rotation={rotation} />;
  } else if (viewerType === 'image') {
    content = <ImageRenderer {...props} url={url} rotation={rotation} />;
  } else if (viewerType === 'text') {
    content = <TextRenderer url={url} />;
  } else {
    content = renderUnsupported ? renderUnsupported(mimeType) : <DefaultUnsupported mimeType={mimeType} />;
  }

  const wrapperStyle: CSSProperties | undefined = style;

  return (
    <div className={className} style={wrapperStyle}>
      {content}
    </div>
  );
}
