import type { CogniteClient } from '@cognite/sdk';

import { isRecord, readNumber } from '../cdm/guards';
import type { InstanceRef, NumericDatapoint } from '../cdm/types';
import { cdfTaskRunner } from '../shared/utils/semaphore';

import { toError } from './response';

const MS_PER_HOUR = 60 * 60 * 1000;
export const DATAPOINT_LIMIT = 10_000;

export type DatapointClient = {
  datapoints: Pick<CogniteClient['datapoints'], 'retrieve'>;
};

export interface DatapointService {
  retrieve(series: InstanceRef, timeRangeHours: number): Promise<NumericDatapoint[]>;
}

export function buildDatapointQuery(
  series: InstanceRef,
  timeRangeHours: number,
  now: number
) {
  return {
    items: [{ instanceId: { space: series.space, externalId: series.externalId } }],
    start: now - timeRangeHours * MS_PER_HOUR,
    end: now,
    limit: DATAPOINT_LIMIT,
  };
}

function parseNumericDatapoints(response: unknown): NumericDatapoint[] {
  if (!Array.isArray(response) || response.length === 0) {
    return [];
  }
  const first = response[0];
  if (!isRecord(first) || first.isString === true || !Array.isArray(first.datapoints)) {
    return [];
  }
  return first.datapoints.flatMap((point: unknown) => {
    if (!isRecord(point)) {
      return [];
    }
    const timestamp = readNumber(point.timestamp);
    const value = readNumber(point.value);
    if (timestamp === null || value === null) {
      return [];
    }
    return [{ timestamp, value }];
  });
}

export class SdkDatapointService implements DatapointService {
  public constructor(
    private readonly client: DatapointClient,
    private readonly now: () => number = Date.now
  ) {}

  public async retrieve(series: InstanceRef, timeRangeHours: number): Promise<NumericDatapoint[]> {
    try {
      const response = await cdfTaskRunner.schedule(() =>
        this.client.datapoints.retrieve(buildDatapointQuery(series, timeRangeHours, this.now()))
      );
      return parseNumericDatapoints(response);
    } catch (error) {
      throw toError(error, 'Failed to load datapoints');
    }
  }
}

export function createDatapointService(client: CogniteClient, now: () => number = Date.now): DatapointService {
  return new SdkDatapointService(client, now);
}
