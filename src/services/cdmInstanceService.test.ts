import { describe, expect, it, vi } from 'vitest';

import { COGNITE_ASSET_VIEW, COGNITE_EQUIPMENT_VIEW } from '../cdm/views';

import {
  ASSET_IDENTITY_PROPERTIES,
  EQUIPMENT_IDENTITY_PROPERTIES,
  SdkCdmInstanceService,
  buildIdentityQuery,
  buildIdentityRetrieve,
} from './cdmInstanceService';

const selectedAsset = { space: 'plant', externalId: 'loc-1', kind: 'asset' as const };

describe(SdkCdmInstanceService.name, () => {
  it('builds a retrieve payload for the selected node', () => {
    expect(buildIdentityRetrieve(selectedAsset)).toEqual({
      items: [{ instanceType: 'node', space: 'plant', externalId: 'loc-1' }],
      sources: [{ source: COGNITE_ASSET_VIEW }],
    });
  });

  it('builds an outwards query for Asset.parent with versioned refs and step limits', () => {
    const query = buildIdentityQuery(selectedAsset);
    expect(query.with.selected.limit).toBe(1);
    expect('limit' in query.with.selected.nodes).toBe(false);
    expect(query.with.selected.nodes.filter.and).toEqual(
      expect.arrayContaining([{ hasData: [COGNITE_ASSET_VIEW] }])
    );
    expect(query.with.related.nodes.direction).toBe('outwards');
    expect(query.with.related.nodes.through).toEqual({
      view: COGNITE_ASSET_VIEW,
      identifier: 'parent',
    });
    expect(query.with.related.limit).toBe(1);
    expect(query.select.selected.sources[0]?.properties).toEqual([...ASSET_IDENTITY_PROPERTIES]);
    expect(query.select.selected.sources[0]?.properties).not.toContain('asset');
    expect(query.select.related.sources[0]?.properties).toContain('name');
  });

  it('builds an outwards query for Equipment.asset', () => {
    const query = buildIdentityQuery({ space: 'plant', externalId: 'pump-101', kind: 'equipment' });
    expect(query.with.related.nodes.through).toEqual({
      view: COGNITE_EQUIPMENT_VIEW,
      identifier: 'asset',
    });
    expect(query.select.selected.sources[0]?.properties).toEqual([...EQUIPMENT_IDENTITY_PROPERTIES]);
    expect(query.select.selected.sources[0]?.properties).not.toContain('parent');
  });

  it('hydrates identity from retrieve and query results', async () => {
    const retrieve = vi.fn().mockResolvedValue({
      items: [
        {
          space: 'plant',
          externalId: 'loc-1',
          properties: {
            cdf_cdm: { 'CogniteAsset/v1': { name: 'Area 12', description: 'Process area' } },
          },
        },
      ],
    });
    const query = vi.fn().mockResolvedValue({
      items: {
        related: [
          {
            space: 'plant',
            externalId: 'root',
            properties: { cdf_cdm: { 'CogniteAsset/v1': { name: 'Plant root' } } },
          },
        ],
      },
    });
    const service = new SdkCdmInstanceService({
      instances: { retrieve, query },
    });

    const identity = await service.loadIdentity(selectedAsset);

    expect(identity).toMatchObject({
      name: 'Area 12',
      parent: { space: 'plant', externalId: 'root', name: 'Plant root' },
    });
  });

  it('throws when retrieve returns no instance', async () => {
    const retrieve = vi.fn().mockResolvedValue({ items: [] });
    const query = vi.fn();
    const service = new SdkCdmInstanceService({
      instances: { retrieve, query },
    });

    await expect(service.loadIdentity(selectedAsset)).rejects.toThrow('Selected instance was not found');
    expect(query).not.toHaveBeenCalled();
  });
});
