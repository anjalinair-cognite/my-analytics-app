import type { CogniteClient } from '@cognite/sdk';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearAnnotationCache, useDocumentAnnotations } from './useDocumentAnnotations';

const query = vi.fn();
const client = {
  project: 'publicdatacdm',
  instances: { query },
} as unknown as CogniteClient;
const instanceId = { space: 'plant', externalId: 'pid-1' };

describe(useDocumentAnnotations.name, () => {
  afterEach(() => {
    clearAnnotationCache();
    query.mockReset();
  });

  it('maps annotation edges from instances.query', async () => {
    query.mockResolvedValue({
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
    const { result } = renderHook(() => useDocumentAnnotations(client, instanceId, 1));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(query).toHaveBeenCalled();
    expect(result.current.annotations).toEqual([
      expect.objectContaining({
        text: 'PUMP-101',
        resourceType: 'asset',
        page: 1,
        linkedResource: { space: 'plant', externalId: 'loc-1' },
      }),
    ]);
  });

  it('returns an empty list when disabled', async () => {
    const { result } = renderHook(() =>
      useDocumentAnnotations(client, instanceId, 1, { enabled: false })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(query).not.toHaveBeenCalled();
    expect(result.current.annotations).toEqual([]);
  });
});
