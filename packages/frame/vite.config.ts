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
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'frame/index': resolve(__dirname, 'src/frame/index.ts'),
        'motion/index': resolve(__dirname, 'src/motion/index.ts'),
        'timeline/index': resolve(__dirname, 'src/timeline/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['solid-js', '@solidjs/web', '@solidjs/signals', /^solid-js\/.+/, /^@solidjs\/.+/],
      output: {
        preserveModules: false,
        entryFileNames: '[name].js',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
