import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./client/src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['server/test/**/*.test.ts', 'client/src/**/*.test.{ts,tsx}'],
    pool: 'forks',
    testTimeout: 20_000,
  },
});
