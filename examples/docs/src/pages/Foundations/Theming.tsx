import { For } from 'solid-js'

const FAMILIES = [
  {
    family: 'Creo (mint)',
    light: 'mint-light',
    dark: 'mint-dark',
    note: 'Default (light brand hue 160 mint green)。 Creo ecosystem 共通の identity 色',
    isDefault: true,
  },
  {
    family: '空 (Sora)',
    light: 'sora-light',
    dark: 'sora-dark',
    note: 'Hue 230 sky blue。 落ち着いた tech-ops 系 surface 向き',
  },
  {
    family: 'Contrast / Paradox',
    light: 'contrast-light',
    dark: 'contrast-dark',
    note: 'Hue 270 violet (+335 magenta, +195 cyan)。 高彩度 / 強コントラスト演出',
  },
  {
    family: 'Old School',
    light: 'oldschool-light',
    dark: 'oldschool-dark',
    note: 'Hue 145 olive + 55 amber。 タイポ重視の retro / corporate',
  },
] as const

export default function Theming() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Theming</h1>
        <p class="docs-page-lead">
          4 family × light/dark = <strong>8 theme</strong> を同梱。 切替は <code>data-theme</code> 属性、
          values は OKLCH で記述、 modern browser がそのまま解釈。 Swift / Rust ビルド時に hex / Rgb
          に変換 (Mint Dark のみ)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">8 themes</h2>
        <div class="docs-theme-grid">
          <For each={FAMILIES}>
            {(f) => (
              <article class="docs-theme-card">
                <header class="docs-theme-card-head">
                  <h3>{f.family}</h3>
                  {f.isDefault && <span class="docs-theme-default-badge">default</span>}
                </header>
                <p class="docs-theme-note">{f.note}</p>
                <div class="docs-theme-pair">
                  <ThemePreview themeId={f.light} label="Light" />
                  <ThemePreview themeId={f.dark} label="Dark" />
                </div>
              </article>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Switching</h2>
        <pre class="docs-code">
          <code>{`<!-- HTML attribute -->
<html data-theme="sora-dark">
  ...
</html>

/* CSS — token 値が自動で切替 */
body {
  background: var(--color-surface-bg-base);
  color: var(--color-text-primary);
}`}</code>
        </pre>
        <p class="docs-page-helper">
          Header 右上の theme switcher は <code>localStorage</code> に永続化、 全 page 共通。
          fleetstage 互換 alias として <code>.dark</code> / <code>[data-theme="dark"]</code> = mint-dark、
          <code>[data-theme="light"]</code> = mint-light も解釈。
        </p>
      </section>
    </>
  )
}

function ThemePreview(props: { themeId: string; label: string }) {
  return (
    <div class="docs-theme-preview" data-theme={props.themeId}>
      <div class="docs-theme-preview-bar">
        <span class="docs-theme-preview-dot" style={{ background: 'var(--color-brand-primary)' }} />
        <span class="docs-theme-preview-dot" style={{ background: 'var(--color-brand-secondary)' }} />
        <span class="docs-theme-preview-dot" style={{ background: 'var(--color-semantic-success)' }} />
        <span class="docs-theme-preview-dot" style={{ background: 'var(--color-semantic-warning)' }} />
        <span class="docs-theme-preview-dot" style={{ background: 'var(--color-semantic-error)' }} />
      </div>
      <code class="docs-theme-preview-label">{props.themeId}</code>
      <span class="docs-theme-preview-mode">{props.label}</span>
    </div>
  )
}
