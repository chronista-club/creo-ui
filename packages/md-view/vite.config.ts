import { resolve } from 'node:path'
import solid from '@solidjs/vite-plugin'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import manifest from './package.json' with { type: 'json' }

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
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'solid-js',
        '@solidjs/web',
        '@solidjs/signals',
        /^solid-js\/.+/,
        /^@solidjs\/.+/,
        ...Object.keys(manifest.dependencies),
      ],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
