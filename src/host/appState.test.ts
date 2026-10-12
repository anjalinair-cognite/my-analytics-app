import { describe, expect, it } from 'vitest';

import { parseAppState, DEFAULT_APP_STATE } from './appState';

describe(parseAppState.name, () => {
  it('returns defaults for missing or invalid JSON', () => {
    expect(parseAppState(undefined)).toEqual(DEFAULT_APP_STATE);
    expect(parseAppState('{')).toEqual(DEFAULT_APP_STATE);
    expect(parseAppState('[]')).toEqual(DEFAULT_APP_STATE);
  });

  it('restores a valid selected instance and search query', () => {
    const raw = JSON.stringify({
      searchQuery: 'PUMP-101',
      selected: { space: 'plant', externalId: 'pump-101', kind: 'equipment' },
      selectedTimeSeries: { space: 'plant', externalId: 'ts-1' },
      timeRangeHours: 168,
      selectedFile: { space: 'plant', externalId: 'file-1' },
      relatedTab: 'files',
    });

    expect(parseAppState(raw)).toEqual({
      searchQuery: 'PUMP-101',
      selected: { space: 'plant', externalId: 'pump-101', kind: 'equipment' },
      selectedTimeSeries: { space: 'plant', externalId: 'ts-1' },
      timeRangeHours: 168,
      selectedFile: { space: 'plant', externalId: 'file-1' },
      relatedTab: 'files',
    });
  });

  it('drops an invalid kind and unsupported time range', () => {
    const raw = JSON.stringify({
      searchQuery: 'x',
      selected: { space: 'plant', externalId: 'pump-101', kind: 'tag' },
      timeRangeHours: 3,
    });

    expect(parseAppState(raw)).toEqual({
      ...DEFAULT_APP_STATE,
      searchQuery: 'x',
    });
  });

  it('defaults an invalid related tab to time series', () => {
    const raw = JSON.stringify({ relatedTab: 'identity' });
    expect(parseAppState(raw).relatedTab).toBe('timeSeries');
  });
});
