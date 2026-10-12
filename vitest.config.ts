import path from 'node:path';

import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Lightweight stubs so viewer tests execute production branches without loading pdf.js.
      'react-pdf': path.resolve(__dirname, 'src/__mocks__/reactPdf.tsx'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['vitest.setup.ts'],
    exclude: [...configDefaults.exclude, '.claude/**', '.agents/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'text-summary'],
      all: true,
      thresholds: { lines: 80 },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/vite-env.d.ts',
        'src/main.tsx',
        'src/__mocks__/**',
      ],
    },
  },
});
