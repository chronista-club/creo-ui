import { For } from 'solid-js'

const FAMILIES = [
  {
    name: 'typography.family.app',
    cssVar: '--typography-family-app',
    label: 'App (UI default)',
    sample: '見出し・ボタン・本文 — Aa Bb 123 漢字仮名',
  },
  {
    name: 'typography.family.read',
    cssVar: '--typography-family-read',
    label: 'Read (long-form prose)',
    sample: '読み物・記事・ドキュメント — Aa Bb 123 漢字仮名',
  },
  {
    name: 'typography.family.editor',
    cssVar: '--typography-family-editor',
    label: 'Editor (code-aware UI)',
    sample: 'editor・config — Aa Bb 123 漢字仮名',
  },
  {
    name: 'typography.family.terminal',
    cssVar: '--typography-family-terminal',
    label: 'Terminal',
    sample: '> $ command --flag arg',
  },
  {
    name: 'typography.family.mono',
    cssVar: '--typography-family-mono',
    label: 'Mono (code blocks)',
    sample: 'const x = 42; // monospace',
  },
  {
    name: 'typography.family.icon',
    cssVar: '--typography-family-icon',
    label: 'Icon (Nerd Font glyphs)',
    sample: '     — icon glyph',
  },
] as const

const SIZES = [
  { name: 'typography.size.xs', cssVar: '--typography-size-xs', value: '12px' },
  { name: 'typography.size.sm', cssVar: '--typography-size-sm', value: '14px' },
  { name: 'typography.size.base', cssVar: '--typography-size-base', value: '16px' },
  { name: 'typography.size.lg', cssVar: '--typography-size-lg', value: '18px' },
  { name: 'typography.size.xl', cssVar: '--typography-size-xl', value: '20px' },
  { name: 'typography.size.2xl', cssVar: '--typography-size-2xl', value: '24px' },
  { name: 'typography.size.3xl', cssVar: '--typography-size-3xl', value: '32px' },
] as const

const WEIGHTS = [
  { name: 'regular', cssVar: '--typography-weight-regular', value: '400' },
  { name: 'medium', cssVar: '--typography-weight-medium', value: '500' },
  { name: 'semibold', cssVar: '--typography-weight-semibold', value: '600' },
  { name: 'bold', cssVar: '--typography-weight-bold', value: '700' },
] as const

const SEMANTICS = [
  { name: 'typography.title.page', cssVar: '--typography-title-page', label: 'Title (page)' },
  {
    name: 'typography.title.section',
    cssVar: '--typography-title-section',
    label: 'Title (section)',
  },
  { name: 'typography.title.card', cssVar: '--typography-title-card', label: 'Title (card)' },
  { name: 'typography.body.lead', cssVar: '--typography-body-lead', label: 'Body (lead)' },
  { name: 'typography.body.helper', cssVar: '--typography-body-helper', label: 'Body (helper)' },
] as const

export default function Typography() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Typography</h1>
        <p class="docs-page-lead">
          Mode-based family (app / read / editor / terminal / mono / icon) + 7 step size scale + 4
          weight + 5 semantic role。 Nerd Font 5 種を embedded、 OS が glyph fallback。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Family</h2>
        <div class="docs-typo-table">
          <For each={FAMILIES}>
            {(f) => (
              <article class="docs-typo-row">
                <div class="docs-typo-meta">
                  <code>{f.name}</code>
                  <span>{f.label}</span>
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
        <h2 class="docs-section-title">Size scale</h2>
        <div class="docs-typo-sizes">
          <For each={SIZES}>
            {(s) => (
              <div class="docs-typo-size-row">
                <code class="docs-typo-size-name">{s.name}</code>
                <span class="docs-typo-size-value">{s.value}</span>
                <span class="docs-typo-size-sample" style={{ 'font-size': `var(${s.cssVar})` }}>
                  Creo UI
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
        <h2 class="docs-section-title">Semantic roles</h2>
        <p class="docs-page-helper">
          意味を持つ typography token。 size と weight を予め束ねたもの (heading / body 用途別)。
        </p>
        <div class="docs-typo-semantics">
          <For each={SEMANTICS}>
            {(s) => (
              <div class="docs-typo-semantic-row">
                <code>{s.name}</code>
                <span class="docs-typo-semantic-sample" style={{ 'font-size': `var(${s.cssVar})` }}>
                  {s.label}
                </span>
              </div>
            )}
          </For>
        </div>
      </section>
    </>
  )
}
