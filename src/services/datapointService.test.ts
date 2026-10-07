import { describe, expect, it, vi } from 'vitest';

import { DATAPOINT_LIMIT, SdkDatapointService, buildDatapointQuery } from './datapointService';

const series = { space: 'plant', externalId: 'ts-1' };

describe(SdkDatapointService.name, () => {
  it('requests datapoints by instance id for the selected window', () => {
    expect(buildDatapointQuery(series, 24, 1_700_000_000_000)).toEqual({
      items: [{ instanceId: { space: 'plant', externalId: 'ts-1' } }],
      start: 1_700_000_000_000 - 24 * 60 * 60 * 1000,
      end: 1_700_000_000_000,
      limit: DATAPOINT_LIMIT,
    });
  });

  it('parses numeric datapoints', async () => {
    const retrieve = vi.fn().mockResolvedValue([
      {
        isString: false,
        datapoints: [
          { timestamp: 1, value: 10 },
          { timestamp: 2, value: 12 },
        ],
      },
    ]);
    const service = new SdkDatapointService(
      { datapoints: { retrieve } },
      () => 1_700_000_000_000
    );

    await expect(service.retrieve(series, 24)).resolves.toEqual([
      { timestamp: 1, value: 10 },
      { timestamp: 2, value: 12 },
    ]);
  });

  it('returns an empty list for string series', async () => {
    const retrieve = vi.fn().mockResolvedValue([{ isString: true, datapoints: [{ timestamp: 1, value: 'ok' }] }]);
    const service = new SdkDatapointService(
      { datapoints: { retrieve } },
      () => 0
    );
    await expect(service.retrieve(series, 24)).resolves.toEqual([]);
  });

  it('throws when the SDK rejects', async () => {
    const retrieve = vi.fn().mockRejectedValue(new Error('404'));
    const service = new SdkDatapointService(
      { datapoints: { retrieve } },
      () => 0
    );
    await expect(service.retrieve(series, 24)).rejects.toThrow('404');
  });
});
