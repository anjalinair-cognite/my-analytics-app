import type { CogniteClient } from '@cognite/sdk';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PdfRenderer } from './PdfRenderer';
import { clearAnnotationCache } from './useDocumentAnnotations';

const annotationQuery = vi.fn();
const client = {
  project: 'publicdatacdm',
  instances: { query: annotationQuery },
} as unknown as CogniteClient;

describe(PdfRenderer.name, () => {
  afterEach(() => {
    clearAnnotationCache();
    annotationQuery.mockReset();
  });

  it('loads the document and reports page count', async () => {
    const onDocumentLoad = vi.fn();
    const onLoadProgress = vi.fn();
    render(
      <PdfRenderer
        url="https://files.test/doc.pdf"
        showAnnotations={false}
        onDocumentLoad={onDocumentLoad}
        onLoadProgress={onLoadProgress}
      />
    );
    expect(await screen.findByTestId('pdf-document')).toBeInTheDocument();
    await waitFor(() => {
      expect(onDocumentLoad).toHaveBeenCalledWith({ numPages: 2 });
    });
    expect(onLoadProgress).toHaveBeenCalled();
  });

  it('resets to page 1 when the controlled page is past the document', async () => {
    const onPageChange = vi.fn();
    render(
      <PdfRenderer
        url="https://files.test/doc.pdf"
        showAnnotations={false}
        page={9}
        onPageChange={onPageChange}
      />
    );
    await waitFor(() => {
      expect(onPageChange).toHaveBeenCalledWith(1);
    });
  });

  it('renders a custom loading slot on the document', () => {
    render(
      <PdfRenderer
        url="https://files.test/doc.pdf"
        showAnnotations={false}
        renderLoading={() => <div>PDF loading</div>}
      />
    );
    expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
  });

  it('draws annotation overlays when annotations are returned', async () => {
    annotationQuery.mockResolvedValue({
      items: {
        annotations: [
          {
            instanceType: 'edge',
            space: 'plant',
            externalId: 'ann-1',
            type: { externalId: 'diagrams.AssetLink' },
            endNode: { space: 'plant', externalId: 'loc-1' },
            properties: {
              cdf_cdm: {
                'CogniteDiagramAnnotation/v1': {
                  status: 'Approved',
                  startNodeText: 'PUMP-101',
                  startNodeXMin: 0.1,
                  startNodeXMax: 0.2,
                  startNodeYMin: 0.3,
                  startNodeYMax: 0.4,
                  startNodePageNumber: 1,
                },
              },
            },
          },
        ],
      },
    });
    const { container } = render(
      <PdfRenderer
        url="https://files.test/doc.pdf"
        client={client}
        instanceId={{ space: 'plant', externalId: 'pid-1' }}
        showAnnotations
        renderOverlay={() => <div>pdf overlay</div>}
      />
    );
    expect(await screen.findByText('PUMP-101', { selector: 'title' })).toBeInTheDocument();
    expect(container.querySelector('rect')).not.toBeNull();
    expect(await screen.findByText('pdf overlay')).toBeInTheDocument();
  });
});
