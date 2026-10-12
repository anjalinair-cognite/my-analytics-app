import { useEffect, useRef, useState } from 'react';
import type { CogniteClient } from '@cognite/sdk';

import { inferMimeTypeFromUrl } from './mimeTypes';
import { resolveFileDownloadConfig } from './fileResolution';
import type { FileSource, UseFileResolverResult } from './types';

function getSourceKey(source: FileSource): string {
  switch (source.type) {
    case 'instanceId':
      return `inst:${source.space}/${source.externalId}`;
    case 'internalId':
      return `id:${source.id}`;
    case 'url':
      return `url:${source.url}\0${source.mimeType ?? ''}`;
  }
}

const INITIAL: UseFileResolverResult = {
  isLoading: true,
  error: null,
};

export function useFileResolver(
  source: FileSource,
  client?: CogniteClient,
): UseFileResolverResult {
  const [result, setResult] = useState<UseFileResolverResult>(INITIAL);
  const sourceKey = getSourceKey(source);
  const cancelRef = useRef(0);

  useEffect(() => {
    const id = ++cancelRef.current;
    const cancelled = () => id !== cancelRef.current;

    async function resolve() {
      setResult(INITIAL);

      try {
        if (source.type === 'url') {
          const mimeType = source.mimeType ?? inferMimeTypeFromUrl(source.url);
          setResult({
            url: source.url,
            mimeType: mimeType ?? '',
            isLoading: false,
            error: null,
          });
          return;
        }

        if (!client) {
          throw new Error(
            'CogniteClient is required for instanceId and internalId sources',
          );
        }

        const idParam =
          source.type === 'internalId'
            ? { id: source.id }
            : {
                instanceId: {
                  space: source.space,
                  externalId: source.externalId,
                },
              };

        const [fileInfo] = await client.files.retrieve([idParam]);
        if (cancelled()) return;

        const resolved = await resolveFileDownloadConfig(client, fileInfo);
        if (cancelled()) return;

        const instanceId = fileInfo.instanceId
          ? {
              space: fileInfo.instanceId.space,
              externalId: fileInfo.instanceId.externalId,
            }
          : source.type === 'instanceId'
            ? { space: source.space, externalId: source.externalId }
            : undefined;

        setResult({
          url: resolved.url,
          mimeType: resolved.mimeType,
          fileInfo,
          instanceId,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        if (cancelled()) return;
        setResult({
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    }

    void resolve();
  }, [sourceKey, client, source]);

  return result;
}
