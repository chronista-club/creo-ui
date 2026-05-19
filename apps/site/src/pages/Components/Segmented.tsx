const PROPS = [
  {
    attr: 'data-size',
    values: 's / m / l',
    def: 'm',
    meaning: 'option padding scale、 5 tier convention',
  },
  {
    attr: 'data-width',
    values: 'full',
    def: 'auto',
    meaning: 'container 幅 100% に拡張、 mobile / fixed-width contexts 用',
  },
  {
    attr: 'role="radiogroup" + role="radio"',
    values: 'WAI-ARIA',
    def: '—',
    meaning: '排他選択 group、 radio 入力 (visual 別だが a11y 同じ)',
  },
] as const

const TOKENS = [
  { slot: 'track bg', token: 'color.surface.bg-subtle' },
  { slot: 'option (selected) bg', token: 'color.surface.surface + shadow.s' },
  { slot: 'option text (selected)', token: 'color.text.primary' },
  { slot: 'option text (unselected)', token: 'color.text.secondary' },
  { slot: 'border-radius (track)', token: 'radius.m' },
  { slot: 'border-radius (option)', token: 'radius.s' },
  { slot: 'transition', token: 'motion.duration.fast' },
] as const

export default function Segmented() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Segmented</h1>
        <p class="docs-page-lead">
          Mutually exclusive options bar (SwiftUI Picker / iOS UISegmentedControl 系)。 radio group
          の semantic + 視覚的に「同 group の選択肢」 を一目で示す pill / capsule design。 同 name
          の <code>&lt;input type="radio"&gt;</code> + visually-hidden で a11y を 確保しつつ custom
          visual を描く。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Default</div>
          <div class="creo-segmented" role="radiogroup" aria-label="View mode">
            <label class="creo-segmented-option">
              <input type="radio" name="seg-1" value="day" checked />
              <span>Day</span>
            </label>
            <label class="creo-segmented-option">
              <input type="radio" name="seg-1" value="week" />
              <span>Week</span>
            </label>
            <label class="creo-segmented-option">
              <input type="radio" name="seg-1" value="month" />
              <span>Month</span>
            </label>
            <label class="creo-segmented-option">
              <input type="radio" name="seg-1" value="year" />
              <span>Year</span>
            </label>
          </div>

          <div class="docs-preview-row-label">Sizes</div>
          <div class="creo-segmented" data-size="s" role="radiogroup" aria-label="size s">
            <label class="creo-segmented-option">
              <input type="radio" name="seg-2" value="a" checked />
              <span>s</span>
            </label>
            <label class="creo-segmented-option">
              <input type="radio" name="seg-2" value="b" />
              <span>Compact</span>
            </label>
          </div>
          <div class="creo-segmented" data-size="l" role="radiogroup" aria-label="size l">
            <label class="creo-segmented-option">
              <input type="radio" name="seg-3" value="a" checked />
              <span>l</span>
            </label>
            <label class="creo-segmented-option">
              <input type="radio" name="seg-3" value="b" />
              <span>Hero</span>
            </label>
          </div>

          <div class="docs-preview-row-label">Width full</div>
          <div class="creo-segmented" data-width="full" role="radiogroup" aria-label="full width">
            <label class="creo-segmented-option">
              <input type="radio" name="seg-4" value="a" checked />
              <span>Light</span>
            </label>
            <label class="creo-segmented-option">
              <input type="radio" name="seg-4" value="b" />
              <span>Dark</span>
            </label>
            <label class="creo-segmented-option">
              <input type="radio" name="seg-4" value="c" />
              <span>Auto</span>
            </label>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Props</h2>
        <div class="docs-props-table">
          <div class="docs-props-row docs-props-head">
            <div>Attribute</div>
            <div>Values</div>
            <div>Default</div>
            <div>Meaning</div>
          </div>
          {PROPS.map((p) => (
            <div class="docs-props-row">
              <code>{p.attr}</code>
              <code>{p.values}</code>
              <code>{p.def}</code>
              <span>{p.meaning}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Token reference</h2>
        <div class="docs-tokens-table">
          {TOKENS.map((t) => (
            <div class="docs-tokens-row">
              <span class="docs-tokens-slot">{t.slot}</span>
              <code class="docs-tokens-name">{t.token}</code>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Segmented vs Tabs vs Radio</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Segmented</strong> — 2-5 個の compact toggle、 同位の view mode 切替 (Day/
            Week)、 即時反映
          </li>
          <li>
            <strong>Tabs</strong> — 関連 view 群の navigation、 panel 切替が伴う、 multi-section
            content
          </li>
          <li>
            <strong>Radio</strong> — form の中の 排他選択、 submit で反映、 文字 list 形式
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            wrapper に <code>role="radiogroup"</code> + <code>aria-label</code>、 各 option は
            native radio input
          </li>
          <li>radio input は visually-hidden、 visual は label の wrapper で描画</li>
          <li>keyboard arrow navigation は native radio の挙動 (browser 自動)</li>
          <li>option 数 ≤ 5 が理想、 6+ なら別 navigation pattern (select / tabs) 検討</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<div class="creo-segmented" role="radiogroup" aria-label="View mode">
  <label class="creo-segmented-option">
    <input type="radio" name="view" value="day" checked />
    <span>Day</span>
  </label>
  <label class="creo-segmented-option">
    <input type="radio" name="view" value="week" />
    <span>Week</span>
  </label>
  <label class="creo-segmented-option">
    <input type="radio" name="view" value="month" />
    <span>Month</span>
  </label>
</div>

<!-- Full width -->
<div class="creo-segmented" data-width="full" role="radiogroup" aria-label="Theme">
  ...
</div>`}</code>
        </pre>
      </section>
    </>
  )
}
