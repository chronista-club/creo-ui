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
        'registry/system': resolve(__dirname, 'src/registry/system.ts'),
        'registry/status': resolve(__dirname, 'src/registry/status.ts'),
        'registry/editor': resolve(__dirname, 'src/registry/editor.ts'),
        'registry/brand': resolve(__dirname, 'src/registry/brand.ts'),
        'registry/motion': resolve(__dirname, 'src/registry/motion.ts'),
        'registry/flag': resolve(__dirname, 'src/registry/flag.ts'),
        'registry/emoji': resolve(__dirname, 'src/registry/emoji.ts'),
        'registry/filetype': resolve(__dirname, 'src/registry/filetype.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'solid-js',
        'solid-js/web',
        'solid-js/store',
        'solid-js/h',
        /^solid-js\/.+/,
        'iconify-icon',
      ],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
