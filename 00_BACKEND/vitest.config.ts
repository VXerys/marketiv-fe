import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['node_modules', 'functions', 'tests/e2e', 'src'],
    setupFiles: ['./tests/setup.ts'],
  },
});
