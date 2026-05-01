import { A } from '@solidjs/router'
import { For, type JSX } from 'solid-js'

const DECISIONS = [
  { id: 'D-1', topic: 'Editor の粒度', decision: 'Mode (universal state) — instance 命名は使わない' },
  {
    id: 'D-2',
    topic: '4 方向 semantic layout',
    decision: 'TOP (global) / LEFT (source・過去) / RIGHT (tool・未来) / BOTTOM (utility)',
  },
  {
    id: 'D-3',
    topic: '2 軸の意味',
    decision: '水平=時系列 (左→右: 過去→未来) / 垂直=階層 (上=グローバル, 下=ローカル)',
  },
  {
    id: 'D-4',
    topic: 'Field 宣言',
    decision: 'id / label / type / semantic / group / bind / persistence / role / order?',
  },
  { id: 'D-5', topic: 'Field source', decision: 'あらかじめ (framework) + カスタム (app-specific) の 2 ルート' },
  { id: 'D-6', topic: '非侵襲性', decision: 'Editor Layer は Content の座標・可視性・操作を奪わない' },
  {
    id: 'D-7',
    topic: 'Mode toggle',
    decision: '手動のみ (keyboard / floating button / programmatic API / MCP)、 自動 ON なし',
  },
  { id: 'D-8', topic: 'Mode OFF の挙動', decision: 'Editor Layer 完全不可視、 field 値は保持' },
  {
    id: 'D-9',
    topic: 'Reactive 反映',
    decision: 'field 変更が bind 先 (token / state / prop) に即反映、 Content が再描画',
  },
  { id: 'D-10', topic: 'AI agent access', decision: '同 protocol を MCP 経由で (enter/select/set/subscribe/exit)' },
  { id: 'D-11', topic: 'Protocol owner', decision: 'Creo UI (schema + TS 型 + JSON schema)、 実装は consumer 側' },
  {
    id: 'D-12',
    topic: '段階',
    decision: 'Phase 1 = 設計 memo + tokens / Phase 2 = Web 実装 + MCP / Phase 3+ = Swift / theme 切替',
  },
] as const

