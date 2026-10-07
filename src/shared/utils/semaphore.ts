import { DEFAULT_THROTTLE_RETRY, withThrottleRetry, type ThrottleRetryDeps } from './throttleRetry';

/**
 * AbortError thrown when a queued task is cancelled
 */
export class AbortError extends Error {
  public constructor(message: string = 'Aborted') {
    super(message);
    this.name = 'AbortError';
  }
}

type PendingTask = {
  run: () => Promise<void>;
  abort: (error: Error) => void;
  key?: string;
};

const DEFAULT_MAX_CONCURRENT_TASKS = 15;

/**
 * QueuedTaskRunner for controlling concurrent operations
 * Used to limit concurrent CDF API requests to avoid rate limiting and deadlocks
 */
export default class QueuedTaskRunner {
  private pendingTasks: PendingTask[] = [];
  private currentPendingTasks = 0;
  private startTime: number | null = null;

  public constructor(
    private readonly maxConcurrentTasks: number = DEFAULT_MAX_CONCURRENT_TASKS,
    private readonly retry: ThrottleRetryDeps = DEFAULT_THROTTLE_RETRY
  ) {}

  public schedule<Result>(fn: () => Promise<Result>, options: { key?: string } = {}): Promise<Result> {
    this.startTrackingTime();

    return new Promise<Result>((resolve, reject) => {
      if (options.key !== undefined) {
        this.pendingTasks
          .filter((task) => task.key === options.key)
          .forEach((task) => {
            task.abort(new AbortError());
          });
        this.pendingTasks = this.pendingTasks.filter((task) => task.key !== options.key);
      }

      this.pendingTasks.push({
        key: options.key,
        abort: reject,
        run: async () => {
          try {
            const result = await withThrottleRetry(fn, this.retry);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
      });

      void this.attemptConsumingNextTask();
    });
  }

  public async attemptConsumingNextTask(): Promise<void> {
    if (this.pendingTasks.length === 0) return;
    if (this.currentPendingTasks >= this.maxConcurrentTasks) return;

    const pendingTask = this.pendingTasks.shift();
    if (pendingTask === undefined) {
      throw new Error('pendingTask is undefined, this should never happen');
    }

    this.currentPendingTasks++;

    try {
      await pendingTask.run();
    } finally {
      this.currentPendingTasks--;
      this.tick();
      void this.attemptConsumingNextTask();
    }
  }

  public clearQueue = (): void => {
    this.pendingTasks = [];
  };

  private startTrackingTime = (): void => {
    if (this.startTime === null) {
      this.startTime = performance.now();
    }
  };

  private tick = (): void => {
    if (this.pendingTasks.length === 0) {
      this.startTime = null;
    }
  };
}

export const cdfTaskRunner = new QueuedTaskRunner(DEFAULT_MAX_CONCURRENT_TASKS);
