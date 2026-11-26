import solid from '@solidjs/vite-plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [solid()],
  resolve: { dedupe: ['solid-js', '@solidjs/web'] },
  test: {
    environment: 'happy-dom',
    include: ['tests/components/**/*.test.tsx'],
  },
})
