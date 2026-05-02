import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import solid from 'vite-plugin-solid'

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
        mock: resolve(__dirname, 'src/mock.ts'),
        mediapipe: resolve(__dirname, 'src/mediapipe.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'solid-js',
        'solid-js/web',
        'solid-js/store',
        /^solid-js\/.+/,
        '@mediapipe/tasks-vision',
      ],
      output: {
        preserveModules: false,
        entryFileNames: '[name].js',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
