import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { SearchHit } from '../cdm/types';

import { SEARCH_DEBOUNCE_MS, SearchPanel } from './SearchPanel';
import type { QuerySlice } from './useAsset360ViewModel';

const hit: SearchHit = {
  space: 'plant',
  externalId: 'pump-101',
  kind: 'equipment',
  name: 'PUMP-101',
  description: 'Feed pump',
};

function idleSearch(data: SearchHit[] = []): QuerySlice<SearchHit[]> {
  return {
    data,
    isLoading: false,
    isError: false,
    errorMessage: null,
    isEmpty: data.length === 0,
  };
}

describe(SearchPanel.name, () => {
  it('type-ahead searches after debounce and selects a ranked hit', async () => {
    const user = userEvent.setup();
    const onSubmitSearch = vi.fn();
    const onSelect = vi.fn();

    const { rerender } = render(
      <SearchPanel
        searchQuery=""
        selectedKey={null}
        selectedLabel={null}
        search={idleSearch()}
        onSubmitSearch={onSubmitSearch}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Search assets and equipment' }));
    await user.type(screen.getByPlaceholderText('Type a tag, name, or alias'), 'PUMP-101');

    await waitFor(
      () => expect(onSubmitSearch).toHaveBeenCalledWith('PUMP-101'),
      { timeout: SEARCH_DEBOUNCE_MS + 500 }
    );

    rerender(
      <SearchPanel
        searchQuery="PUMP-101"
        selectedKey={null}
        selectedLabel={null}
        search={idleSearch([hit])}
        onSubmitSearch={onSubmitSearch}
        onSelect={onSelect}
      />
    );

    expect(screen.getByRole('option', { name: /PUMP-101.*Equipment/ })).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: /PUMP-101/ }));
    expect(onSelect).toHaveBeenCalledWith(hit);
  });

  it('shows a loading state while type-ahead results are in flight', async () => {
    const user = userEvent.setup();
    render(
      <SearchPanel
        searchQuery="pump"
        selectedKey={null}
        selectedLabel={null}
        search={{
          data: [],
          isLoading: true,
          isError: false,
          errorMessage: null,
          isEmpty: false,
        }}
        onSubmitSearch={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Search assets and equipment' }));
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('shows an error in the combobox list', async () => {
    const user = userEvent.setup();
    render(
      <SearchPanel
        searchQuery="pump"
        selectedKey={null}
        selectedLabel={null}
        search={{
          data: [],
          isLoading: false,
          isError: true,
          errorMessage: 'search failed',
          isEmpty: false,
        }}
        onSubmitSearch={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Search assets and equipment' }));
    expect(screen.getByText('search failed')).toBeInTheDocument();
  });
});
