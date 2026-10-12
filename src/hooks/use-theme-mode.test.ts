import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useThemeMode } from './use-theme-mode';

describe(useThemeMode.name, () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('reads a stored theme', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useThemeMode());
    expect(result.current.mode).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('falls back to the color-scheme preference', () => {
    const { result } = renderHook(() => useThemeMode());
    expect(result.current.mode).toBe('light');
  });

  it('persists a theme change', () => {
    const { result } = renderHook(() => useThemeMode());
    act(() => {
      result.current.setTheme('dark');
    });
    expect(result.current.mode).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
