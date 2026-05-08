import { For } from 'solid-js'

type ScaleEntry = {
  readonly name: string
  readonly cssVar: string
  readonly value: string
  readonly use: string
  readonly def?: boolean
}

// ============================================================
// Family — 4 group structure (P-3 articulate、 v0.18 cleanup 後)
// ============================================================
// (1) MODES        — 場面の identity (3)、 単一 stack mode
// (2) EDITOR_VARIANTS — editor mode の writer preference 3 派
// (3) MONO_VARIANTS — mono の visual 派 (4)
// (4) UTILITY_FAMILIES — 用途固定 stack (4)
// 合計 14 token、 token 名 / 値は不変。 grouping は articulate のみ。

const MODES = [
  {
    name: 'typography.family.app',
    cssVar: '--typography-family-app',
    label: 'App (UI chrome)',
    motivation:
      'sidebar / button / dialog / tab — dev tool 感、 monospace UI で IDE / terminal で work する場感を最大化',
    sample: '見出し・ボタン・本文 — Aa Bb 123 漢字仮名',
  },
  {
    name: 'typography.family.read',
    cssVar: '--typography-family-read',
    label: 'Read (long-form)',
    motivation:
      'memory view / chat history / canvas markdown — PlemolJP 主軸で和文重視、 CJK 完全等幅統一',
    sample: '読み物・記事・ドキュメント — Aa Bb 123 漢字仮名',
  },
  {
    name: 'typography.family.terminal',
    cssVar: '--typography-family-terminal',
    label: 'Terminal',
    motivation:
      'xterm.js 用 — app と同 stack だが意味的に分離 (terminal context の identity 表現)、 token 分離は intent expression のため',
    sample: '$ command --flag arg | grep pattern',
  },
] as const

const EDITOR_VARIANTS = [
  {
    name: 'typography.family.editor',
    cssVar: '--typography-family-editor',
    label: 'Editor (Duo、 default)',
    motivation:
      'iA Writer Duo の Duospace — proportional + monospace のハイブリッド、 writer 思想の主軸',
    sample: 'editor input / markdown / chat — 書く時の感覚 (Duo)',
  },
  {
    name: 'typography.family.editor-mono',
    cssVar: '--typography-family-editor-mono',
    label: 'Editor (純 mono)',
    motivation: 'iA Writer Mono — 純粋 mono 派、 等幅厳守 (code-aware writing)',
    sample: 'monospace strict — Aa Bb 123 (Mono)',
  },
  {
    name: 'typography.family.editor-quattro',
    cssVar: '--typography-family-editor-quattro',
    label: 'Editor (semi-prop)',
    motivation: 'iA Writer Quattro — semi-proportional、 長文散文 / blog post 向け',
    sample: 'long-form prose — letter spacing balanced (Quattro)',
  },
] as const

const MONO_VARIANTS = [
  {
    name: 'typography.family.mono-legible',
    cssVar: '--typography-family-mono-legible',
    label: 'Legible (a11y)',
    motivation:
      'high-legibility — Atkinson Hyperlegible Mono (Braille Institute)、 低視力 / 小サイズ / long session 最優先',
    sample: 'a11y mono — Atkinson Hyperlegible',
  },
  {
    name: 'typography.family.mono-retro',
    cssVar: '--typography-family-mono-retro',
    label: 'Retro (pixel)',
    motivation:
      'bitmap / pixel aesthetic — Departure / GohuFont / 3270 / Terminus、 lo-fi な display',
    sample: 'retro mono — Departure / Gohu / 3270',
  },
  {
    name: 'typography.family.mono-corporate',
    cssVar: '--typography-family-mono-corporate',
    label: 'Corporate',
    motivation:
      'corporate / professional tone — IBM Plex Mono 主軸 (Plex Sans/Serif と family 統一可)',
    sample: 'corporate mono — IBM Plex',
  },
  {
    name: 'typography.family.mono-display',
    cssVar: '--typography-family-mono-display',
    label: 'Display (hero)',
    motivation:
      'display / heading / cyberpunk — Share Tech Mono / Victor Mono、 banner / hero accent',
    sample: 'display mono — Share Tech / Victor',
  },
] as const

