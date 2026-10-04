import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [solid()],
  resolve: { dedupe: ['solid-js'] },
  test: {
    environment: 'happy-dom',
    include: ['tests/components/**/*.test.tsx'],
  },
})
