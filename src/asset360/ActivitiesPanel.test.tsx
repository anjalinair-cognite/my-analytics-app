import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { RelatedActivity } from '../cdm/types';

import { ActivitiesPanel } from './ActivitiesPanel';
import type { QuerySlice } from './useAsset360ViewModel';

const activity: RelatedActivity = {
  space: 'plant',
  externalId: 'wo-1',
  name: 'Inspect pump',
  description: 'Routine inspection',
  startTime: Date.UTC(2024, 0, 15, 8, 0, 0),
  endTime: Date.UTC(2024, 0, 15, 12, 0, 0),
};

function slice(overrides: Partial<QuerySlice<RelatedActivity[]>> = {}): QuerySlice<RelatedActivity[]> {
  return {
    data: [],
    isLoading: false,
    isError: false,
    errorMessage: null,
    isEmpty: true,
    ...overrides,
  };
}

describe(ActivitiesPanel.name, () => {
  it('asks the user to select an instance when nothing is selected', () => {
    render(<ActivitiesPanel hasSelection={false} activities={slice()} />);
    expect(screen.getByText('Select an instance to load related activities.')).toBeInTheDocument();
  });

  it('shows an empty state when there are no activities', () => {
    render(<ActivitiesPanel hasSelection activities={slice({ isEmpty: true })} />);
    expect(screen.getByText('No activities')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="empty-state-icon"]')).not.toBeNull();
  });

  it('shows a loading skeleton while work orders load', () => {
    render(<ActivitiesPanel hasSelection activities={slice({ isLoading: true, isEmpty: false })} />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('labels a missing description with a neutral badge', () => {
    render(
      <ActivitiesPanel
        hasSelection
        activities={slice({
          data: [{ ...activity, description: '' }],
          isEmpty: false,
        })}
      />
    );
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('renders work orders in an Aura data grid', () => {
    render(
      <ActivitiesPanel
        hasSelection
        activities={slice({ data: [activity], isEmpty: false })}
      />
    );

    expect(screen.getByRole('table', { name: 'Work orders' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'End' })).toBeInTheDocument();
    expect(screen.getByText('Inspect pump')).toBeInTheDocument();
    expect(screen.getByText('Routine inspection')).toBeInTheDocument();
  });

  it('tells the user when the work-order list is truncated', () => {
    render(
      <ActivitiesPanel
        hasSelection
        activities={slice({ data: [activity], isEmpty: false, truncated: true })}
      />
    );
    expect(screen.getByText('Showing the first 100 related records.')).toBeInTheDocument();
  });
});
