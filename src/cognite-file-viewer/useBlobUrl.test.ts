import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useBlobUrl } from './useBlobUrl';

describe(useBlobUrl.name, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates an object URL from a successful fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(new Blob(['bytes']), { status: 200 })))
    );
    const { result } = renderHook(() => useBlobUrl('https://files.test/pump.png'));
    await waitFor(() => expect(result.current.blobUrl).toBeTruthy());
    expect(result.current.error).toBeNull();
  });

  it('surfaces HTTP errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('', { status: 404 })))
    );
    const { result } = renderHook(() => useBlobUrl('https://files.test/missing.png'));
    await waitFor(() => expect(result.current.error?.message).toBe('HTTP 404'));
  });

  it('wraps non-Error rejections', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject('offline'))
    );
    const { result } = renderHook(() => useBlobUrl('https://files.test/pump.png'));
    await waitFor(() => expect(result.current.error?.message).toBe('offline'));
  });
});
