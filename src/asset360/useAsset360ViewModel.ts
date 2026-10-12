import { useQuery } from '@tanstack/react-query';
import { useCallback, useContext, useMemo } from 'react';

import { isNumericTimeSeries } from '../cdm/parse';
import type {
  Identity,
  InstanceRef,
  NumericDatapoint,
  RelatedActivity,
  RelatedFile,
  RelatedTimeSeries,
  SearchHit,
} from '../cdm/types';
import type { AppState, RelatedTab } from '../host/appState';

import {
  Asset360ViewModelContext,
  type Asset360ViewModelContextType,
} from './asset360ViewModelContext';

export type QuerySlice<T> = {
  data: T;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isEmpty: boolean;
  truncated?: boolean;
};

export type Asset360ViewModel = {
  searchQuery: string;
  selected: AppState['selected'];
  timeRangeHours: number;
  selectedFile: InstanceRef | null;
  relatedTab: RelatedTab;
  search: QuerySlice<SearchHit[]>;
  identity: QuerySlice<Identity | null>;
  timeSeries: QuerySlice<RelatedTimeSeries[]>;
  activities: QuerySlice<RelatedActivity[]>;
  files: QuerySlice<RelatedFile[]>;
  chartSeries: RelatedTimeSeries | null;
  datapoints: QuerySlice<NumericDatapoint[]>;
  client: ReturnType<Asset360ViewModelContextType['useCogniteSdk']>;
  renderFileViewer: Asset360ViewModelContextType['renderFileViewer'];
  submitSearch: (query: string) => void;
  selectInstance: (hit: SearchHit) => void;
  clearSelection: () => void;
  selectTimeSeries: (ref: InstanceRef) => void;
  setTimeRangeHours: (hours: number) => void;
  selectFile: (ref: InstanceRef) => void;
  setRelatedTab: (tab: RelatedTab) => void;
};

function errorMessage(error: unknown): string | null {
  if (error instanceof Error) {
    return error.message;
  }
  return error ? 'Something went wrong' : null;
}

function slice<T>(
  data: T,
  isLoading: boolean,
  isError: boolean,
  error: unknown,
  isEmpty: boolean,
  truncated = false
): QuerySlice<T> {
  return {
    data,
    isLoading,
    isError,
    errorMessage: isError ? (errorMessage(error) ?? 'Something went wrong') : null,
    isEmpty,
    truncated,
  };
}

