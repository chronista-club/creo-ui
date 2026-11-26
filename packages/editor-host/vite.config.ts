import { resolve } from 'node:path'
import solid from '@solidjs/vite-plugin'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    solid(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      rollupTypes: false,
    }),
  ],
  build: {
    target: 'es2022',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['solid-js', '@solidjs/web', '@solidjs/signals', /^solid-js\/.+/, /^@solidjs\/.+/],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
