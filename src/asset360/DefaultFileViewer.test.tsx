import type { CogniteClient } from '@cognite/sdk';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DefaultFileViewer } from './DefaultFileViewer';

describe(DefaultFileViewer.name, () => {
  it('shows the Aura preview skeleton while the file resolves', () => {
    const client = {
      files: {
        retrieve: vi.fn(() => new Promise(() => undefined)),
      },
    } as unknown as CogniteClient;

    render(<DefaultFileViewer space="plant" externalId="pid-1" client={client} />);

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(client.files.retrieve).toHaveBeenCalled();
  });
});
