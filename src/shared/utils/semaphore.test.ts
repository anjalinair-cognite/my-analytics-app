import { describe, expect, it, vi } from 'vitest';

import QueuedTaskRunner, { AbortError } from './semaphore';
import { DEFAULT_THROTTLE_RETRY } from './throttleRetry';

function createRunner(maxConcurrent = 2): QueuedTaskRunner {
  return new QueuedTaskRunner(maxConcurrent, {
    ...DEFAULT_THROTTLE_RETRY,
    sleep: vi.fn(async () => undefined),
    random: () => 0,
  });
}

describe(QueuedTaskRunner.name, () => {
  it('runs at most maxConcurrent tasks at once', async () => {
    const runner = createRunner(1);
    let current = 0;
    let maxSeen = 0;

    async function work(): Promise<number> {
      current += 1;
      maxSeen = Math.max(maxSeen, current);
      await Promise.resolve();
      current -= 1;
      return current;
    }

    await Promise.all([runner.schedule(work), runner.schedule(work), runner.schedule(work)]);
    expect(maxSeen).toBe(1);
  });

  it('aborts a pending task when the same key is scheduled again', async () => {
    const runner = createRunner(1);
    let release: (() => void) | undefined;
    const firstGate = new Promise<void>((resolve) => {
      release = resolve;
    });

    const first = runner.schedule(async () => {
      await firstGate;
      return 'first';
    });
    const stale = runner.schedule(async () => 'stale', { key: 'search' });
    const fresh = runner.schedule(async () => 'fresh', { key: 'search' });

    await expect(stale).rejects.toBeInstanceOf(AbortError);
    release?.();
    await expect(first).resolves.toBe('first');
    await expect(fresh).resolves.toBe('fresh');
  });

  it('retries throttled work through the injected retry deps', async () => {
    const sleep = vi.fn(async () => undefined);
    const runner = new QueuedTaskRunner(1, {
      ...DEFAULT_THROTTLE_RETRY,
      maxAttempts: 3,
      sleep,
      random: () => 0,
    });
    const fn = vi.fn().mockRejectedValueOnce({ status: 429 }).mockResolvedValueOnce('ok');

    await expect(runner.schedule(fn)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it('clears queued work', async () => {
    const runner = createRunner(1);
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    const running = runner.schedule(async () => {
      await gate;
      return 'running';
    });
    const queued = runner.schedule(async () => 'queued');
    runner.clearQueue();
    release?.();

    await expect(running).resolves.toBe('running');
    await expect(Promise.race([queued, Promise.resolve('not-started')])).resolves.toBe('not-started');
  });
});
