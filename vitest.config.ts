import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    environment: 'happy-dom',
    setupFiles: ['tests/setup.ts'],
    threads: false,
    exclude: ['tests/e2e/**', 'node_modules/**']
  }
});
