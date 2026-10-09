import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { RelatedFile } from '../cdm/types';

import { FilesPanel } from './FilesPanel';
import type { QuerySlice } from './useAsset360ViewModel';

const file: RelatedFile = {
  space: 'plant',
  externalId: 'pid-1',
  name: 'P&ID sheet',
  description: '',
  mimeType: 'application/pdf',
  isUploaded: true,
};

function slice(overrides: Partial<QuerySlice<RelatedFile[]>> = {}): QuerySlice<RelatedFile[]> {
  return {
    data: [],
    isLoading: false,
    isError: false,
    errorMessage: null,
    isEmpty: true,
    ...overrides,
  };
}

describe(FilesPanel.name, () => {
  it('asks the user to select an instance when nothing is selected', () => {
    render(
      <FilesPanel
        hasSelection={false}
        files={slice()}
        selectedFile={null}
        preview={null}
        onSelectFile={vi.fn()}
      />
    );
    expect(screen.getByText('Select an instance to load related files.')).toBeInTheDocument();
  });

  it('shows an empty state when there are no files', () => {
    render(
      <FilesPanel
        hasSelection
        files={slice({ isEmpty: true })}
        selectedFile={null}
        preview={null}
        onSelectFile={vi.fn()}
      />
    );
    expect(screen.getByText('No files')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="empty-state-icon"]')).not.toBeNull();
  });

  it('shows a loading skeleton while documents load', () => {
    render(
      <FilesPanel
        hasSelection
        files={slice({ isLoading: true, isEmpty: false })}
        selectedFile={null}
        preview={null}
        onSelectFile={vi.fn()}
      />
    );
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('renders documents in an Aura data grid and previews a selected file', async () => {
    const user = userEvent.setup();
    const onSelectFile = vi.fn();
    render(
      <FilesPanel
        hasSelection
        files={slice({ data: [file], isEmpty: false })}
        selectedFile={null}
        preview={null}
        onSelectFile={onSelectFile}
      />
    );

    expect(screen.getByRole('table', { name: 'Documents' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Type' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Preview' })).toBeInTheDocument();
    expect(screen.getByText('P&ID sheet')).toBeInTheDocument();
    expect(screen.getByText('application/pdf')).toBeInTheDocument();
    expect(screen.getByText('Uploaded')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Preview P&ID sheet' }));
    expect(onSelectFile).toHaveBeenCalledWith(file);
  });

  it('labels an unpublished file with a status badge', () => {
    render(
      <FilesPanel
        hasSelection
        files={slice({
          data: [{ ...file, isUploaded: false, mimeType: '' }],
          isEmpty: false,
        })}
        selectedFile={null}
        preview={null}
        onSelectFile={vi.fn()}
      />
    );
    expect(screen.getByText('Not uploaded')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
