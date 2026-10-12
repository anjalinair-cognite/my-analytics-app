import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TextRenderer } from './TextRenderer';

describe(TextRenderer.name, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows loading then the fetched text', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('hello', { status: 200 })))
    );
    render(<TextRenderer url="https://files.test/notes.txt" />);
    expect(screen.getByText('Loading file...')).toBeInTheDocument();
    expect(await screen.findByText('hello')).toBeInTheDocument();
  });

  it('shows an error when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('', { status: 500 })))
    );
    render(<TextRenderer url="https://files.test/notes.txt" />);
    expect(await screen.findByText(/HTTP 500/)).toBeInTheDocument();
  });
});
