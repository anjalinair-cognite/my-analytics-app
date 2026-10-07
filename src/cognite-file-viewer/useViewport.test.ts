import { describe, expect, it } from 'vitest';

import { computeBaseWidth } from './useViewport';

describe(computeBaseWidth.name, () => {
  it('returns the explicit width when fit mode is off', () => {
    expect(computeBaseWidth(undefined, 400, { width: 800, height: 600 }, { width: 100, height: 100 })).toBe(
      400
    );
  });

  it('fits to container width', () => {
    expect(computeBaseWidth('width', 400, { width: 800, height: 600 }, null)).toBe(800);
  });

  it('fits a page into the container', () => {
    expect(computeBaseWidth('page', 400, { width: 800, height: 400 }, { width: 200, height: 100 })).toBe(800);
    expect(computeBaseWidth('page', 400, { width: 400, height: 800 }, { width: 100, height: 200 })).toBe(400);
  });
});
