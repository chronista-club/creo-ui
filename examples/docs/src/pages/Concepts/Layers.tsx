import { A } from '@solidjs/router'

const REGION_TOKENS = [
  { name: 'editor-mode.region.top-height', value: '44px', desc: 'TOP fixed height (compact, Content を大きく隠さない)' },
  { name: 'editor-mode.region.bottom-height', value: '44px', desc: 'BOTTOM fixed height' },
  { name: 'editor-mode.region.left-width', value: '240px', desc: 'LEFT default width (collapsible)' },
  { name: 'editor-mode.region.right-width', value: '280px', desc: 'RIGHT default width (collapsible)' },
  { name: 'editor-mode.region.padding', value: '12px', desc: '各 region の内側 padding' },
] as const

const AXIS_TOKENS = [
  { name: 'editor-mode.axis.global', value: 'var(--color-brand-secondary)', desc: 'TOP — 視線の起点 / 全体設定' },
  { name: 'editor-mode.axis.past', value: 'var(--color-semantic-info)', desc: 'LEFT — 時系列過去 / 参照 / 元ソース' },
  { name: 'editor-mode.axis.future', value: 'var(--color-brand-primary)', desc: 'RIGHT — 時系列未来 / ツール / 生成' },
  { name: 'editor-mode.axis.utility', value: 'var(--color-text-tertiary)', desc: 'BOTTOM — local utility / 粒度小' },
] as const

export default function Layers() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Concepts</p>
        <h1>Layers — Editor / Content の非侵襲設計</h1>
        <p class="docs-page-lead">
          Editor Mode protocol の根幹は <strong>2 layer 分離</strong>。 Content Layer (app の本体) と
          Editor Layer (overlay) は完全に独立し、 Editor は Content の座標 / 可視性 / 操作を一切奪わない。
          そして Editor Layer 内は <strong>4 region semantic layout</strong> で意味を持つ。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Layer hierarchy</h2>
        <div class="docs-layers-stack">
          <div class="docs-layer-card docs-layer-editor">
            <div class="docs-layer-tag">overlay</div>
            <div class="docs-layer-name">Editor Layer</div>
            <div class="docs-layer-meta">
              <code>position: fixed</code> · z-index 上位 · Mode ON 時のみ可視
            </div>
          </div>
          <div class="docs-layer-card docs-layer-content">
            <div class="docs-layer-tag">base</div>
            <div class="docs-layer-name">Content Layer</div>
            <div class="docs-layer-meta">
              app の DOM 本体 — Editor からは <strong>read-only</strong> (CSS variable 経由でのみ間接編集可)
            </div>
          </div>
        </div>
        <p class="docs-page-helper">
          Editor が Content の <code>className</code> や inline <code>style</code> を直接書き換えたり、
          DOM tree を再配置することは禁止。 編集は <strong>必ず CSS variable / state binding 経由</strong>
          (D-9 reactive 反映)。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">D-6 非侵襲性</h2>
        <p>
          Editor Layer が満たすべき 5 不変条件:
        </p>
        <ul class="docs-bullet-list">
          <li>
            <strong>Reflow ゼロ</strong> — Editor ON / OFF で Content の layout が 1px も動かない
          </li>
          <li>
            <strong>z-index 隔離</strong> — Editor Layer の <code>position: fixed</code> overlay は Content の
            stacking context に侵入しない
          </li>
          <li>
            <strong>Pointer-events 透過</strong> — Editor の non-interactive 部分 (decorations 等) は Content の
            click を遮らない
          </li>
          <li>
            <strong>focus 干渉なし</strong> — Editor が user の text input focus を奪わない
          </li>
          <li>
            <strong>OFF で完全消失</strong> — Mode OFF 時、 Editor Layer は <code>display: none</code>
            (visibility: hidden ではない、 完全 unmount)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">4 region semantic layout (D-2)</h2>
        <div class="docs-region-diagram">
          <div class="docs-region-top">
            TOP — global tools<br />
            <span class="docs-region-axis-label">視線の起点 / 全体設定 / mode toggle</span>
          </div>
          <div class="docs-region-middle">
            <div class="docs-region-left">
              <div>LEFT</div>
              <div class="docs-region-axis-label">過去 ◀<br />参照 / 元ソース<br />ref データ</div>
            </div>
            <div class="docs-region-content">
              CONTENT<br />
              <span class="docs-region-axis-label">(Content Layer = ここは触らない)</span>
            </div>
            <div class="docs-region-right">
              <div>RIGHT</div>
              <div class="docs-region-axis-label">▶ 未来<br />ツール / 生成<br />transform</div>
            </div>
          </div>
          <div class="docs-region-bottom">
            BOTTOM — utility / local tools<br />
            <span class="docs-region-axis-label">multi-select / batch / AI chat</span>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">2 軸の意味 (D-3)</h2>
        <div class="docs-axes-grid">
          <article class="docs-axis-card">
            <h3>水平軸 — 時系列</h3>
            <p>
              <strong>左 = 過去</strong>、 <strong>右 = 未来</strong>。 LEFT に「参照する元ソース / ref / 既存
              データ」 を、 RIGHT に「これから生成する tool / transform / 出力」 を置く。 視線の流れ:
              ref を見て (左) → content を編集 (中央) → tool で transform (右)。
            </p>
          </article>
          <article class="docs-axis-card">
            <h3>垂直軸 — 階層</h3>
            <p>
              <strong>上 = グローバル</strong>、 <strong>下 = ローカル</strong>。 TOP に「全体設定 / mode toggle /
              app 全体に効く tools」、 BOTTOM に「local utility / 選択中要素に効く action / multi-select batch」。
              影響範囲が大きい順に上から下へ。
            </p>
          </article>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Region tokens</h2>
        <p class="docs-page-helper">寸法 (region.json):</p>
        <div class="docs-token-table">
          {REGION_TOKENS.map((t) => (
            <div class="docs-token-row">
              <code class="docs-token-name">{t.name}</code>
              <code class="docs-token-value">{t.value}</code>
              <span class="docs-token-desc">{t.desc}</span>
            </div>
          ))}
        </div>
        <p class="docs-page-helper">軸色 (axis.json) — 各 region の accent 色:</p>
        <div class="docs-token-table">
          {AXIS_TOKENS.map((t) => (
            <div class="docs-token-row">
              <code class="docs-token-name">{t.name}</code>
              <code class="docs-token-value">{t.value}</code>
              <span class="docs-token-desc">{t.desc}</span>
            </div>
          ))}
        </div>
        <p class="docs-page-helper">
          axis 色は <strong>theme 切替に追従</strong> — 例えば LEFT (past) は <code>--color-semantic-info</code>
          を参照しているので、 Sora theme なら sky blue、 Old School なら olive 系に変わる。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">Stacking discipline</h2>
        <ul class="docs-bullet-list">
          <li>Content Layer: app 標準の z-index (1〜100 程度)</li>
          <li>Editor Layer: <code>z-index: 1000+</code> (Content の最大 z-index を超える固定値)</li>
          <li>
            Editor 内 modal / popover: <code>z-index: 2000+</code> (Editor の他 region より前面、 ただし system
            modal 未満)
          </li>
        </ul>
        <p class="docs-page-helper">
          Editor Layer の z-index が Content を超えるのは <strong>overlay として絶対前面</strong> である必要が
          あるから。 Content の高 z-index modal も Editor Mode ON 中は Editor の overlay の下に隠れる
          (Editor 操作中は Editor 自身が最優先)。
        </p>
      </section>
    </>
  )
}
