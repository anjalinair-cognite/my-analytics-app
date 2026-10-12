import '@testing-library/jest-dom/vitest';

class ImmediateResizeObserver {
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    this.callback(
      [{ target, contentRect: target.getBoundingClientRect() } as ResizeObserverEntry],
      this
    );
  }

  unobserve(): void {}

  disconnect(): void {}
}

globalThis.ResizeObserver = ImmediateResizeObserver;

for (const prop of ['offsetHeight', 'clientHeight'] as const) {
  Object.defineProperty(HTMLElement.prototype, prop, {
    configurable: true,
    get: () => 400,
  });
}
for (const prop of ['offsetWidth', 'clientWidth'] as const) {
  Object.defineProperty(HTMLElement.prototype, prop, {
    configurable: true,
    get: () => 800,
  });
}
