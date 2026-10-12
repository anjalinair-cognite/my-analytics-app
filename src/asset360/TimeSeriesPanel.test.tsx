import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { RelatedTimeSeries } from '../cdm/types';

import { TimeSeriesPanel } from './TimeSeriesPanel';
import type { QuerySlice } from './useAsset360ViewModel';

function slice<T>(overrides: Partial<QuerySlice<T>> & { data: T }): QuerySlice<T> {
  return {
    isLoading: false,
    isError: false,
    errorMessage: null,
    isEmpty: false,
    ...overrides,
  };
}

describe(TimeSeriesPanel.name, () => {
  it('shows an empty state when nothing is selected', () => {
    render(
      <TimeSeriesPanel
        hasSelection={false}
        timeSeries={slice({ data: [] })}
        chartSeries={null}
        datapoints={slice({ data: [] })}
        timeRangeHours={24}
        onSelectSeries={vi.fn()}
        onTimeRangeChange={vi.fn()}
      />
    );
    expect(screen.getByText('Select an instance to load related time series.')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="empty-state"]')).not.toBeNull();
  });

  it('shows a loading skeleton while time series load', () => {
    render(
      <TimeSeriesPanel
        hasSelection
        timeSeries={slice({ data: [], isLoading: true })}
        chartSeries={null}
        datapoints={slice({ data: [] })}
        timeRangeHours={24}
        onSelectSeries={vi.fn()}
        onTimeRangeChange={vi.fn()}
      />
    );
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('shows an empty state when there are no time series', () => {
    render(
      <TimeSeriesPanel
        hasSelection
        timeSeries={slice({ data: [], isEmpty: true })}
        chartSeries={null}
        datapoints={slice({ data: [] })}
        timeRangeHours={24}
        onSelectSeries={vi.fn()}
        onTimeRangeChange={vi.fn()}
      />
    );
    expect(screen.getByText('No time series')).toBeInTheDocument();
  });

  it('renders a series name when time series exist', () => {
    const series: RelatedTimeSeries = {
      space: 'plant',
      externalId: 'ts-1',
      name: 'Flow',
      description: '',
      type: 'numeric',
      isStep: false,
      sourceUnit: 'm3/h',
    };
    render(
      <TimeSeriesPanel
        hasSelection
        timeSeries={slice({ data: [series] })}
        chartSeries={series}
        datapoints={slice({ data: [{ timestamp: 1, value: 10 }] })}
        timeRangeHours={24}
        onSelectSeries={vi.fn()}
        onTimeRangeChange={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /Flow/ })).toBeInTheDocument();
    expect(screen.getByText('numeric')).toBeInTheDocument();
    expect(screen.getByText('m3/h')).toBeInTheDocument();
    expect(screen.getByLabelText('Flow datapoints')).toBeInTheDocument();
  });

  it('lets the user pick a series and time range', async () => {
    const user = userEvent.setup();
    const onSelectSeries = vi.fn();
    const onTimeRangeChange = vi.fn();
    const series: RelatedTimeSeries = {
      space: 'plant',
      externalId: 'ts-1',
      name: 'Flow',
      description: '',
      type: 'numeric',
      isStep: false,
      sourceUnit: '',
    };
    render(
      <TimeSeriesPanel
        hasSelection
        timeSeries={slice({ data: [series] })}
        chartSeries={series}
        datapoints={slice({ data: [{ timestamp: 1, value: 10 }] })}
        timeRangeHours={24}
        onSelectSeries={onSelectSeries}
        onTimeRangeChange={onTimeRangeChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /Flow/ }));
    expect(onSelectSeries).toHaveBeenCalledWith(series);
    await user.click(screen.getByText('Last 7 days'));
    expect(onTimeRangeChange).toHaveBeenCalledWith(168);
  });

  it('shows an empty chart state when no numeric series exists', () => {
    const series: RelatedTimeSeries = {
      space: 'plant',
      externalId: 'ts-s',
      name: 'Status',
      description: '',
      type: 'string',
      isStep: false,
      sourceUnit: '',
    };
    render(
      <TimeSeriesPanel
        hasSelection
        timeSeries={slice({ data: [series] })}
        chartSeries={null}
        datapoints={slice({ data: [] })}
        timeRangeHours={24}
        onSelectSeries={vi.fn()}
        onTimeRangeChange={vi.fn()}
      />
    );
    expect(screen.getByText('No numeric time series is available to chart.')).toBeInTheDocument();
  });
});
