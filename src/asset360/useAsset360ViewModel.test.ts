import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  createAsset360Wrapper,
  makeDatapointService,
  makeInstanceService,
  makeRelatedService,
  makeSearchService,
} from '../__mocks__/asset360Harness';
import type { Identity, SearchHit } from '../cdm/types';

import { useAsset360ViewModel } from './useAsset360ViewModel';

const hit: SearchHit = {
  space: 'plant',
  externalId: 'pump-101',
  kind: 'equipment',
  name: 'PUMP-101',
  description: 'Feed pump',
};

const identity: Identity = {
  ...hit,
  parent: null,
  asset: { space: 'plant', externalId: 'loc-1', name: 'Area 12' },
  manufacturer: 'Acme',
  serialNumber: 'SN-1',
};

describe(useAsset360ViewModel.name, () => {
  it('loads search results after submitSearch and syncs the host', async () => {
    const searchService = makeSearchService({ search: vi.fn(async () => [hit]) });
    const { wrapper, api } = createAsset360Wrapper({
      context: { createSearchService: () => searchService },
    });

    const { result } = renderHook(() => useAsset360ViewModel(), { wrapper });

    await act(async () => {
      result.current.submitSearch('PUMP-101');
    });

    await waitFor(() => expect(result.current.search.data).toEqual([hit]));
    expect(result.current.search.isLoading).toBe(false);
    expect(api.syncInternalState).toHaveBeenCalledWith(expect.stringContaining('"searchQuery":"PUMP-101"'));
  });

  it('exposes identity, related lists, and datapoints on select', async () => {
    const searchService = makeSearchService({ search: vi.fn(async () => [hit]) });
    const instanceService = makeInstanceService({ loadIdentity: vi.fn(async () => identity) });
    const relatedService = makeRelatedService({
      listTimeSeries: vi.fn(async () => ({
        items: [
          {
            space: 'plant',
            externalId: 'ts-1',
            name: 'Flow',
            description: '',
            type: 'numeric',
            isStep: false,
            sourceUnit: 'm3/h',
          },
        ],
        truncated: false,
      })),
    });
    const datapointService = makeDatapointService({
      retrieve: vi.fn(async () => [{ timestamp: 1, value: 10 }]),
    });
    const { wrapper } = createAsset360Wrapper({
      context: {
        createSearchService: () => searchService,
        createInstanceService: () => instanceService,
        createRelatedService: () => relatedService,
        createDatapointService: () => datapointService,
      },
    });

    const { result } = renderHook(() => useAsset360ViewModel(), { wrapper });

    await act(async () => {
      result.current.selectInstance(hit);
    });

    await waitFor(() => expect(result.current.identity.data?.name).toBe('PUMP-101'));
    expect(result.current.chartSeries?.externalId).toBe('ts-1');
    await waitFor(() => expect(result.current.datapoints.data).toEqual([{ timestamp: 1, value: 10 }]));
    expect(result.current.activities.isEmpty).toBe(true);
    expect(result.current.files.isEmpty).toBe(true);
    expect(result.current.timeSeries.truncated).toBe(false);
  });

  it('exposes truncated related lists', async () => {
    const relatedService = makeRelatedService({
      listTimeSeries: vi.fn(async () => ({
        items: [
          {
            space: 'plant',
            externalId: 'ts-1',
            name: 'Flow',
            description: '',
            type: 'numeric',
            isStep: false,
            sourceUnit: '',
          },
        ],
        truncated: true,
      })),
    });
    const { wrapper } = createAsset360Wrapper({
      initialState: JSON.stringify({
        selected: { space: 'plant', externalId: 'pump-101', kind: 'equipment' },
      }),
      context: {
        createInstanceService: () => makeInstanceService({ loadIdentity: vi.fn(async () => identity) }),
        createRelatedService: () => relatedService,
      },
    });

    const { result } = renderHook(() => useAsset360ViewModel(), { wrapper });

    await waitFor(() => expect(result.current.timeSeries.truncated).toBe(true));
    expect(result.current.timeSeries.data).toHaveLength(1);
  });

  it('surfaces an error when identity loading fails', async () => {
    const instanceService = makeInstanceService({
      loadIdentity: vi.fn(async () => {
        throw new Error('identity 404');
      }),
    });
    const { wrapper } = createAsset360Wrapper({
      initialState: JSON.stringify({
        searchQuery: '',
        selected: { space: 'plant', externalId: 'pump-101', kind: 'equipment' },
      }),
      context: { createInstanceService: () => instanceService },
    });

    const { result } = renderHook(() => useAsset360ViewModel(), { wrapper });

    await waitFor(() => expect(result.current.identity.isError).toBe(true));
    expect(result.current.identity.errorMessage).toBe('identity 404');
  });

  it('restores the committed search query from host state', async () => {
    const searchService = makeSearchService({ search: vi.fn(async () => [hit]) });
    const { wrapper } = createAsset360Wrapper({
      initialState: JSON.stringify({ searchQuery: 'PUMP-101' }),
      context: { createSearchService: () => searchService },
    });

    const { result } = renderHook(() => useAsset360ViewModel(), { wrapper });

    await waitFor(() => expect(result.current.searchQuery).toBe('PUMP-101'));
    await waitFor(() => expect(result.current.search.data).toEqual([hit]));
  });

  it('syncs the related tab to the host', async () => {
    const { wrapper, api } = createAsset360Wrapper();
    const { result } = renderHook(() => useAsset360ViewModel(), { wrapper });

    await act(async () => {
      result.current.setRelatedTab('files');
    });

    expect(result.current.relatedTab).toBe('files');
    expect(api.syncInternalState).toHaveBeenCalledWith(expect.stringContaining('"relatedTab":"files"'));
  });

  it('restores the related tab from host state', async () => {
    const { wrapper } = createAsset360Wrapper({
      initialState: JSON.stringify({ relatedTab: 'activities' }),
    });

    const { result } = renderHook(() => useAsset360ViewModel(), { wrapper });

    await waitFor(() => expect(result.current.relatedTab).toBe('activities'));
  });
});
