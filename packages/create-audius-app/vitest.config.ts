import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/integration/*.test.ts']
  }
})