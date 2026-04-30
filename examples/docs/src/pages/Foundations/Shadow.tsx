import { For } from 'solid-js'

const SHADOWS = [
  { name: 'shadow.sm', cssVar: '--shadow-sm', hint: 'Subtle elevation (hover, dropdown 微発光)' },
  { name: 'shadow.md', cssVar: '--shadow-md', hint: 'Card hover / popover / dropdown' },
  { name: 'shadow.lg', cssVar: '--shadow-lg', hint: 'Dialog / sheet / drawer' },
] as const

export default function Shadow() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Shadow</h1>
        <p class="docs-page-lead">
          3 階層の elevation。 dark theme では shadow opacity を強めに、 light theme では
          subtle に — token 値が theme 切替で自動で適切な vis に追従。
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
  box-shadow: var(--shadow-md);
}
.dialog {
  box-shadow: var(--shadow-lg);
}`}</code>
        </pre>
      </section>
    </>
  )
}
