import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import solid from 'vite-plugin-solid'

/**
 * creo-ui-web — JS bundle config (Solid component shells)
 *
 * web package は元々 style-dictionary 由来の CSS-only design token + components.css。
 * Phase B (CREO-84) で **shell primitives** (`<CreoFacetGrid>` 等の Solid component) を
 * 追加するため vite を導入、 既存 style-dictionary build とは独立して JS bundle を生成。
 *
 * 出力:
 *   - dist/shells/index.js   (Solid components)
 *   - dist/shells/index.css  (shell CSS、 CSS modules で scope 化)
 *   - dist/shells/index.d.ts (型定義)
 *
 * 既存 dist/{tokens,components,token-shim}.css は style-dictionary が生成、 vite は触らない。
 */
export default defineConfig({
  plugins: [
    solid(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      entryRoot: 'src',
      include: ['src/shells/**/*.ts', 'src/shells/**/*.tsx', 'src/global.d.ts'],
      exclude: ['src/shells/**/*.test.ts', 'src/shells/**/*.test.tsx'],
      rollupTypes: false,
    }),
  ],
  build: {
    target: 'es2022',
    lib: {
      entry: {
        'shells/index': resolve(__dirname, 'src/shells/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['solid-js', 'solid-js/web', 'solid-js/store', /^solid-js\/.+/],
      output: {
        preserveModules: false,
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'shells/index.css'
          return 'shells/[name][extname]'
        },
      },
    },
    // 既存 dist/tokens.css 等を残す
    emptyOutDir: false,
    sourcemap: true,
    cssCodeSplit: false,
  },
  css: {
    modules: {
      generateScopedName: 'creo-shell-[hash:base64:5]',
    },
  },
})
