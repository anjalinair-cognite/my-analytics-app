import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ImageRenderer } from './ImageRenderer';

describe(ImageRenderer.name, () => {
  beforeEach(() => {
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
      configurable: true,
      get: () => 200,
    });
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {
      configurable: true,
      get: () => 100,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows a custom error when the blob fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('', { status: 403 })))
    );
    render(
      <ImageRenderer
        url="https://files.test/pump.png"
        renderError={(error) => <div>Image error {error.message}</div>}
      />
    );
    expect(await screen.findByText('Image error HTTP 403')).toBeInTheDocument();
  });

  it('loads the image and renders an overlay', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(new Blob(['img']), { status: 200 })))
    );
    render(
      <ImageRenderer
        url="https://files.test/pump.png"
        rotation={90}
        fitMode="width"
        renderOverlay={() => <div>overlay</div>}
      />
    );
    const img = await screen.findByAltText('');
    fireEvent.load(img);
    expect(await screen.findByText('overlay')).toBeInTheDocument();
  });
});
