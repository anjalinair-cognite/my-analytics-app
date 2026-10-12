import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  createAsset360Wrapper,
  makeDatapointService,
  makeInstanceService,
  makeRelatedService,
  makeSearchService,
} from '../__mocks__/asset360Harness';
import type { Identity, SearchHit } from '../cdm/types';

import { Asset360Page } from './Asset360Page';

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

describe(Asset360Page.name, () => {
  it('shows identity after searching and selecting a result', async () => {
    const user = userEvent.setup();
    const searchService = makeSearchService({ search: vi.fn(async () => [hit]) });
    const instanceService = makeInstanceService({ loadIdentity: vi.fn(async () => identity) });
    const { wrapper } = createAsset360Wrapper({
      context: {
        createSearchService: () => searchService,
        createInstanceService: () => instanceService,
        createRelatedService: () =>
          makeRelatedService({
            listTimeSeries: vi.fn(async () => ({ items: [], truncated: false })),
            listActivities: vi.fn(async () => ({ items: [], truncated: false })),
            listFiles: vi.fn(async () => ({ items: [], truncated: false })),
          }),
      },
    });

    render(<Asset360Page />, { wrapper });

    await user.click(screen.getByRole('combobox', { name: 'Search assets and equipment' }));
    await user.type(screen.getByPlaceholderText('Type a tag, name, or alias'), 'PUMP-101');

    await waitFor(() => expect(screen.getByRole('option', { name: /PUMP-101/ })).toBeInTheDocument());
    await user.click(screen.getByRole('option', { name: /PUMP-101/ }));

    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());
    expect(screen.getByRole('tab', { name: 'Time series' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('No time series')).toBeInTheDocument();
    expect(screen.queryByText('No activities')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Work orders' }));
    expect(screen.getByText('No activities')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Documents' }));
    expect(screen.getByText('No files')).toBeInTheDocument();
  });

  it('shows an error in the activities panel independently', async () => {
    const { wrapper } = createAsset360Wrapper({
      initialState: JSON.stringify({
        selected: { space: 'plant', externalId: 'pump-101', kind: 'equipment' },
        relatedTab: 'activities',
      }),
      context: {
        createInstanceService: () => makeInstanceService({ loadIdentity: vi.fn(async () => identity) }),
        createRelatedService: () =>
          makeRelatedService({
            listActivities: vi.fn(async () => {
              throw new Error('activities failed');
            }),
          }),
      },
    });

    render(<Asset360Page />, { wrapper });

    await waitFor(() => expect(screen.getByText('activities failed')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());
  });

  it('charts datapoints when a numeric series exists', async () => {
    const { wrapper } = createAsset360Wrapper({
      initialState: JSON.stringify({
        selected: { space: 'plant', externalId: 'pump-101', kind: 'equipment' },
      }),
      context: {
        createInstanceService: () => makeInstanceService({ loadIdentity: vi.fn(async () => identity) }),
        createRelatedService: () =>
          makeRelatedService({
            listTimeSeries: vi.fn(async () => ({
              items: [
                {
                  space: 'plant',
                  externalId: 'ts-1',
                  name: 'Flow',
                  description: '',
                  type: 'numeric',
                  isStep: false,
                  sourceUnit: 'm3/h',
                },
              ],
              truncated: false,
            })),
          }),
        createDatapointService: () =>
          makeDatapointService({
            retrieve: vi.fn(async () => [{ timestamp: 1_700_000_000_000, value: 42 }]),
          }),
      },
    });

    render(<Asset360Page />, { wrapper });

    await waitFor(() => expect(screen.getByLabelText('Flow datapoints')).toBeInTheDocument());
  });

  it('opens a file preview when Preview is clicked', async () => {
    const user = userEvent.setup();
    const { wrapper } = createAsset360Wrapper({
      initialState: JSON.stringify({
        selected: { space: 'plant', externalId: 'pump-101', kind: 'equipment' },
      }),
      context: {
        createInstanceService: () => makeInstanceService({ loadIdentity: vi.fn(async () => identity) }),
        createRelatedService: () =>
          makeRelatedService({
            listFiles: vi.fn(async () => ({
              items: [
                {
                  space: 'plant',
                  externalId: 'pid-1',
                  name: 'P&ID sheet',
                  description: '',
                  mimeType: 'application/pdf',
                  isUploaded: true,
                },
              ],
              truncated: false,
            })),
          }),
        renderFileViewer: ({ externalId }) => <div>File preview {externalId}</div>,
      },
    });

    render(<Asset360Page />, { wrapper });

    await user.click(screen.getByRole('tab', { name: 'Documents' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Preview P&ID sheet' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Preview P&ID sheet' }));
    expect(screen.getByText('File preview pid-1')).toBeInTheDocument();
  });
});
