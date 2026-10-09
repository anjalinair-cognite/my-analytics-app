import type { CogniteClient } from '@cognite/sdk';

import { parseSearchHit } from '../cdm/parse';
import type { SearchHit } from '../cdm/types';
import { COGNITE_ASSET_VIEW, COGNITE_EQUIPMENT_VIEW, type CdmViewRef } from '../cdm/views';
import { cdfTaskRunner } from '../shared/utils/semaphore';

import { readItems, toError } from './response';

export const SEARCH_PROPERTIES = ['name', 'description', 'aliases'] as const;
export const SEARCH_LIMIT = 20;

export type CdmSearchParams = {
  view: CdmViewRef;
  query: string;
  properties: string[];
  operator: 'AND' | 'OR';
  instanceType: 'node';
  limit: number;
};

export type CdmSearchClient = {
  instances: Pick<CogniteClient['instances'], 'search'>;
};

export interface CdmSearchService {
  search(query: string): Promise<SearchHit[]>;
}

export class SdkCdmSearchService implements CdmSearchService {
  public constructor(private readonly client: CdmSearchClient) {}

  public async search(query: string): Promise<SearchHit[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }

    const assets = await this.searchView(COGNITE_ASSET_VIEW, trimmed, 'asset');
    const equipment = await this.searchView(COGNITE_EQUIPMENT_VIEW, trimmed, 'equipment');
    return [...assets, ...equipment].slice(0, SEARCH_LIMIT * 2);
  }

  private async searchView(
    view: CdmViewRef,
    query: string,
    kind: SearchHit['kind']
  ): Promise<SearchHit[]> {
    const params: CdmSearchParams = {
      view,
      query,
      properties: [...SEARCH_PROPERTIES],
      operator: 'OR',
      instanceType: 'node',
      limit: SEARCH_LIMIT,
    };

    try {
      const response = await cdfTaskRunner.schedule(() =>
        this.client.instances.search(params)
      );
      return readItems(response).flatMap((item) => {
        const hit = parseSearchHit(item, kind);
        return hit ? [hit] : [];
      });
    } catch (error) {
      throw toError(error, `Failed to search ${view.externalId}`);
    }
  }
}

export function createCdmSearchService(client: CogniteClient): CdmSearchService {
  return new SdkCdmSearchService(client);
}
