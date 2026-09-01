import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/firestore/**/*.spec.ts'],
    testTimeout: 15_000,
  },
});
