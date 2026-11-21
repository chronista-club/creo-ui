/**
 * timeline を import しただけで DOM に触らないこと (SSR / DOM の無い test から読めること)。
 *
 * Solid は `onPointerDown` 等を document への委譲 (`delegateEvents([...])`) にコンパイルし、
 * それはモジュールの読み込み時に走る。window の無い環境では import だけで落ちる (0.4.0 の不具合)。
 * 実際のビルドと同じ vite + vite-plugin-solid で inspector をビルドし、出力に委譲が無いことを確かめる。
 */

import { describe, expect, it } from 'bun:test'
import { resolve } from 'node:path'
import { build, type Rollup } from 'vite'
import solid from 'vite-plugin-solid'

describe('timeline — import に副作用が無い', () => {
  it('inspector のビルド出力に delegateEvents の呼び出しが無い', async () => {
    const out = (await build({
      configFile: false,
      logLevel: 'silent',
      plugins: [solid()],
      build: {
        write: false,
        minify: false,
        lib: { entry: resolve(import.meta.dir, 'inspector.tsx'), formats: ['es'] },
        rollupOptions: { external: [/^solid-js/] },
      },
    })) as Rollup.RollupOutput[]
    const code = out
      .flatMap((o) => o.output)
      .map((chunk) => ('code' in chunk ? chunk.code : ''))
      .join('\n')
    expect(code).toContain('TimelineInspector')
    expect(code).not.toMatch(/delegateEvents\(/)
  }, 20_000)
})
