import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Identity } from '../cdm/types';

import { IdentityCard } from './IdentityCard';
import type { QuerySlice } from './useAsset360ViewModel';

const identity: Identity = {
  space: 'plant',
  externalId: 'pump-101',
  kind: 'equipment',
  name: 'PUMP-101',
  description: 'Feed pump',
  parent: null,
  asset: { space: 'plant', externalId: 'loc-1', name: 'Area 12' },
  manufacturer: 'Acme',
  serialNumber: 'SN-1',
};

function slice(overrides: Partial<QuerySlice<Identity | null>> = {}): QuerySlice<Identity | null> {
  return {
    data: null,
    isLoading: false,
    isError: false,
    errorMessage: null,
    isEmpty: false,
    ...overrides,
  };
}

describe(IdentityCard.name, () => {
  it('shows an empty state when nothing is selected', () => {
    render(<IdentityCard hasSelection={false} identity={slice()} />);
    expect(screen.getByText('No instance selected')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="empty-state-icon"]')).not.toBeNull();
  });

  it('shows a loading skeleton while identity loads', () => {
    render(<IdentityCard hasSelection identity={slice({ isLoading: true })} />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('renders identity fields when loaded', () => {
    render(<IdentityCard hasSelection identity={slice({ data: identity })} />);
    expect(screen.getByText('PUMP-101')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Equipment')).toBeInTheDocument();
  });
});
