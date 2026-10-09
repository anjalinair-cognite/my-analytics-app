import { assert, describe, expect, it, vi } from 'vitest';

import { COGNITE_ASSET_VIEW, COGNITE_EQUIPMENT_VIEW } from '../cdm/views';

import { SEARCH_LIMIT, SEARCH_PROPERTIES, SdkCdmSearchService } from './cdmSearchService';

function assetHit() {
  return {
    space: 'plant',
    externalId: 'loc-1',
    properties: {
      cdf_cdm: {
        'CogniteAsset/v1': { name: 'Area 12', description: 'Process area' },
      },
    },
  };
}

function equipmentHit() {
  return {
    space: 'plant',
    externalId: 'pump-101',
    properties: {
      cdf_cdm: {
        'CogniteEquipment/v1': { name: 'PUMP-101', description: 'Feed pump' },
      },
    },
  };
}

describe(SdkCdmSearchService.name, () => {
  it('searches Asset then Equipment with OR on name, description, and aliases', async () => {
    const search = vi
      .fn()
      .mockResolvedValueOnce({ items: [assetHit()] })
      .mockResolvedValueOnce({ items: [equipmentHit()] });
    const service = new SdkCdmSearchService({ instances: { search } });

    const results = await service.search('PUMP-101');

    expect(search).toHaveBeenCalledTimes(2);
    expect(search.mock.calls[0]?.[0]).toEqual({
      view: COGNITE_ASSET_VIEW,
      query: 'PUMP-101',
      properties: [...SEARCH_PROPERTIES],
      operator: 'OR',
      instanceType: 'node',
      limit: SEARCH_LIMIT,
    });
    expect(search.mock.calls[1]?.[0].view).toEqual(COGNITE_EQUIPMENT_VIEW);
    expect(results).toEqual([
      {
        space: 'plant',
        externalId: 'loc-1',
        kind: 'asset',
        name: 'Area 12',
        description: 'Process area',
      },
      {
        space: 'plant',
        externalId: 'pump-101',
        kind: 'equipment',
        name: 'PUMP-101',
        description: 'Feed pump',
      },
    ]);
  });

  it('returns an empty list for a blank query without calling the SDK', async () => {
    const search = vi.fn(() => {
      assert.fail('search should not be called');
    });
    const service = new SdkCdmSearchService({ instances: { search } });
    await expect(service.search('   ')).resolves.toEqual([]);
  });

  it('throws when the SDK rejects', async () => {
    const search = vi.fn().mockRejectedValue(new Error('403'));
    const service = new SdkCdmSearchService({ instances: { search } });
    await expect(service.search('pump')).rejects.toThrow('403');
  });
});
