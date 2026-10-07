import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
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
        // Vendored PDF viewer: importing it loads pdf.js and OOMs happy-dom.
        'src/cognite-file-viewer/CogniteFileViewer.tsx',
        'src/cognite-file-viewer/useViewport.ts',
        'src/asset360/DefaultFileViewer.tsx',
      ],
    },
  },
});
