import type { CogniteClient } from '@cognite/sdk';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CogniteFileViewer } from './CogniteFileViewer';
import type { FileSource } from './types';

const hangingClient = {
  files: { retrieve: vi.fn(() => new Promise(() => undefined)) },
} as unknown as CogniteClient;

function urlSource(url: string, mimeType: string): FileSource {
  return { type: 'url', url, mimeType };
}

describe(CogniteFileViewer.name, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the default loading label while resolving', () => {
    render(
      <CogniteFileViewer
        source={{ type: 'instanceId', space: 'plant', externalId: 'pid-1' }}
        client={hangingClient}
      />
    );
    expect(screen.getByText('Loading file...')).toBeInTheDocument();
  });

  it('renders a custom loading fallback', () => {
    render(
      <CogniteFileViewer
        source={{ type: 'instanceId', space: 'plant', externalId: 'pid-1' }}
        client={hangingClient}
        renderLoading={() => <div>Custom loading</div>}
      />
    );
    expect(screen.getByText('Custom loading')).toBeInTheDocument();
  });

  it('renders the PDF document after a URL source resolves', async () => {
    render(
      <CogniteFileViewer
        source={urlSource('https://files.test/doc.pdf', 'application/pdf')}
        onDocumentLoad={vi.fn()}
      />
    );
    expect(await screen.findByTestId('pdf-document')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-page')).toHaveTextContent('1');
  });

  it('renders an image after the blob loads', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(new Blob(['img']), { status: 200 })))
    );
    render(
      <CogniteFileViewer source={urlSource('https://files.test/pump.png', 'image/png')} />
    );
    expect(await screen.findByAltText('')).toBeInTheDocument();
  });

  it('renders text content', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('notes', { status: 200 })))
    );
    render(
      <CogniteFileViewer source={urlSource('https://files.test/notes.txt', 'text/plain')} />
    );
    expect(await screen.findByText('notes')).toBeInTheDocument();
  });

  it('renders the default unsupported message', async () => {
    render(
      <CogniteFileViewer source={urlSource('https://files.test/model.bin', 'application/octet-stream')} />
    );
    expect(await screen.findByText(/Unsupported file type/)).toBeInTheDocument();
  });

  it('renders a custom unsupported fallback', async () => {
    render(
      <CogniteFileViewer
        source={urlSource('https://files.test/model.bin', 'application/octet-stream')}
        renderUnsupported={(mimeType) => <div>Cannot preview {mimeType}</div>}
      />
    );
    expect(await screen.findByText('Cannot preview application/octet-stream')).toBeInTheDocument();
  });

  it('renders a default error when the CDF source has no client', async () => {
    render(
      <CogniteFileViewer source={{ type: 'instanceId', space: 'plant', externalId: 'file-1' }} />
    );
    expect(await screen.findByText(/Failed to load file/)).toBeInTheDocument();
  });

  it('renders a custom error fallback', async () => {
    render(
      <CogniteFileViewer
        source={{ type: 'instanceId', space: 'plant', externalId: 'file-1' }}
        renderError={(error) => <div>Preview failed: {error.message}</div>}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/Preview failed/)).toBeInTheDocument();
    });
  });
});
