import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Look for tests in the tests folder
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    environment: 'node',
  }
})
