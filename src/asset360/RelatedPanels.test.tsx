import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { RelatedActivity, RelatedFile, RelatedTimeSeries } from '../cdm/types';

import { RelatedPanels } from './RelatedPanels';
import type { QuerySlice } from './useAsset360ViewModel';

function slice<T>(data: T, isEmpty: boolean): QuerySlice<T> {
  return {
    data,
    isLoading: false,
    isError: false,
    errorMessage: null,
    isEmpty,
  };
}

const emptyTimeSeries = slice<RelatedTimeSeries[]>([], true);
const emptyActivities = slice<RelatedActivity[]>([], true);
const emptyFiles = slice<RelatedFile[]>([], true);

function renderPanels(
  relatedTab: 'timeSeries' | 'activities' | 'files',
  onRelatedTabChange = vi.fn()
) {
  return {
    onRelatedTabChange,
    ...render(
      <RelatedPanels
        hasSelection
        relatedTab={relatedTab}
        onRelatedTabChange={onRelatedTabChange}
        timeSeries={emptyTimeSeries}
        chartSeries={null}
        datapoints={slice([], true)}
        timeRangeHours={24}
        onSelectSeries={vi.fn()}
        onTimeRangeChange={vi.fn()}
        activities={emptyActivities}
        files={emptyFiles}
        selectedFile={null}
        preview={null}
        onSelectFile={vi.fn()}
      />
    ),
  };
}

describe(RelatedPanels.name, () => {
  it('shows the time series panel on the default tab', () => {
    renderPanels('timeSeries');

    expect(screen.getByRole('tab', { name: 'Time series' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('No time series')).toBeInTheDocument();
    expect(screen.queryByText('No activities')).not.toBeInTheDocument();
    expect(screen.queryByText('No files')).not.toBeInTheDocument();
  });

  it('shows work orders when that tab is selected', () => {
    renderPanels('activities');

    expect(screen.getByRole('tab', { name: 'Work orders' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('No activities')).toBeInTheDocument();
    expect(screen.queryByText('No time series')).not.toBeInTheDocument();
  });

  it('shows documents when that tab is selected', () => {
    renderPanels('files');

    expect(screen.getByRole('tab', { name: 'Documents' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('No files')).toBeInTheDocument();
  });

  it('notifies the parent when the user chooses another tab', async () => {
    const user = userEvent.setup();
    const { onRelatedTabChange } = renderPanels('timeSeries');

    await user.click(screen.getByRole('tab', { name: 'Work orders' }));
    expect(onRelatedTabChange).toHaveBeenCalledWith('activities');
  });
});