const UTILITY_FAMILIES = [
  {
    name: 'typography.family.sans',
    cssVar: '--typography-family-sans',
    label: 'Sans (legacy default)',
    motivation: 'back-compat default sans-serif、 multi-language EN/JA/KO + multi-platform',
    sample: 'Sans default — legacy',
  },
  {
    name: 'typography.family.mono',
    cssVar: '--typography-family-mono',
    label: 'Mono (legacy default)',
    motivation:
      'back-compat default monospace、 JetBrainsMono Nerd Font 主軸、 mono- variants の base',
    sample: 'mono default = JetBrainsMono',
  },
  {
    name: 'typography.family.display',
    cssVar: '--typography-family-display',
    label: 'Display (hero font)',
    motivation: 'hero headline 用 — Creo Sans + system display fallback (sans 系の variant)',
    sample: 'Hero Headline — display',
  },
  {
    name: 'typography.family.icon',
    cssVar: '--typography-family-icon',
    label: 'Icon (Nerd Font glyph)',
    motivation: 'icon glyph — Symbols Nerd Font (~10k icons) + OS native emoji fallback',
    sample: '     ',
  },
] as const

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
          <strong>3 軸構造</strong>: <strong>Mode-based family</strong> (場面の identity)、{' '}
          <strong>5 tier dimension scale</strong> (size / display / icon を xs / s / m / l / xl)、{' '}
          <strong>Role-based semantic</strong> (title / body の意味的 alias)。 Family 軸はさらに{' '}
          <strong>4 group</strong> に articulate: <em>Mode (3)</em> + <em>Editor variants (3)</em> +{' '}
          <em>Mono variants (4)</em> + <em>Utility (4)</em> = 14 token。 Nerd Font 5 種を base
          stack、 OS が glyph fallback。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">(1) Mode-based family — 場面の identity (3 mode)</h2>
        <p class="docs-page-helper">
          「
          <strong>
            書く時は writer 思想 (iA Writer)、 読む時は和文重視 (PlemolJP)、 UI は dev tool 感
            (JetBrainsMono)
          </strong>
          」 を font swap で UX に乗せる。 単一 stack の 3 mode (App / Read / Terminal) は固有の
          font stack を持ち、 場面に応じて切替。 「書く」 場面は editor mode で 3 派 (Duo / Mono /
          Quattro) を持つため別 group (下記 (2)) で articulate。
        </p>
        <div class="docs-typo-table">
          <For each={MODES}>
            {(f) => (
              <article class="docs-typo-row">
                <div class="docs-typo-meta">
                  <code>{f.name}</code>
                  <span>{f.label}</span>
                  <small>{f.motivation}</small>
                </div>
                <div class="docs-typo-sample" style={{ 'font-family': `var(${f.cssVar})` }}>
                  {f.sample}
                </div>
              </article>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">(2) Editor mode — writer preference 3 派</h2>
        <p class="docs-page-helper">
          editor mode は「<strong>writer 思想</strong>」 = textarea / Markdown editor / chat input
          で「書く快感」 を提供。 writer の preference に応じて 3 派から choose:{' '}
          <strong>Duo</strong> (Duospace、 default) / <strong>Mono</strong> (純等幅) /{' '}
          <strong>Quattro</strong> (semi-proportional)。 同じ「書く場面」 だが文字感を切替できる。
        </p>
        <div class="docs-typo-table">
          <For each={EDITOR_VARIANTS}>
            {(f) => (
              <article class="docs-typo-row">
                <div class="docs-typo-meta">
                  <code>{f.name}</code>
                  <span>{f.label}</span>
                  <small>{f.motivation}</small>
                </div>
                <div class="docs-typo-sample" style={{ 'font-family': `var(${f.cssVar})` }}>
                  {f.sample}
                </div>
              </article>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">(3) Mono variants — 見た目切替の 4 派</h2>
        <p class="docs-page-helper">
          mono (= 等幅) の <strong>visual 派</strong>。 用途 / 雰囲気 / a11y 要件に応じて switch。
          orthogonal axis で、 mode (場面) とは独立に選択する design。 typography token は consumer
          が <strong>意図 = font stack</strong> mapping を articulate するための語彙。
        </p>
        <div class="docs-typo-table">
          <For each={MONO_VARIANTS}>
            {(f) => (
              <article class="docs-typo-row">
                <div class="docs-typo-meta">
                  <code>{f.name}</code>
                  <span>{f.label}</span>
                  <small>{f.motivation}</small>
                </div>
                <div class="docs-typo-sample" style={{ 'font-family': `var(${f.cssVar})` }}>
                  {f.sample}
                </div>
              </article>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">(4) Utility families — 用途固定の 4 種</h2>
        <p class="docs-page-helper">
          特定用途に縛られた stack。 <code>sans</code> / <code>mono</code> は legacy default
          (back-compat)、 <code>display</code> は hero / headline、 <code>icon</code> は Nerd Font
          glyph。 mode 軸 / variant 軸とは別の <strong>用途固定</strong> 専用 token。
        </p>
        <div class="docs-typo-table">
          <For each={UTILITY_FAMILIES}>
            {(f) => (
              <article class="docs-typo-row">
                <div class="docs-typo-meta">
                  <code>{f.name}</code>
                  <span>{f.label}</span>
                  <small>{f.motivation}</small>
                </div>
                <div class="docs-typo-sample" style={{ 'font-family': `var(${f.cssVar})` }}>
                  {f.sample}
                </div>
              </article>
            )}
          </For>
        </div>
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
              <div class="docs-typo-size-row">
                <code class="docs-typo-size-name">{s.name}</code>
                <span class="docs-typo-size-value">
                  {s.value}
                  {s.def && ' (default)'}
                </span>
                <span class="docs-typo-size-sample" style={{ 'font-size': `var(${s.cssVar})` }}>
                  Creo UI — {s.use}
                </span>
              </div>
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
          Icon font / emoji の visual size。 typography size とは別 scale (icon は visual mass、
          text は readable height)。 empty-state default は <code>l</code> = 64px。
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
                    'font-family': 'var(--typography-family-icon)',
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
        <h2 class="docs-section-title">Why mode-based?</h2>
        <p>
          Creo ecosystem は <strong>「書く / 読む / UI / Terminal」 の 4 場面</strong> が混在する
          environment (Vantage Point dev env / Creo Memories memory page / chat / editor)。
          場面ごとに「最適な font 体験」 が違う:
        </p>
        <ul>
          <li>
            <strong>App UI</strong>: dev tool 感 (JetBrainsMono Nerd Font + PlemolJP)、 sidebar /
            button / dialog で「IDE / terminal で work する場」 のメタファー
          </li>
          <li>
            <strong>Read</strong>: 和文重視 (PlemolJP 主軸)、 memory view / chat history / canvas
            markdown で長く読む快感
          </li>
          <li>
            <strong>Editor</strong>: writer 思想 (iA Writer Duo)、 textarea / Markdown editor で
            「書く快感」
          </li>
          <li>
            <strong>Terminal</strong>: app と同 stack だが意味的に分離 (場面の identity を 明示する)
          </li>
        </ul>
        <p>
          font swap で UX を場面に sync させる、 Apple の Dynamic Type や macOS の font-rendering
          より深い <strong>場面 = font stack</strong> mapping を articulate。 詳細は
          memory「Mode-based typography family の motivation」 (creo-memories)。
        </p>
      </section>
    </>
  )
}
