import type { CogniteClient } from '@cognite/sdk';

import { parseIdentity } from '../cdm/parse';
import type { Identity, SelectedInstance } from '../cdm/types';
import { COGNITE_ASSET_VIEW, COGNITE_EQUIPMENT_VIEW, type CdmViewRef } from '../cdm/views';
import { cdfTaskRunner } from '../shared/utils/semaphore';

import { readItems, readQueryStep, toError } from './response';

export const ASSET_IDENTITY_PROPERTIES = ['name', 'description', 'parent'] as const;
export const EQUIPMENT_IDENTITY_PROPERTIES = [
  'name',
  'description',
  'asset',
  'manufacturer',
  'serialNumber',
] as const;

export function identityProperties(kind: SelectedInstance['kind']): readonly string[] {
  return kind === 'asset' ? ASSET_IDENTITY_PROPERTIES : EQUIPMENT_IDENTITY_PROPERTIES;
}

export type CdmInstanceClient = {
  instances: Pick<CogniteClient['instances'], 'retrieve' | 'query'>;
};

export interface CdmInstanceService {
  loadIdentity(selected: SelectedInstance): Promise<Identity>;
}

export function buildIdentityQuery(selected: SelectedInstance) {
  const view = selected.kind === 'asset' ? COGNITE_ASSET_VIEW : COGNITE_EQUIPMENT_VIEW;
  const relation = selected.kind === 'asset' ? 'parent' : 'asset';

  return {
    with: {
      selected: {
        nodes: {
          filter: {
            and: [
              { equals: { property: ['node', 'space'], value: selected.space } },
              { equals: { property: ['node', 'externalId'], value: selected.externalId } },
              { hasData: [view] },
            ],
          },
        },
        limit: 1,
      },
      related: {
        nodes: {
          from: 'selected',
          through: {
            view,
            identifier: relation,
          },
          direction: 'outwards' as const,
        },
        limit: 1,
      },
    },
    select: {
      selected: {
        sources: [{ source: view, properties: [...identityProperties(selected.kind)] }],
      },
      related: {
        sources: [{ source: COGNITE_ASSET_VIEW, properties: ['name'] }],
      },
    },
  };
}

export function buildIdentityRetrieve(selected: SelectedInstance) {
  const view: CdmViewRef = selected.kind === 'asset' ? COGNITE_ASSET_VIEW : COGNITE_EQUIPMENT_VIEW;
  return {
    items: [
      {
        instanceType: 'node' as const,
        space: selected.space,
        externalId: selected.externalId,
      },
    ],
    sources: [{ source: view }],
  };
}

export class SdkCdmInstanceService implements CdmInstanceService {
  public constructor(private readonly client: CdmInstanceClient) {}

  public async loadIdentity(selected: SelectedInstance): Promise<Identity> {
    try {
      const retrieved = await cdfTaskRunner.schedule(() =>
        this.client.instances.retrieve(buildIdentityRetrieve(selected))
      );
      const selectedNode = readItems(retrieved)[0];
      if (!selectedNode) {
        throw new Error('Selected instance was not found');
      }

      const queried = await cdfTaskRunner.schedule(() =>
        this.client.instances.query(buildIdentityQuery(selected))
      );
      const relatedNode = readQueryStep(queried, 'related')[0] ?? null;
      const identity = parseIdentity(selectedNode, selected.kind, relatedNode);
      if (!identity) {
        throw new Error('Selected instance was not found');
      }
      return identity;
    } catch (error) {
      throw toError(error, 'Failed to load instance identity');
    }
  }
}

export function createCdmInstanceService(client: CogniteClient): CdmInstanceService {
  return new SdkCdmInstanceService(client);
}
