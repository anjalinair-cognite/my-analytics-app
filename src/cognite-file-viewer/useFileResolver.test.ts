import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { FileSource } from './types';
import { useFileResolver } from './useFileResolver';

const urlSource: FileSource = {
  type: 'url',
  url: 'https://files.test/notes.txt',
  mimeType: 'text/plain',
};

const instanceSource: FileSource = { type: 'instanceId', space: 'plant', externalId: 'pid-1' };

describe(useFileResolver.name, () => {
  it('resolves a direct URL source', async () => {
    const { result } = renderHook(() => useFileResolver(urlSource));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.url).toBe('https://files.test/notes.txt');
    expect(result.current.mimeType).toBe('text/plain');
    expect(result.current.error).toBeNull();
  });

  it('errors when a CDF source is used without a client', async () => {
    const { result } = renderHook(() => useFileResolver(instanceSource));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toMatch(/CogniteClient is required/);
  });
});
