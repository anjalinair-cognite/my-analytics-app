import { useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const isDark = mode === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [mode]);

  return {
    mode,
    isDark: mode === 'dark',
    setTheme: (next: ThemeMode) => {
      setMode(next);
    },
  };
}