export function useAsset360ViewModel(): Asset360ViewModel {
  const deps = useContext(Asset360ViewModelContext);
  const { state, updateState } = deps.useAppState();
  const client = deps.useCogniteSdk();
  const searchService = useMemo(() => deps.createSearchService(client), [client, deps]);
  const instanceService = useMemo(() => deps.createInstanceService(client), [client, deps]);
  const relatedService = useMemo(() => deps.createRelatedService(client), [client, deps]);
  const datapointService = useMemo(() => deps.createDatapointService(client, deps.now), [client, deps]);

  const searchQuery = state.searchQuery;
  const selected = state.selected;

  const searchQueryResult = useQuery({
    queryKey: ['asset360', 'search', searchQuery],
    queryFn: () => searchService.search(searchQuery),
    enabled: searchQuery.trim().length > 0,
  });

  const identityQuery = useQuery({
    queryKey: ['asset360', 'identity', selected?.space, selected?.externalId, selected?.kind],
    queryFn: () => {
      if (!selected) {
        throw new Error('No instance selected');
      }
      return instanceService.loadIdentity(selected);
    },
    enabled: selected !== null,
  });

  const timeSeriesQuery = useQuery({
    queryKey: ['asset360', 'timeSeries', selected?.space, selected?.externalId, selected?.kind],
    queryFn: () => {
      if (!selected) {
        throw new Error('No instance selected');
      }
      return relatedService.listTimeSeries(selected);
    },
    enabled: selected !== null,
  });

  const activitiesQuery = useQuery({
    queryKey: ['asset360', 'activities', selected?.space, selected?.externalId, selected?.kind],
    queryFn: () => {
      if (!selected) {
        throw new Error('No instance selected');
      }
      return relatedService.listActivities(selected);
    },
    enabled: selected !== null,
  });

  const filesQuery = useQuery({
    queryKey: ['asset360', 'files', selected?.space, selected?.externalId, selected?.kind],
    queryFn: () => {
      if (!selected) {
        throw new Error('No instance selected');
      }
      return relatedService.listFiles(selected);
    },
    enabled: selected !== null,
  });

  const timeSeries = useMemo(() => timeSeriesQuery.data?.items ?? [], [timeSeriesQuery.data]);
  const chartSeries = useMemo(() => {
    if (timeSeries.length === 0) {
      return null;
    }
    if (state.selectedTimeSeries) {
      const match = timeSeries.find(
        (item) =>
          item.space === state.selectedTimeSeries?.space &&
          item.externalId === state.selectedTimeSeries.externalId
      );
      if (match && isNumericTimeSeries(match)) {
        return match;
      }
    }
    return timeSeries.find(isNumericTimeSeries) ?? null;
  }, [state.selectedTimeSeries, timeSeries]);

  const datapointsQuery = useQuery({
    queryKey: ['asset360', 'datapoints', chartSeries?.space, chartSeries?.externalId, state.timeRangeHours],
    queryFn: () => {
      if (!chartSeries) {
        throw new Error('No time series selected');
      }
      return datapointService.retrieve(chartSeries, state.timeRangeHours);
    },
    enabled: chartSeries !== null,
  });

  const submitSearch = useCallback(
    (query: string) => {
      updateState({ ...state, searchQuery: query.trim() });
    },
    [state, updateState]
  );

  const selectInstance = useCallback(
    (hit: SearchHit) => {
      updateState({
        ...state,
        selected: { space: hit.space, externalId: hit.externalId, kind: hit.kind },
        selectedTimeSeries: null,
        selectedFile: null,
      });
    },
    [state, updateState]
  );

  const clearSelection = useCallback(() => {
    updateState({
      ...state,
      selected: null,
      selectedTimeSeries: null,
      selectedFile: null,
    });
  }, [state, updateState]);

  const selectTimeSeries = useCallback(
    (ref: InstanceRef) => {
      updateState({ ...state, selectedTimeSeries: ref });
    },
    [state, updateState]
  );

  const setTimeRangeHours = useCallback(
    (timeRangeHours: number) => {
      updateState({ ...state, timeRangeHours });
    },
    [state, updateState]
  );

  const selectFile = useCallback(
    (ref: InstanceRef) => {
      updateState({ ...state, selectedFile: ref, relatedTab: 'files' });
    },
    [state, updateState]
  );

  const setRelatedTab = useCallback(
    (relatedTab: RelatedTab) => {
      updateState({ ...state, relatedTab });
    },
    [state, updateState]
  );

  const searchResults = searchQueryResult.data ?? [];
  const identity = identityQuery.data ?? null;
  const activities = activitiesQuery.data?.items ?? [];
  const files = filesQuery.data?.items ?? [];
  const datapoints = datapointsQuery.data ?? [];

  return {
    searchQuery,
    selected,
    timeRangeHours: state.timeRangeHours,
    selectedFile: state.selectedFile,
    relatedTab: state.relatedTab,
    search: slice(
      searchResults,
      searchQueryResult.isLoading,
      searchQueryResult.isError,
      searchQueryResult.error,
      searchQuery.trim().length > 0 && !searchQueryResult.isLoading && searchResults.length === 0
    ),
    identity: slice(
      identity,
      identityQuery.isLoading,
      identityQuery.isError,
      identityQuery.error,
      selected !== null && !identityQuery.isLoading && identity === null && !identityQuery.isError
    ),
    timeSeries: slice(
      timeSeries,
      timeSeriesQuery.isLoading,
      timeSeriesQuery.isError,
      timeSeriesQuery.error,
      selected !== null && !timeSeriesQuery.isLoading && timeSeries.length === 0 && !timeSeriesQuery.isError,
      timeSeriesQuery.data?.truncated === true
    ),
    activities: slice(
      activities,
      activitiesQuery.isLoading,
      activitiesQuery.isError,
      activitiesQuery.error,
      selected !== null && !activitiesQuery.isLoading && activities.length === 0 && !activitiesQuery.isError,
      activitiesQuery.data?.truncated === true
    ),
    files: slice(
      files,
      filesQuery.isLoading,
      filesQuery.isError,
      filesQuery.error,
      selected !== null && !filesQuery.isLoading && files.length === 0 && !filesQuery.isError,
      filesQuery.data?.truncated === true
    ),
    chartSeries,
    datapoints: slice(
      datapoints,
      datapointsQuery.isLoading,
      datapointsQuery.isError,
      datapointsQuery.error,
      chartSeries !== null && !datapointsQuery.isLoading && datapoints.length === 0 && !datapointsQuery.isError
    ),
    client,
    renderFileViewer: deps.renderFileViewer,
    submitSearch,
    selectInstance,
    clearSelection,
    selectTimeSeries,
    setTimeRangeHours,
    selectFile,
    setRelatedTab,
  };
}

export { instanceKey } from '../cdm/parse';
