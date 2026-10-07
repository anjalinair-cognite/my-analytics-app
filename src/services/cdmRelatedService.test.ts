import { describe, expect, it, vi } from 'vitest';

import { COGNITE_EQUIPMENT_VIEW, COGNITE_FILE_VIEW, COGNITE_TIME_SERIES_VIEW } from '../cdm/views';

import { RELATED_LIST_LIMIT, SdkCdmRelatedService, buildContainsAnyList } from './cdmRelatedService';

const selectedAsset = { space: 'plant', externalId: 'loc-1', kind: 'asset' as const };
const selectedEquipment = { space: 'plant', externalId: 'pump-101', kind: 'equipment' as const };

describe(SdkCdmRelatedService.name, () => {
  it('builds a containsAny list filter on the versioned view property', () => {
    expect(buildContainsAnyList(COGNITE_TIME_SERIES_VIEW, 'assets', selectedAsset)).toEqual({
      instanceType: 'node',
      sources: [{ source: COGNITE_TIME_SERIES_VIEW }],
      filter: {
        containsAny: {
          property: ['cdf_cdm', 'CogniteTimeSeries/v1', 'assets'],
          values: [{ space: 'plant', externalId: 'loc-1' }],
        },
      },
      limit: RELATED_LIST_LIMIT,
    });
  });

  it('lists time series, activities, and files independently', async () => {
    const list = vi.fn().mockImplementation((params: { sources: Array<{ source: { externalId: string } }> }) => {
      const viewId = params.sources[0]?.source.externalId;
      if (viewId === 'CogniteTimeSeries') {
        return Promise.resolve({
          items: [
            {
              space: 'plant',
              externalId: 'ts-1',
              properties: { cdf_cdm: { 'CogniteTimeSeries/v1': { name: 'Flow', type: 'numeric' } } },
            },
          ],
        });
      }
      if (viewId === 'CogniteActivity') {
        return Promise.reject(new Error('activities 403'));
      }
      return Promise.resolve({ items: [] });
    });
    const retrieve = vi.fn();
    const service = new SdkCdmRelatedService({
      instances: { list, retrieve },
    });

    await expect(service.listTimeSeries(selectedAsset)).resolves.toEqual({
      items: [expect.objectContaining({ externalId: 'ts-1', name: 'Flow' })],
      truncated: false,
    });
    await expect(service.listActivities(selectedAsset)).rejects.toThrow('activities 403');
    await expect(service.listFiles(selectedAsset)).resolves.toEqual({ items: [], truncated: false });
    expect(list).toHaveBeenCalledTimes(3);
  });

  it('includes CogniteEquipment.files for equipment selections', async () => {
    const list = vi.fn().mockResolvedValue({ items: [] });
    const retrieve = vi
      .fn()
      .mockResolvedValueOnce({
        items: [
          {
            space: 'plant',
            externalId: 'pump-101',
            properties: {
              cdf_cdm: {
                [COGNITE_EQUIPMENT_VIEW.externalId + '/v1']: {
                  files: [{ space: 'plant', externalId: 'pid-1' }],
                },
              },
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        items: [
          {
            space: 'plant',
            externalId: 'pid-1',
            properties: {
              cdf_cdm: {
                'CogniteFile/v1': { name: 'P&ID', mimeType: 'application/pdf', isUploaded: true },
              },
            },
          },
        ],
      });
    const service = new SdkCdmRelatedService({
      instances: { list, retrieve },
    });

    const files = await service.listFiles(selectedEquipment);

    expect(list.mock.calls[0]?.[0].sources[0].source).toEqual(COGNITE_FILE_VIEW);
    expect(list.mock.calls[0]?.[0].filter.containsAny.property).toEqual(['cdf_cdm', 'CogniteFile/v1', 'assets']);
    expect(files).toEqual({
      items: [
        {
          space: 'plant',
          externalId: 'pid-1',
          name: 'P&ID',
          description: '',
          mimeType: 'application/pdf',
          isUploaded: true,
        },
      ],
      truncated: false,
    });
  });

  it('marks a related list truncated when CDF returns nextCursor', async () => {
    const list = vi.fn().mockResolvedValue({
      items: [
        {
          space: 'plant',
          externalId: 'ts-1',
          properties: { cdf_cdm: { 'CogniteTimeSeries/v1': { name: 'Flow', type: 'numeric' } } },
        },
      ],
      nextCursor: 'page-2',
    });
    const service = new SdkCdmRelatedService({
      instances: { list, retrieve: vi.fn() },
    });

    await expect(service.listTimeSeries(selectedAsset)).resolves.toEqual({
      items: [expect.objectContaining({ externalId: 'ts-1' })],
      truncated: true,
    });
  });
});
