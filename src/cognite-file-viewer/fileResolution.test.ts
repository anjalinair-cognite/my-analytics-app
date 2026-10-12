import type { CogniteClient, FileInfo } from '@cognite/sdk';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearAllFileCache,
  clearFileCache,
  resolveFileDownloadConfig,
} from './fileResolution';

function makeClient(overrides: Record<string, unknown> = {}): CogniteClient {
  return {
    project: 'publicdatacdm',
    post: vi.fn(),
    documents: { preview: { pdfTemporaryLink: vi.fn() } },
    ...overrides,
  } as unknown as CogniteClient;
}

describe(resolveFileDownloadConfig.name, () => {
  afterEach(() => {
    clearAllFileCache();
  });

  it('resolves a native download URL and caches it', async () => {
    const post = vi.fn().mockResolvedValue({
      data: { items: [{ downloadUrl: 'https://files.test/pump.png' }] },
    });
    const client = makeClient({ post });
    const file = { id: 1, name: 'pump.png', mimeType: 'image/png' } as Partial<FileInfo> as FileInfo;

    await expect(resolveFileDownloadConfig(client, file)).resolves.toEqual({
      url: 'https://files.test/pump.png',
      mimeType: 'image/png',
    });
    await expect(resolveFileDownloadConfig(client, file)).resolves.toEqual({
      url: 'https://files.test/pump.png',
      mimeType: 'image/png',
    });
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('uses the document preview API for office files', async () => {
    const pdfTemporaryLink = vi.fn().mockResolvedValue({ temporaryLink: 'https://files.test/doc.pdf' });
    const client = makeClient({
      documents: { preview: { pdfTemporaryLink } },
    });
    const file = { id: 2, name: 'spec.docx' } as Partial<FileInfo> as FileInfo;

    await expect(resolveFileDownloadConfig(client, file)).resolves.toEqual({
      url: 'https://files.test/doc.pdf',
      mimeType: 'application/pdf',
    });
  });

  it('throws when the type is unsupported or the download URL is missing', async () => {
    const client = makeClient({
      post: vi.fn().mockResolvedValue({ data: { items: [{}] } }),
    });
    const zip = { id: 3, name: 'data.bin', mimeType: 'application/octet-stream' } as Partial<FileInfo> as FileInfo;
    await expect(resolveFileDownloadConfig(client, zip)).rejects.toThrow('Unsupported file type');

    const png = { id: 4, name: 'x.png', mimeType: 'image/png' } as Partial<FileInfo> as FileInfo;
    await expect(resolveFileDownloadConfig(client, png)).rejects.toThrow('No download URL');
    clearFileCache(4, 'publicdatacdm');
  });
});
