import { describe, expect, it } from 'vitest';

import { isTruncatedList, readItems, readQueryStep, toError } from './response';

describe('response helpers', () => {
  it('reads items from a list payload', () => {
    expect(readItems({ items: [{ id: 1 }] })).toEqual([{ id: 1 }]);
    expect(readItems({ items: 'nope' })).toEqual([]);
    expect(readItems(null)).toEqual([]);
  });

  it('reads a named query step', () => {
    expect(readQueryStep({ items: { parent: [{ id: 1 }] } }, 'parent')).toEqual([{ id: 1 }]);
    expect(readQueryStep({ items: { parent: 'nope' } }, 'parent')).toEqual([]);
    expect(readQueryStep({ items: [] }, 'parent')).toEqual([]);
    expect(readQueryStep(null, 'parent')).toEqual([]);
  });

  it('wraps unknown errors', () => {
    expect(toError(new Error('boom'), 'fallback').message).toBe('boom');
    expect(toError('nope', 'fallback').message).toBe('fallback');
  });

  it('treats nextCursor or a full page as truncated', () => {
    expect(isTruncatedList({ items: [1, 2], nextCursor: 'abc' }, 100)).toBe(true);
    expect(isTruncatedList({ items: new Array(100).fill(1) }, 100)).toBe(true);
    expect(isTruncatedList({ items: [1], nextCursor: '' }, 100)).toBe(false);
    expect(isTruncatedList(null, 100)).toBe(false);
  });
});
