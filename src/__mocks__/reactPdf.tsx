import { useEffect, type ReactNode } from 'react';

export const pdfjs = {
  GlobalWorkerOptions: { workerSrc: '' },
  version: '9.2.1',
};

type DocumentProps = {
  file: string;
  onLoadSuccess?: (info: { numPages: number }) => void;
  onLoadProgress?: (progress: { loaded: number; total: number }) => void;
  loading?: ReactNode;
  error?: ReactNode;
  children?: ReactNode;
};

export function Document({ onLoadSuccess, onLoadProgress, children }: DocumentProps) {
  useEffect(() => {
    onLoadProgress?.({ loaded: 1, total: 1 });
    onLoadSuccess?.({ numPages: 2 });
  }, [onLoadProgress, onLoadSuccess]);
  return <div data-testid="pdf-document">{children}</div>;
}

type PageProps = {
  pageNumber: number;
  width?: number;
  scale?: number;
  rotate?: number;
  onLoadSuccess?: (page: { originalWidth?: number; originalHeight?: number }) => void;
};

export function Page({ pageNumber, onLoadSuccess }: PageProps) {
  useEffect(() => {
    onLoadSuccess?.({ originalWidth: 800, originalHeight: 600 });
  }, [onLoadSuccess]);
  return <div data-testid="pdf-page">{pageNumber}</div>;
}
