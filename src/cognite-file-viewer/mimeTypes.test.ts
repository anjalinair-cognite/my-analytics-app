import { describe, expect, it } from 'vitest';

import {
  doesDocumentPreviewApiSupportFile,
  getComputedMimeType,
  getViewerType,
  inferMimeTypeFromUrl,
  isNativelySupportedMimeType,
} from './mimeTypes';

describe('mimeTypes', () => {
  it('canonicalises aliases and infers from names', () => {
    expect(getComputedMimeType({ mimeType: 'image/jpg' })).toBe('image/jpeg');
    expect(getComputedMimeType({ mimeType: 'image/tif' })).toBe('image/tiff');
    expect(getComputedMimeType({ mimeType: 'image/svg' })).toBe('image/svg+xml');
    expect(getComputedMimeType({ mimeType: 'application/txt' })).toBe('text/plain');
    expect(getComputedMimeType({ name: 'sheet.xlsx' })).toBeUndefined();
    expect(getComputedMimeType({ name: 'photo.PNG' })).toBe('image/png');
    expect(getComputedMimeType({})).toBeUndefined();
    expect(inferMimeTypeFromUrl('https://files.test/doc.pdf?x=1')).toBe('application/pdf');
  });

  it('classifies viewer types', () => {
    expect(getViewerType(undefined)).toBe('unsupported');
    expect(getViewerType('application/pdf')).toBe('pdf');
    expect(getViewerType('image/png')).toBe('image');
    expect(getViewerType('text/plain')).toBe('text');
    expect(getViewerType('application/vnd.ms-excel')).toBe('pdf');
    expect(getViewerType('application/zip')).toBe('unsupported');
    expect(isNativelySupportedMimeType('application/pdf')).toBe(true);
    expect(isNativelySupportedMimeType(null)).toBe(false);
  });

  it('detects document preview support from mime or extension', () => {
    expect(doesDocumentPreviewApiSupportFile({ mimeType: 'application/msword' })).toBe(true);
    expect(doesDocumentPreviewApiSupportFile({ name: 'spec.docx' })).toBe(true);
    expect(doesDocumentPreviewApiSupportFile({ name: 'notes.txt' })).toBe(false);
  });
});
