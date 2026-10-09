import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PanelStatus, TruncationNotice } from './PanelStatus';
import { IdentitySkeleton } from './skeletons';

describe(PanelStatus.name, () => {
  it('shows a loading skeleton instead of a spinner', () => {
    render(
      <PanelStatus
        isLoading
        isError={false}
        errorMessage={null}
        isEmpty={false}
        emptyTitle="Empty"
        emptyDescription="Nothing here"
        skeleton={<IdentitySkeleton />}
      >
        <p>Ready</p>
      </PanelStatus>
    );

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByText('Ready')).not.toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('shows an Aura empty state with an icon', () => {
    render(
      <PanelStatus
        isLoading={false}
        isError={false}
        errorMessage={null}
        isEmpty
        emptyTitle="No activities"
        emptyDescription="This instance has no related activities."
        skeleton={<IdentitySkeleton />}
      >
        <p>Ready</p>
      </PanelStatus>
    );

    expect(screen.getByText('No activities')).toBeInTheDocument();
    expect(screen.getByText('This instance has no related activities.')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="empty-state-icon"]')).not.toBeNull();
  });

  it('shows an error alert', () => {
    render(
      <PanelStatus
        isLoading={false}
        isError
        errorMessage="activities failed"
        isEmpty={false}
        emptyTitle="Empty"
        emptyDescription="Nothing here"
        skeleton={<IdentitySkeleton />}
      >
        <p>Ready</p>
      </PanelStatus>
    );

    expect(screen.getByText('activities failed')).toBeInTheDocument();
  });

  it('shows a truncation notice when the related list was capped', () => {
    render(<TruncationNotice truncated />);
    expect(screen.getByText('Showing the first 100 related records.')).toBeInTheDocument();
  });
});
