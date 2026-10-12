import type { CogniteClient } from '@cognite/sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ComponentType, ReactNode } from 'react';
import { vi } from 'vitest';

import {
  Asset360ViewModelContext,
  type Asset360ViewModelContextType,
} from '../asset360/asset360ViewModelContext';
import { AppStateProvider } from '../host/AppStateProvider';
import type { HostApi } from '../host/hostApiContext';
import { HostApiProvider } from '../host/HostApiProvider';
import { useAppState } from '../host/useAppState';
import type { CdmInstanceService } from '../services/cdmInstanceService';
import type { CdmRelatedService } from '../services/cdmRelatedService';
import type { CdmSearchService } from '../services/cdmSearchService';
import type { DatapointService } from '../services/datapointService';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

export function makeHostApi(): HostApi {
  return {
    syncInternalState: vi.fn(() => Promise.resolve(true)),
  };
}

export function makeSearchService(overrides: Partial<CdmSearchService> = {}): CdmSearchService {
  return {
    search: vi.fn(async () => []),
    ...overrides,
  };
}

export function makeInstanceService(overrides: Partial<CdmInstanceService> = {}): CdmInstanceService {
  return {
    loadIdentity: vi.fn(async () => {
      throw new Error('Not implemented');
    }),
    ...overrides,
  };
}

export function makeRelatedService(overrides: Partial<CdmRelatedService> = {}): CdmRelatedService {
  return {
    listTimeSeries: vi.fn(async () => ({ items: [], truncated: false })),
    listActivities: vi.fn(async () => ({ items: [], truncated: false })),
    listFiles: vi.fn(async () => ({ items: [], truncated: false })),
    ...overrides,
  };
}

export function makeDatapointService(overrides: Partial<DatapointService> = {}): DatapointService {
  return {
    retrieve: vi.fn(async () => []),
    ...overrides,
  };
}

type WrapperOptions = {
  initialState?: string;
  api?: HostApi;
  context?: Partial<Asset360ViewModelContextType>;
  queryClient?: QueryClient;
};

export function createAsset360Wrapper(options: WrapperOptions = {}): {
  wrapper: ComponentType<{ children: ReactNode }>;
  api: HostApi;
  context: Asset360ViewModelContextType;
} {
  const api = options.api ?? makeHostApi();
  const context: Asset360ViewModelContextType = {
    useAppState,
    useCogniteSdk: vi.fn(() => ({ project: 'publicdatacdm' }) as Partial<CogniteClient> as CogniteClient),
    createSearchService: () => makeSearchService(),
    createInstanceService: () => makeInstanceService(),
    createRelatedService: () => makeRelatedService(),
    createDatapointService: () => makeDatapointService(),
    now: () => 1_700_000_000_000,
    renderFileViewer: ({ externalId }) => `preview:${externalId}`,
    ...options.context,
  };

  const queryClient = options.queryClient ?? createTestQueryClient();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <HostApiProvider api={api}>
        <AppStateProvider initialState={options.initialState}>
          <Asset360ViewModelContext.Provider value={context}>{children}</Asset360ViewModelContext.Provider>
        </AppStateProvider>
      </HostApiProvider>
    </QueryClientProvider>
  );

  return { wrapper, api, context };
}
