import { describe, expect, it, vi } from 'vitest';

import { AbortError } from './semaphore';
import {
  DEFAULT_THROTTLE_RETRY,
  delayForThrottle,
  isThrottleError,
  shouldRetryQuery,
  withThrottleRetry,
  type ThrottleRetryDeps,
} from './throttleRetry';

function retryDeps(overrides: Partial<ThrottleRetryDeps> = {}): ThrottleRetryDeps {
  return {
    ...DEFAULT_THROTTLE_RETRY,
    random: () => 0.5,
    sleep: vi.fn(async () => undefined),
    now: () => 1_700_000_000_000,
    ...overrides,
  };
}

describe(isThrottleError.name, () => {
  it('detects a 429 status', () => {
    expect(isThrottleError({ status: 429 })).toBe(true);
    expect(isThrottleError({ statusCode: 429 })).toBe(true);
    expect(isThrottleError({ error: { code: 429 } })).toBe(true);
    expect(isThrottleError(new Error('CDF 429 Too Many Requests'))).toBe(true);
  });

  it('ignores non-throttle errors', () => {
    expect(isThrottleError({ status: 500 })).toBe(false);
    expect(isThrottleError(new Error('identity 404'))).toBe(false);
    expect(isThrottleError('nope')).toBe(false);
  });
});

describe(delayForThrottle.name, () => {
  it('uses Retry-After seconds when present', () => {
    const deps = retryDeps();
    expect(delayForThrottle({ status: 429, headers: { 'retry-after': '2' } }, 0, deps)).toBe(2000);
    expect(delayForThrottle({ status: 429, headers: { 'Retry-After': 3 } }, 0, deps)).toBe(3000);
    expect(
      delayForThrottle({ status: 429, headers: new Headers({ 'Retry-After': '4' }) }, 0, deps)
    ).toBe(4000);
  });

  it('uses a Retry-After HTTP date', () => {
    const deps = retryDeps();
    expect(
      delayForThrottle(
        { status: 429, headers: { 'retry-after': new Date(deps.now() + 2000).toUTCString() } },
        0,
        deps
      )
    ).toBe(2000);
  });

  it('uses full jitter when Retry-After is absent', () => {
    const deps = retryDeps({ random: () => 0.5 });
    expect(delayForThrottle({ status: 429 }, 0, deps)).toBe(125);
    expect(delayForThrottle({ status: 429 }, 2, deps)).toBe(500);
  });
});

describe(withThrottleRetry.name, () => {
  it('retries 429 responses then succeeds', async () => {
    const deps = retryDeps();
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ status: 429 })
      .mockResolvedValueOnce('ok');

    await expect(withThrottleRetry(fn, deps)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(deps.sleep).toHaveBeenCalledTimes(1);
  });

  it('does not retry abort errors', async () => {
    const deps = retryDeps();
    const fn = vi.fn().mockRejectedValue(new AbortError());

    await expect(withThrottleRetry(fn, deps)).rejects.toThrow('Aborted');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(deps.sleep).not.toHaveBeenCalled();
  });

  it('stops after maxAttempts', async () => {
    const deps = retryDeps({ maxAttempts: 3 });
    const fn = vi.fn().mockRejectedValue({ status: 429 });

    await expect(withThrottleRetry(fn, deps)).rejects.toEqual({ status: 429 });
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe(shouldRetryQuery.name, () => {
  it('does not let React Query retry 429s (the task runner already did)', () => {
    expect(shouldRetryQuery(0, { status: 429 })).toBe(false);
    expect(shouldRetryQuery(0, new Error('boom'))).toBe(true);
    expect(shouldRetryQuery(2, new Error('boom'))).toBe(false);
  });
});
