import { isRecord } from '../cdm/guards';

export function readItems(response: unknown): unknown[] {
  if (!isRecord(response) || !Array.isArray(response.items)) {
    return [];
  }
  return response.items;
}

export function readQueryStep(response: unknown, step: string): unknown[] {
  if (!isRecord(response) || !isRecord(response.items)) {
    return [];
  }
  const items = response.items[step];
  return Array.isArray(items) ? items : [];
}

export function toError(error: unknown, fallback: string): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallback);
}

export function isTruncatedList(response: unknown, limit: number): boolean {
  if (!isRecord(response)) {
    return false;
  }
  if (typeof response.nextCursor === 'string' && response.nextCursor.length > 0) {
    return true;
  }
  return Array.isArray(response.items) && response.items.length >= limit;
}
