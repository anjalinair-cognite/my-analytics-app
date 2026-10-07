import { isInstanceRef, isRecord, readNumber, readString } from '../cdm/guards';
import type { InstanceKind, InstanceRef, SelectedInstance } from '../cdm/types';

export type RelatedTab = 'timeSeries' | 'activities' | 'files';

export type AppState = {
  searchQuery: string;
  selected: SelectedInstance | null;
  selectedTimeSeries: InstanceRef | null;
  timeRangeHours: number;
  selectedFile: InstanceRef | null;
  relatedTab: RelatedTab;
};

export const DEFAULT_APP_STATE: AppState = {
  searchQuery: '',
  selected: null,
  selectedTimeSeries: null,
  timeRangeHours: 24,
  selectedFile: null,
  relatedTab: 'timeSeries',
};

export function isRelatedTab(value: unknown): value is RelatedTab {
  return value === 'timeSeries' || value === 'activities' || value === 'files';
}

const ALLOWED_RANGES = new Set([24, 168]);

function isInstanceKind(value: unknown): value is InstanceKind {
  return value === 'asset' || value === 'equipment';
}

function parseSelected(value: unknown): SelectedInstance | null {
  if (!isRecord(value) || !isInstanceKind(value.kind)) {
    return null;
  }
  if (typeof value.space !== 'string' || typeof value.externalId !== 'string') {
    return null;
  }
  return { space: value.space, externalId: value.externalId, kind: value.kind };
}

function parseRef(value: unknown): InstanceRef | null {
  return isInstanceRef(value) ? { space: value.space, externalId: value.externalId } : null;
}

export function parseAppState(raw: string | undefined): AppState {
  if (!raw) {
    return DEFAULT_APP_STATE;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return DEFAULT_APP_STATE;
    }
    const timeRangeHours = readNumber(parsed.timeRangeHours);
    return {
      searchQuery: readString(parsed.searchQuery),
      selected: parseSelected(parsed.selected),
      selectedTimeSeries: parseRef(parsed.selectedTimeSeries),
      timeRangeHours: timeRangeHours !== null && ALLOWED_RANGES.has(timeRangeHours) ? timeRangeHours : 24,
      selectedFile: parseRef(parsed.selectedFile),
      relatedTab: isRelatedTab(parsed.relatedTab) ? parsed.relatedTab : DEFAULT_APP_STATE.relatedTab,
    };
  } catch {
    return DEFAULT_APP_STATE;
  }
}
