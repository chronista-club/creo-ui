import { For } from 'solid-js'

type ScaleEntry = {
  readonly name: string
  readonly cssVar: string
  readonly value: string
  readonly use: string
  readonly def?: boolean
}

// ============================================================
// Family — 唯一の root stack (2026-07 font 一本化 directive)
// ============================================================
// mode 別 family (app / read / editor / terminal) や mono / display / icon の
// variant token は全廃。 --typography-family-sans 1 本のみが root font stack。

const SIZES: readonly ScaleEntry[] = [
  {
    name: 'typography.size.xs',
    cssVar: '--typography-size-xs',
    value: '12px',
    use: 'caption / meta',
  },
  {
    name: 'typography.size.s',
    cssVar: '--typography-size-s',
    value: '14px',
    use: 'small body / helper text',
  },
  {
    name: 'typography.size.m',
    cssVar: '--typography-size-m',
    value: '16px',
    use: 'default body text',
    def: true,
  },
  {
    name: 'typography.size.l',
    cssVar: '--typography-size-l',
    value: '18px',
    use: 'large body / subheading',
  },
  {
    name: 'typography.size.xl',
    cssVar: '--typography-size-xl',
    value: '20px',
    use: 'largest body / small heading (h4)',
  },
] as const

const DISPLAYS: readonly ScaleEntry[] = [
  {
    name: 'typography.display.xs',
    cssVar: '--typography-display-xs',
    value: '24px',
    use: 'h4 / section title / card title',
  },
  {
    name: 'typography.display.s',
    cssVar: '--typography-display-s',
    value: '32px',
    use: 'h3 / article title / section headline',
  },
  {
    name: 'typography.display.m',
    cssVar: '--typography-display-m',
    value: '44px',
    use: 'default hero / h2 (Creo aesthetic)',
    def: true,
  },
  {
    name: 'typography.display.l',
    cssVar: '--typography-display-l',
    value: '56px',
    use: 'page hero / h1',
  },
  {
    name: 'typography.display.xl',
    cssVar: '--typography-display-xl',
    value: '72px',
    use: 'landing mega headline / promotional hero',
  },
] as const

const ICONS = [
  {
    name: 'typography.icon.xs',
    cssVar: '--typography-icon-xs',
    value: '16px',
    use: 'inline 補助 mark / favicon / dense list',
  },
  {
    name: 'typography.icon.s',
    cssVar: '--typography-icon-s',
    value: '24px',
    use: 'button / input / chip leading',
  },
  {
    name: 'typography.icon.m',
    cssVar: '--typography-icon-m',
    value: '40px',
    use: 'list item / inline 強調',
  },
  {
    name: 'typography.icon.l',
    cssVar: '--typography-icon-l',
    value: '64px',
    use: 'empty-state default / card header',
  },
  {
    name: 'typography.icon.xl',
    cssVar: '--typography-icon-xl',
    value: '96px',
    use: 'empty-state large / hero illustration',
  },
] as const

const WEIGHTS = [
  { name: 'regular', cssVar: '--typography-weight-regular', value: '400' },
  { name: 'medium', cssVar: '--typography-weight-medium', value: '500' },
  { name: 'semibold', cssVar: '--typography-weight-semibold', value: '600' },
  { name: 'bold', cssVar: '--typography-weight-bold', value: '700' },
] as const

const LINE_HEIGHTS = [
  {
    name: 'tight',
    cssVar: '--typography-line-height-tight',
    value: '1.2',
    use: 'heading / display',
  },
  { name: 'normal', cssVar: '--typography-line-height-normal', value: '1.5', use: 'default body' },
  {
    name: 'relaxed',
    cssVar: '--typography-line-height-relaxed',
    value: '1.75',
    use: 'long-form prose',
  },
] as const

const TITLES = [
  {
    name: 'typography.title.hero',
    cssVar: '--typography-title-hero',
    label: 'Hero — landing 最大級',
  },
  { name: 'typography.title.page', cssVar: '--typography-title-page', label: 'Page — h1' },
  { name: 'typography.title.section', cssVar: '--typography-title-section', label: 'Section — h2' },
  {
    name: 'typography.title.subsection',
    cssVar: '--typography-title-subsection',
    label: 'Subsection — h3',
  },
  {
    name: 'typography.title.card',
    cssVar: '--typography-title-card',
    label: 'Card — h4 / 内部見出し',
  },
] as const

const BODIES = [
  { name: 'typography.body.lead', cssVar: '--typography-body-lead', label: 'Lead — page intro' },
  {
    name: 'typography.body.default',
    cssVar: '--typography-body-default',
    label: 'Default — 通常本文',
  },
  {
    name: 'typography.body.emphasis',
    cssVar: '--typography-body-emphasis',
    label: 'Emphasis — 強調',
  },
  {
    name: 'typography.body.helper',
    cssVar: '--typography-body-helper',
    label: 'Helper — input 補足',
  },
  {
    name: 'typography.body.caption',
    cssVar: '--typography-body-caption',
    label: 'Caption — meta / 補足',
  },
] as const