export default function EditorMode() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Concepts</p>
        <h1>Editor Mode protocol</h1>
        <p class="docs-page-lead">
          Creo ecosystem の任意の app において、 mutable な field を「選んで live 編集」 できる
          ユニバーサルな UI 状態。 Studio / DevEditor 等の instance ではなく、 全 app が持つ
          <strong> mode (状態)</strong>。 schema は Creo UI が owner、 runtime 実装は consumer
          (<code>creo-ui-editor-host</code> for Web、 将来 Swift / Rust)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">何を解決するか</h2>
        <p class="docs-page-helper">
          多くの app は「設定画面」 や「dev tools」 を別 page として持つ。 これは:
        </p>
        <ul class="docs-bullet-list">
          <li>page 切替の cognitive break — 実装中の content から離れて設定画面に行き、 戻る</li>
          <li>app ごとに異なる UX — 同じ意味の設定なのに app A と B で UI が違う</li>
          <li>AI agent 不在 — 人間の hand-driven UI で agent が field を触れない</li>
        </ul>
        <p class="docs-page-helper">
          Editor Mode はこれを <strong>universal overlay protocol</strong> として解決:
        </p>
        <ul class="docs-bullet-list">
          <li>Content layer の上に <strong>4 方向 overlay</strong> として展開 — 別 page に行かない</li>
          <li>field 宣言と layout を <strong>schema として規定</strong> — 全 app で同じ操作感</li>
          <li>同 protocol を MCP で expose — AI agent が同じく field 操作可能</li>
        </ul>
      </section>

      <Decision number="D-1" title="Editor の粒度 — Mode であって Instance ではない">
        <h3>Why</h3>
        <p>
          「Studio」 「DevEditor」 等の <strong>instance 命名</strong> は app ごとに分裂を招く。 Studio の Editor と
          DevEditor の Editor が「似てるけど違う」 と分岐すると、 共通体験が崩壊する。 また AI agent
          視点でも instance ごとに違う protocol を学習する負債が出る。
        </p>
        <h3>How it shows up</h3>
        <p>
          Creo UI は <code>EditorMode</code> 1 概念のみ規定。 各 app は「Editor Mode を持つ」 と表現するだけで、
          UI / protocol / MCP API は共通。 instance 名 (Studio など) を Editor の修飾子に使うのを禁止。
        </p>
      </Decision>

      <Decision number="D-6" title="非侵襲性 — Content を一切触らない">
        <h3>Why</h3>
        <p>
          Editor Layer が Content の座標を変えると 「Editor ON にしたら layout が崩れた」 という最悪の体験。
          dev tools が「触ると壊れる」 場所になり、 開発者 / designer が Editor Mode を恐れる。 結果、 機能が使われない。
        </p>
        <h3>How it shows up</h3>
        <p>
          Editor Layer は <strong>position: fixed の overlay のみ</strong>。 Content Layer の DOM /
          z-index / scroll を一切変更しない。 ON / OFF を切替えても Content の reflow ゼロ。
          詳しくは <A href="/concepts/layers">Layers</A>。
        </p>
      </Decision>

      <Decision number="D-7" title="Mode toggle — 手動のみ、 自動 ON なし">
        <h3>Why</h3>
        <p>
          自動 ON (例: dev 環境で常時 ON) は 「いつのまにか UI が変わってる」 という驚きを生む。
          AI agent の操作で勝手に ON になるのも危険 — 編集してるつもりの無い user の content を
          意図せず変える事故が起きる。
        </p>
        <h3>How it shows up</h3>
        <p>
          ON 経路は明示的 4 つのみ: keyboard shortcut (<code>Ctrl+Shift+E</code>)、 floating button、
          programmatic <code>host.mode.enable()</code>、 MCP <code>editor_mode_enter</code>。 dev /
          production 区別なし、 user 意思のみで切替。
        </p>
      </Decision>

      <Decision number="D-11" title="Protocol owner — Creo UI が schema、 consumer が runtime">
        <h3>Why</h3>
        <p>
          Schema (field 宣言、 layout 規約、 MCP API) を Creo UI が独占的に決めることで、 platform 横断の
          一貫性を担保。 runtime 実装は platform に最適化したい (Web は SolidJS、 Swift は SwiftUI、 Rust は
          ratatui) ので consumer 側が持つ。
        </p>
        <h3>How it shows up</h3>
        <p>
          Creo UI repo: <code>tokens/editor-mode/</code> + <code>docs/design/editor-mode.md</code>。
          Web runtime: <code>packages/editor-host/</code> (creo-ui-editor-host npm)。
          Swift / Rust runtime: 将来別 package。
        </p>
      </Decision>

      <section>
        <h2 class="docs-section-title">All decisions (D-1 〜 D-12)</h2>
        <div class="docs-decision-table">
          <div class="docs-decision-row docs-decision-head">
            <div>#</div>
            <div>Topic</div>
            <div>Decision</div>
          </div>
          <For each={DECISIONS}>
            {(d) => (
              <div class="docs-decision-row">
                <code class="docs-decision-id">{d.id}</code>
                <div class="docs-decision-topic">{d.topic}</div>
                <div class="docs-decision-text">{d.decision}</div>
              </div>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">実装 — creo-ui-editor-host (Web reference)</h2>
        <p class="docs-page-helper">
          SolidJS で書かれた Web reference runtime。 <code>EditorHostProvider</code> + <code>EditorLayer</code> +
          <code>bind()</code> + Console REPL (<code>window.creoEditor</code>) + Auto-discover + URL share +
          Cross-tab sync を提供。 <A href="/playground">Playground</A> で実演。
        </p>
        <pre class="docs-code">
          <code>{`import { EditorHostProvider, EditorLayer, bind, number, cssVarNumberTarget } from 'creo-ui-editor-host'

bind({
  id: 'tokens.spacing.md',
  control: number({ variant: 'slider' }),
  target: cssVarNumberTarget('--spacing-md', { min: 0, max: 48, unit: 'px' }),
  initial: 18,
  semantic: 'tool',
})

<EditorHostProvider config={{ exposeConsole: true }}>
  <App />
  <EditorLayer />
</EditorHostProvider>`}</code>
        </pre>
      </section>
    </>
  )
}

interface DecisionProps {
  number: string
  title: string
  children: JSX.Element
}

function Decision(props: DecisionProps) {
  return (
    <section class="docs-principle">
      <header class="docs-principle-head">
        <span class="docs-principle-number" aria-hidden="true">
          {props.number}
        </span>
        <h2 class="docs-principle-title">{props.title}</h2>
      </header>
      <div class="docs-principle-body">{props.children}</div>
    </section>
  )
}
