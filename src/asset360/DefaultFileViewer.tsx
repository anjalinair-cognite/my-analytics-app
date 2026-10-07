import { CogniteFileViewer } from '../cognite-file-viewer';

import type { FileViewerRenderProps } from './asset360ViewModelContext';
import { FilePreviewSkeleton } from './skeletons';

export function DefaultFileViewer({ space, externalId, client }: FileViewerRenderProps) {
  return (
    <CogniteFileViewer
      source={{ type: 'instanceId', space, externalId }}
      client={client}
      showAnnotations={false}
      style={{ width: '100%', height: '480px' }}
      renderLoading={() => (
        <div role="status" aria-live="polite" aria-busy="true" aria-label="Loading">
          <FilePreviewSkeleton />
        </div>
      )}
    />
  );
}
