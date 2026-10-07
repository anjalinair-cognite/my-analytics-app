import '@testing-library/jest-dom/vitest';

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