export default function Typography() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Typography</h1>
        <p class="docs-page-lead">
          <strong>2 軸構造</strong>: <strong>単一 root font stack</strong> (Gen Interface JP + UDEV
          Gothic 35NF)、 <strong>5 tier dimension scale</strong> (size / display / icon を xs / s /
          m / l / xl)、 <strong>Role-based semantic</strong> (title / body の意味的 alias)。 2026-07
          の font 一本化 directive で mode 別 family (app / read / editor / terminal) や mono /
          display / icon の variant は全廃され、 family token は{' '}
          <code>--typography-family-sans</code> 1 本に集約された。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Family — 唯一の root font stack</h2>
        <p class="docs-page-helper">
          <strong>Gen Interface JP</strong> (UI text) + <strong>UDEV Gothic 35NF</strong> (mono
          由来の等幅数字・ Nerd Font icon glyph 供給) の 2 段 stack + generic fallback。 UDEV Gothic
          35NF は Nerd Font glyph を内蔵するため、 icon glyph も同一 stack から供給される (専用 icon
          family は不要)。 mode / variant による font swap は廃止し、 app 全体を 1 font で統一する。
        </p>
        <div class="docs-typo-table">
          <article class="docs-typo-row">
            <div class="docs-typo-meta">
              <code>typography.family.sans</code>
              <span>Root stack (唯一)</span>
              <small>
                'Gen Interface JP', 'UDEV Gothic 35NF', sans-serif — UI text + 等幅数字 + Nerd icon
                glyph を 1 stack で
              </small>
            </div>
            <div
              class="docs-typo-sample"
              style={{ 'font-family': 'var(--typography-family-sans)' }}
            >
              見出し・本文・コード — Aa Bb 123 漢字仮名
            </div>
          </article>
        </div>
        <p class="docs-page-helper">
          <code>--typography-family-sans</code> は <code>:root</code> に emit される唯一の family
          custom property。 <code>code</code> / <code>pre</code> / <code>kbd</code> など UA が
          monospace を強制する要素だけは、 明示的に <code>var(--typography-family-sans)</code>{' '}
          を指定して UA 既定を打ち消す (UDEV Gothic 35NF が等幅を供給するため見た目は root stack
          に統一される)。 その他の要素は <code>:root</code> から継承する。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">Size scale — body text (5 tier)</h2>
        <p class="docs-page-helper">
          通常本文の dimension。 中央 (<code>m</code> = 16px) が default、 5 tier convention (原則
          01) に従う。 heading 系は <strong>display</strong> 別軸を使用 (下記)。
        </p>
        <div class="docs-typo-sizes">
          <For each={SIZES}>
            {(s) => (
              /* creo-card 化 + Editor bind: Mode ON でこの行をクリックすると
                 当該 size token のノブが開く (data-editor-fields は provider が
                 register する framework field id と対) */
              <article
                class="creo-card docs-typo-size-row"
                data-padding="s"
                data-editor-fields={s.name}
                data-editor-selectable-id={s.name}
              >
                <code class="docs-typo-size-name">{s.name}</code>
                <span class="docs-typo-size-value">
                  {s.value}
                  {s.def && ' (default)'}
                </span>
                <span class="docs-typo-size-sample" style={{ 'font-size': `var(${s.cssVar})` }}>
                  creo-ui — {s.use}
                </span>
              </article>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Display scale — heading / hero (5 tier)</h2>
        <p class="docs-page-helper">
          heading / hero 用の大きい dimension。 size と独立した axis (size は body、 display は
          heading)。 中央 (<code>m</code> = 44px、 Creo aesthetic = 柔らかく強い存在感) が default。
        </p>
        <div class="docs-typo-sizes">
          <For each={DISPLAYS}>
            {(d) => (
              <div class="docs-typo-size-row">
                <code class="docs-typo-size-name">{d.name}</code>
                <span class="docs-typo-size-value">
                  {d.value}
                  {d.def && ' (default)'}
                </span>
                <span
                  class="docs-typo-size-sample"
                  style={{ 'font-size': `var(${d.cssVar})`, 'line-height': '1.1' }}
                >
                  {d.use}
                </span>
              </div>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Icon scale (5 tier)</h2>
        <p class="docs-page-helper">
          Icon glyph の visual size。 typography size とは別 scale (icon は visual mass、 text は
          readable height)。 glyph は root stack の UDEV Gothic 35NF (Nerd Font) が供給。
          empty-state default は <code>l</code> = 64px。
        </p>
        <div class="docs-typo-sizes">
          <For each={ICONS}>
            {(i) => (
              <div class="docs-typo-size-row">
                <code class="docs-typo-size-name">{i.name}</code>
                <span class="docs-typo-size-value">{i.value}</span>
                <span
                  class="docs-typo-size-sample"
                  style={{
                    'font-size': `var(${i.cssVar})`,
                    'font-family': 'var(--typography-family-sans)',
                    'line-height': '1',
                  }}
                >
                  {i.use}
                </span>
              </div>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Weight</h2>
        <div class="docs-typo-weights">
          <For each={WEIGHTS}>
            {(w) => (
              <div class="docs-typo-weight-row">
                <code>{w.name}</code>
                <span class="docs-typo-weight-value">{w.value}</span>
                <span style={{ 'font-weight': `var(${w.cssVar})` }}>The quick brown fox jumps</span>
              </div>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Line-height</h2>
        <p class="docs-page-helper">
          paragraph 内の行間。 heading は <code>tight</code> (1.2)、 body は <code>normal</code>{' '}
          (1.5)、 long-form は <code>relaxed</code> (1.75)。
        </p>
        <div class="docs-typo-weights">
          <For each={LINE_HEIGHTS}>
            {(lh) => (
              <div class="docs-typo-weight-row">
                <code>{lh.name}</code>
                <span class="docs-typo-weight-value">{lh.value}</span>
                <span>{lh.use}</span>
              </div>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Semantic roles — title (5 段)</h2>
        <p class="docs-page-helper">
          意味を持つ heading token。 size + weight + line-height を予め束ねたもの。 hero / page /
          section / subsection / card の 5 段で document hierarchy を表現。
        </p>
        <div class="docs-typo-semantics">
          <For each={TITLES}>
            {(t) => (
              <div class="docs-typo-semantic-row">
                <code>{t.name}</code>
                <span
                  class="docs-typo-semantic-sample"
                  style={{ 'font-size': `var(${t.cssVar})`, 'line-height': '1.2' }}
                >
                  {t.label}
                </span>
              </div>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Semantic roles — body (5 段)</h2>
        <p class="docs-page-helper">
          意味を持つ body token。 lead / default / emphasis / helper / caption の 5 段。 form field
          の helper text、 page intro の lead、 meta 情報の caption 等で使い分け。
        </p>
        <div class="docs-typo-semantics">
          <For each={BODIES}>
            {(b) => (
              <div class="docs-typo-semantic-row">
                <code>{b.name}</code>
                <span class="docs-typo-semantic-sample" style={{ 'font-size': `var(${b.cssVar})` }}>
                  {b.label}
                </span>
              </div>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Override — consumer が任意の local font を乗せる</h2>
        <p class="docs-page-helper">
          唯一の family token <code>--typography-family-sans</code> は <code>:root</code> に emit
          される。 consumer は <strong>CSS cascade で override 可能</strong> = creo-ui が認める{' '}
          <em>first-class supported path</em>。 token を fork する必要は無く、 web-hosted font asset
          を creo-ui に同梱する path も取らない。 詳細は{' '}
          <a
            href="https://github.com/chronista-club/creo-ui/blob/main/docs/design/typography-system.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            <code>docs/design/typography-system.md</code>
          </a>{' '}
          (TY-1 〜 TY-5)。
        </p>
        <p class="docs-page-helper">
          <strong>prepend pattern を推奨</strong>: custom font を chain 先頭に、 creo-ui default
          (Gen Interface JP + UDEV Gothic 35NF) を fallback として残す。 font 不在環境 (= 別 OS /
          install 忘れ) で既存 fallback に grace degrade する。
        </p>

        <p class="docs-page-helper">
          <strong>(a) Global override</strong> — app 全体で 1 font に統一 (典型的な use case)
        </p>
        <pre class="docs-code">
          <code>{`/* consumer 側 (例: creo-web の src/index.css) */
:root {
  --typography-family-sans: 'Mizolet', var(--typography-family-sans);
}`}</code>
        </pre>

        <p class="docs-page-helper">
          <strong>(b) Theme-scoped</strong> — 特定 theme でだけ font 切替 (theme と typography は
          独立 token だが、 cascade selector で組み合わせれば theme-aware typography が可能)
        </p>
        <pre class="docs-code">
          <code>{`[data-theme="oldschool-dark"] {
  --typography-family-sans: 'Departure Mono', var(--typography-family-sans);
}`}</code>
        </pre>

        <p class="docs-page-helper">
          <strong>(c) Subtree-scoped</strong> — 特定 workspace / section のみ
        </p>
        <pre class="docs-code">
          <code>{`.atelier-workspace {
  --typography-family-sans: 'iA Writer Quattro S', var(--typography-family-sans);
}`}</code>
        </pre>
      </section>
    </>
  )
}
