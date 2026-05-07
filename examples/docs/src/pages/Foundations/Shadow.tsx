import { For } from 'solid-js'

const SHADOWS = [
  { name: 'shadow.none', cssVar: '--shadow-none', hint: 'Explicit reset (no elevation)' },
  { name: 'shadow.s', cssVar: '--shadow-s', hint: 'Subtle lift (hover, dropdown 微発光)' },
  { name: 'shadow.m', cssVar: '--shadow-m', hint: 'Card hover / popover / dropdown' },
  { name: 'shadow.l', cssVar: '--shadow-l', hint: 'Sheet / drawer / overlay' },
  { name: 'shadow.xl', cssVar: '--shadow-xl', hint: 'Modal / focal surface' },
] as const

export default function Shadow() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Shadow</h1>
        <p class="docs-page-lead">
          5 階層の elevation (none / s / m / l / xl)。 dark theme では opacity 強め、 light theme
          では subtle に — token 値が theme 切替で適切な vis に追従。
        </p>
      </header>

      <div class="docs-shadow-grid">
        <For each={SHADOWS}>
          {(s) => (
            <article class="docs-shadow-card" style={{ 'box-shadow': `var(${s.cssVar})` }}>
              <code class="docs-shadow-name">{s.name}</code>
              <code class="docs-shadow-var">{s.cssVar}</code>
              <p class="docs-shadow-hint">{s.hint}</p>
            </article>
          )}
        </For>
      </div>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`/* CSS */
.card-floating {
  box-shadow: var(--shadow-m);
}
.modal {
  box-shadow: var(--shadow-xl);
}`}</code>
        </pre>
      </section>
    </>
  )
}
