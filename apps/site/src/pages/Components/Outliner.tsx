import { CUOutliner, type OutlinerNode } from '@chronista-club/creo-ui/controls'
import { createSignal } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'

const PROPS = [
  {
    attr: 'nodes / defaultNodes',
    values: 'OutlinerNode[]',
    def: '[]',
    meaning: 'nodes を渡せば controlled (木の所有権は consumer)、 defaultNodes なら内部 signal',
  },
  {
    attr: 'onChange',
    values: '(nodes: OutlinerNode[]) => void',
    def: '—',
    meaning: '木が変わるたび発火。 controlled / uncontrolled どちらでも呼ばれる',
  },
  {
    attr: 'data-variant',
    values: 'plain / card',
    def: 'plain',
    meaning: 'card は Item を面として立てる (surface + border + elevation)',
  },
  {
    attr: 'guides',
    values: '(boolean)',
    def: 'false',
    meaning: 'インデントの縦ガイド線。 深い階層で「どの枝の子か」を読めるようにする',
  },
  {
    attr: 'renderMeta',
    values: '(node) => JSX.Element',
    def: 'node.meta を文字列表示',
    meaning: '右端 slot。 badge / 日付 / 件数などを差せる',
  },
  {
    attr: '--outliner-depth',
    values: '(number、 inline style)',
    def: '0',
    meaning: 'CSS-only 利用時に行の深さを渡す custom property。 primitive は自動で付ける',
  },
] as const

const TOKENS = [
  { slot: 'インデント 1 段', token: 'spacing.l (--outliner-indent で上書き可)' },
  { slot: 'row padding', token: 'spacing.xs × spacing.s (× density scale)' },
  { slot: 'hover / press', token: 'surface-veil-1 / surface-veil-2 (press 語彙)' },
  { slot: '畳んだ行の bullet', token: 'surface-veil-3 + radius.full' },
  { slot: 'card variant', token: 'color.surface.surface + radius.s + elevation-1' },
  { slot: 'twisty rotate', token: 'motion.mapping.toggle (accordion の chevron と同方向)' },
  { slot: 'meta (右端)', token: 'typography.size.s + color.text.tertiary' },
] as const

const KEYS = [
  { key: 'Enter', act: '同じ深さに新しい行' },
  { key: 'Tab / Shift+Tab', act: '1 段深く / 1 段浅く' },
  { key: '↑ ↓', act: '行間を移動 (畳んだ枝は飛ばす)' },
  { key: '⌥↑ ⌥↓', act: '行ごと上下に入れ替え (親はまたがない)' },
  { key: 'Backspace', act: '空行を削って上へ (子を持つ行は消さない)' },
  { key: '▸ click', act: '折りたたみ' },
] as const

const IDEAS: OutlinerNode[] = [
  {
    id: 'i1',
    text: 'creo-ui でやりたいこと',
    children: [
      { id: 'i2', text: 'token を演奏できるようにする', meta: '構想' },
      {
        id: 'i3',
        text: 'demo を常駐させる',
        meta: '完了',
        done: true,
        children: [{ id: 'i4', text: '名前でアクセスする', meta: '完了', done: true }],
      },
      { id: 'i5', text: 'Outliner を作る', meta: 'いま' },
    ],
  },
  { id: 'i6', text: 'あとで考える', children: [{ id: 'i7', text: 'drag での並べ替え' }] },
]

const TASKS: OutlinerNode[] = [
  {
    id: 'c1',
    text: 'release cut',
    meta: '3',
    children: [
      { id: 'c2', text: 'bump + CHANGELOG', meta: '完了', done: true },
      { id: 'c3', text: 'main へ promote', meta: '進行中' },
      { id: 'c4', text: 'npm 反映を見届ける', meta: '明日' },
    ],
  },
]

export default function Outliner() {
  const [nodes, setNodes] = createSignal<OutlinerNode[]>(IDEAS)

  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Outliner</h1>
        <p class="docs-page-lead">
          <code>List&lt;List&lt;Item&gt;&gt;</code> を任意の深さで畳める階層リスト。 1 行 = テキスト
          + 右端 slot。 「思い立った時に足せる」ことが主目的なので、 行の追加・インデントは全て
          keyboard で完結する (<kbd>Enter</kbd> / <kbd>Tab</kbd>)。 DOM は flat +{' '}
          <code>role="tree"</code>、 深さは <code>--outliner-depth</code> で CSS に渡す。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          行を click して直接書ける。 <kbd>Enter</kbd> で次の行、 <kbd>Tab</kbd> で 1 段深く、{' '}
          <kbd>⌥↑</kbd> <kbd>⌥↓</kbd> で行ごと入れ替え。 ▸ を押すと畳める (畳んだ行の bullet
          は塗りが濃くなる)。
        </p>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Default (plain) + guides</div>
          <CUOutliner nodes={nodes()} onChange={setNodes} guides />

          <div class="docs-preview-row-label">Card variant</div>
          <CUOutliner defaultNodes={TASKS} variant="card" />

          <div class="docs-preview-row-label">空から始める (capture)</div>
          <CUOutliner defaultNodes={[]} addLabel="思いついたことを書く" />
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Keyboard</h2>
        <div class="docs-table-scroll">
          <table class="creo-table">
            <thead>
              <tr>
                <th>キー</th>
                <th>動作</th>
              </tr>
            </thead>
            <tbody>
              {KEYS.map((k) => (
                <tr>
                  <td>
                    <kbd>{k.key}</kbd>
                  </td>
                  <td>{k.act}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">SolidJS API</h2>
        <pre class="docs-code">
          <code>{`import { CUOutliner, type OutlinerNode } from '@chronista-club/creo-ui/controls'

const [nodes, setNodes] = createSignal<OutlinerNode[]>([
  { id: '1', text: '思いついたこと', children: [{ id: '2', text: '細かいこと' }] },
])

<CUOutliner nodes={nodes()} onChange={setNodes} variant="card" guides />`}</code>
        </pre>
        <p class="docs-page-helper">
          木の書き換え (<code>indent</code> / <code>outdent</code> / <code>moveUp</code> 等)
          は純関数 として同じ subpath から export している。 独自 UI
          から同じ操作を呼びたい場合に使える。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">CSS-only</h2>
        <p class="docs-page-helper">
          keyboard 操作が要らない (表示だけの) 場合は class だけで組める。 深さは{' '}
          <code>--outliner-depth</code> を inline style で渡す。
        </p>
        <pre class="docs-code">
          <code>{`<div class="creo-outliner" data-guides role="tree">
  <div class="creo-outliner-row" style="--outliner-depth: 0" role="treeitem" aria-level="1">
    <button class="creo-outliner-twisty" aria-label="折りたたむ">›</button>
    <span class="creo-outliner-bullet" aria-hidden="true">•</span>
    <input class="creo-outliner-text" value="親" />
    <span class="creo-outliner-meta">3</span>
  </div>
  <div class="creo-outliner-row" style="--outliner-depth: 1" role="treeitem" aria-level="2">
    <button class="creo-outliner-twisty" data-placeholder tabindex="-1"></button>
    <span class="creo-outliner-bullet" aria-hidden="true">•</span>
    <input class="creo-outliner-text" value="子" />
  </div>
</div>`}</code>
        </pre>
      </section>

      <PropsTable rows={PROPS} />
      <TokensTable rows={TOKENS} />
    </>
  )
}
