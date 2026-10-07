import type { ConnectToHostAppResult, HostAppAPI } from '@cognite/app-sdk';
import { CogniteClient } from '@cognite/sdk';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createTestQueryClient,
  makeDatapointService,
  makeInstanceService,
  makeRelatedService,
  makeSearchService,
} from './__mocks__/asset360Harness';
import App from './App';
import { defaultAsset360ViewModelContext } from './asset360/asset360ViewModelContext';
import type { Identity, SearchHit } from './cdm/types';

type AppDeps = NonNullable<ComponentProps<typeof App>['deps']>;

type AppApi = Pick<HostAppAPI, 'syncInternalState'>;

function makeApi(): AppApi {
  return {
    syncInternalState: vi.fn<HostAppAPI['syncInternalState']>(() => Promise.resolve(true)),
  };
}

function makeConnectedFn(api: AppApi = makeApi(), initialState?: string) {
  return vi.fn(() => Promise.resolve({ api, initialState }));
}

function makeDeps(): AppDeps {
  return {
    connectToHostApp: vi.fn<AppDeps['connectToHostApp']>(() =>
      Promise.resolve({
        api: {
          getProject: vi.fn<HostAppAPI['getProject']>(() => Promise.resolve('publicdatacdm')),
          getBaseUrl: vi.fn<HostAppAPI['getBaseUrl']>(() => Promise.resolve('https://cognite.test')),
          getAccessToken: vi.fn<HostAppAPI['getAccessToken']>(() => Promise.resolve('test-token')),
          getAppId: vi.fn<HostAppAPI['getAppId']>(() => Promise.resolve('test-app-id')),
        } as Partial<HostAppAPI> as HostAppAPI,
      })
    ),
    createClient: vi.fn<AppDeps['createClient']>((config) => new CogniteClient(config)),
  };
}

function makeLoadingDeps(): AppDeps {
  return {
    connectToHostApp: vi.fn<AppDeps['connectToHostApp']>(() => new Promise<ConnectToHostAppResult>(() => undefined)),
    createClient: vi.fn<AppDeps['createClient']>((config) => new CogniteClient(config)),
  };
}

const hit: SearchHit = {
  space: 'plant',
  externalId: 'pump-101',
  kind: 'equipment',
  name: 'PUMP-101',
  description: 'Feed pump',
};

const identity: Identity = {
  ...hit,
  parent: null,
  asset: { space: 'plant', externalId: 'loc-1', name: 'Area 12' },
  manufacturer: 'Acme',
  serialNumber: 'SN-1',
};

function renderApp(ui: ReactElement) {
  return render(<QueryClientProvider client={createTestQueryClient()}>{ui}</QueryClientProvider>);
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    renderApp(<App deps={makeLoadingDeps()} connectToHostApp={() => new Promise<never>(() => undefined)} />);
    expect(screen.getByText('Loading project...')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading project' })).toBeInTheDocument();
  });

  it('restores search query and selected instance from host state', async () => {
    const searchService = makeSearchService({ search: vi.fn(async () => [hit]) });
    const instanceService = makeInstanceService({ loadIdentity: vi.fn(async () => identity) });
    const relatedService = makeRelatedService();
    const datapointService = makeDatapointService();

    renderApp(
      <App
        deps={makeDeps()}
        connectToHostApp={makeConnectedFn(
          makeApi(),
          JSON.stringify({
            searchQuery: 'PUMP-101',
            selected: { space: 'plant', externalId: 'pump-101', kind: 'equipment' },
          })
        )}
        viewModelContext={{
          ...defaultAsset360ViewModelContext,
          createSearchService: () => searchService,
          createInstanceService: () => instanceService,
          createRelatedService: () => relatedService,
          createDatapointService: () => datapointService,
          useCogniteSdk: () => ({ project: 'publicdatacdm' }) as never,
          renderFileViewer: ({ externalId }) => <div>File preview {externalId}</div>,
        }}
      />
    );

    await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent('PUMP-101'));
    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());
    expect(screen.getAllByText('Feed pump').length).toBeGreaterThan(0);
  });

  it('shows the host-connect error when connectToHostApp rejects', async () => {
    renderApp(
      <App
        deps={makeDeps()}
        connectToHostApp={() => Promise.reject(new Error('host down'))}
      />
    );

    await waitFor(() => expect(screen.getByText('Failed to connect to Fusion host')).toBeInTheDocument());
  });

  it('shows an error fallback when a render error occurs', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    renderApp(
      <App
        deps={makeDeps()}
        connectToHostApp={makeConnectedFn()}
        viewModelContext={{
          ...defaultAsset360ViewModelContext,
          useAppState: () => {
            throw new Error('Identity panel crashed');
          },
          useCogniteSdk: () => ({ project: 'publicdatacdm' }) as never,
        }}
      />
    );

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Identity panel crashed'));
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
