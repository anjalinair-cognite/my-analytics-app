import type { CogniteClient } from '@cognite/sdk';

import { readDirectRelationList, readViewProperties } from '../cdm/guards';
import { instanceKey, parseActivity, parseFile, parseTimeSeries } from '../cdm/parse';
import { viewPropertyPath } from '../cdm/propertyPath';
import type {
  RelatedActivity,
  RelatedFile,
  RelatedPage,
  RelatedTimeSeries,
  SelectedInstance,
} from '../cdm/types';
import {
  COGNITE_ACTIVITY_VIEW,
  COGNITE_EQUIPMENT_VIEW,
  COGNITE_FILE_VIEW,
  COGNITE_TIME_SERIES_VIEW,
  type CdmViewRef,
} from '../cdm/views';
import { cdfTaskRunner } from '../shared/utils/semaphore';

import { isTruncatedList, readItems, toError } from './response';

export const RELATED_LIST_LIMIT = 100;

export type CdmRelatedClient = {
  instances: Pick<CogniteClient['instances'], 'list' | 'retrieve'>;
};

export interface CdmRelatedService {
  listTimeSeries(selected: SelectedInstance): Promise<RelatedPage<RelatedTimeSeries>>;
  listActivities(selected: SelectedInstance): Promise<RelatedPage<RelatedActivity>>;
  listFiles(selected: SelectedInstance): Promise<RelatedPage<RelatedFile>>;
}

function relationProperty(selected: SelectedInstance): 'assets' | 'equipment' {
  return selected.kind === 'asset' ? 'assets' : 'equipment';
}

export function buildContainsAnyList(view: CdmViewRef, property: string, selected: SelectedInstance) {
  return {
    instanceType: 'node' as const,
    sources: [{ source: view }],
    filter: {
      containsAny: {
        property: viewPropertyPath(view, property),
        values: [{ space: selected.space, externalId: selected.externalId }],
      },
    },
    limit: RELATED_LIST_LIMIT,
  };
}

function dedupeFiles(files: RelatedFile[]): RelatedFile[] {
  const seen = new Set<string>();
  return files.filter((file) => {
    const key = instanceKey(file);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export class SdkCdmRelatedService implements CdmRelatedService {
  public constructor(private readonly client: CdmRelatedClient) {}

  public async listTimeSeries(selected: SelectedInstance): Promise<RelatedPage<RelatedTimeSeries>> {
    return this.listRelated(COGNITE_TIME_SERIES_VIEW, relationProperty(selected), selected, parseTimeSeries);
  }

  public async listActivities(selected: SelectedInstance): Promise<RelatedPage<RelatedActivity>> {
    return this.listRelated(COGNITE_ACTIVITY_VIEW, relationProperty(selected), selected, parseActivity);
  }

  public async listFiles(selected: SelectedInstance): Promise<RelatedPage<RelatedFile>> {
    const listed = await this.listRelated(COGNITE_FILE_VIEW, 'assets', selected, parseFile);
    if (selected.kind !== 'equipment') {
      return listed;
    }
    const forwarded = await this.listEquipmentFiles(selected);
    const items = dedupeFiles([...listed.items, ...forwarded.items]);
    const truncated = listed.truncated || forwarded.truncated || items.length > RELATED_LIST_LIMIT;
    return {
      items: items.slice(0, RELATED_LIST_LIMIT),
      truncated,
    };
  }

  private async listRelated<T>(
    view: CdmViewRef,
    property: string,
    selected: SelectedInstance,
    parse: (instance: unknown) => T | null
  ): Promise<RelatedPage<T>> {
    try {
      const response = await cdfTaskRunner.schedule(() =>
        this.client.instances.list(buildContainsAnyList(view, property, selected))
      );
      return {
        items: readItems(response).flatMap((item) => {
          const parsed = parse(item);
          return parsed ? [parsed] : [];
        }),
        truncated: isTruncatedList(response, RELATED_LIST_LIMIT),
      };
    } catch (error) {
      throw toError(error, `Failed to list ${view.externalId}`);
    }
  }

  private async listEquipmentFiles(selected: SelectedInstance): Promise<RelatedPage<RelatedFile>> {
    try {
      const retrieved = await cdfTaskRunner.schedule(() =>
        this.client.instances.retrieve({
          items: [
            {
              instanceType: 'node',
              space: selected.space,
              externalId: selected.externalId,
            },
          ],
          sources: [{ source: COGNITE_EQUIPMENT_VIEW }],
        })
      );
      const equipment = readItems(retrieved)[0];
      const refs = readDirectRelationList(readViewProperties(equipment, COGNITE_EQUIPMENT_VIEW).files);
      if (refs.length === 0) {
        return { items: [], truncated: false };
      }
      const pageRefs = refs.slice(0, RELATED_LIST_LIMIT);
      const files = await cdfTaskRunner.schedule(() =>
        this.client.instances.retrieve({
          items: pageRefs.map((ref) => ({
            instanceType: 'node' as const,
            space: ref.space,
            externalId: ref.externalId,
          })),
          sources: [{ source: COGNITE_FILE_VIEW }],
        })
      );
      return {
        items: readItems(files).flatMap((item) => {
          const parsed = parseFile(item);
          return parsed ? [parsed] : [];
        }),
        truncated: refs.length > RELATED_LIST_LIMIT,
      };
    } catch (error) {
      throw toError(error, 'Failed to list equipment files');
    }
  }
}

export function createCdmRelatedService(client: CogniteClient): CdmRelatedService {
  return new SdkCdmRelatedService(client);
}
