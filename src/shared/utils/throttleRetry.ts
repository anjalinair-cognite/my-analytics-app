import { isRecord } from '../../cdm/guards';

export type ThrottleRetryDeps = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  random: () => number;
  sleep: (ms: number) => Promise<void>;
  now: () => number;
};

export const DEFAULT_THROTTLE_RETRY: ThrottleRetryDeps = {
  maxAttempts: 4,
  baseDelayMs: 250,
  maxDelayMs: 8_000,
  random: Math.random,
  sleep: (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    }),
  now: Date.now,
};

function readStatus(error: unknown): number | null {
  if (!isRecord(error)) {
    return null;
  }
  if (typeof error.status === 'number') {
    return error.status;
  }
  if (typeof error.statusCode === 'number') {
    return error.statusCode;
  }
  const nested = error.error;
  if (isRecord(nested) && typeof nested.code === 'number') {
    return nested.code;
  }
  return null;
}

function isHeaderBag(value: unknown): value is { get: (name: string) => string | null } {
  return isRecord(value) && typeof value.get === 'function';
}

function readRetryAfterHeader(error: unknown): string | number | null {
  if (!isRecord(error)) {
    return null;
  }
  const headers = error.headers;
  if (isHeaderBag(headers)) {
    return headers.get('retry-after') ?? headers.get('Retry-After');
  }
  if (!isRecord(headers)) {
    return null;
  }
  const value = headers['retry-after'] ?? headers['Retry-After'];
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  return null;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export function isThrottleError(error: unknown): boolean {
  if (readStatus(error) === 429) {
    return true;
  }
  return error instanceof Error && /\b429\b/.test(error.message);
}

export function delayForThrottle(error: unknown, attempt: number, deps: ThrottleRetryDeps): number {
  const retryAfter = readRetryAfterHeader(error);
  if (typeof retryAfter === 'number' && Number.isFinite(retryAfter)) {
    return retryAfter > 1_000_000 ? Math.max(0, retryAfter - deps.now()) : Math.max(0, retryAfter * 1000);
  }
  if (typeof retryAfter === 'string' && retryAfter.trim().length > 0) {
    const asSeconds = Number(retryAfter);
    if (Number.isFinite(asSeconds)) {
      return Math.max(0, asSeconds * 1000);
    }
    const asDate = Date.parse(retryAfter);
    if (!Number.isNaN(asDate)) {
      return Math.max(0, asDate - deps.now());
    }
  }
  const exponentialCap = Math.min(deps.maxDelayMs, deps.baseDelayMs * 2 ** attempt);
  return deps.random() * exponentialCap;
}

export async function withThrottleRetry<T>(fn: () => Promise<T>, deps: ThrottleRetryDeps): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (isAbortError(error) || !isThrottleError(error) || attempt + 1 >= deps.maxAttempts) {
        throw error;
      }
      const delay = delayForThrottle(error, attempt, deps);
      attempt += 1;
      await deps.sleep(delay);
    }
  }
}

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (isThrottleError(error)) {
    return false;
  }
  return failureCount < 2;
}
