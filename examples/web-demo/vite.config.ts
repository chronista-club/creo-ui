import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { creoTokensPlugin } from './creo-tokens-plugin'

export default defineConfig({
  plugins: [
    solid(),
    // dev-only: creoEditor.commitToTokens() から POST を受けて tokens/*.json に書き戻す
    creoTokensPlugin({
      onCommit: (applied) => {
        console.log('[creo-tokens] applied:', applied.map((a) => `${a.id}=${a.value}`).join(', '))
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: false,
  },
})
