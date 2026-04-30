import { For, type JSX } from 'solid-js'

export interface DimensionToken {
  name: string
  cssVar: string
  /** Display value, e.g., '18px' */
  value: string
  /** Optional usage hint */
  hint?: string
}

/**
 * Visual scale for spacing / radius dimension tokens.
 * - 'spacing' renders a horizontal bar whose width = the token
 * - 'radius' renders a square with that border-radius
 */
export function DimensionScale(props: {
  tokens: readonly DimensionToken[]
  type: 'spacing' | 'radius'
}): JSX.Element {
  return (
    <div class="docs-dim-scale">
      <For each={props.tokens}>
        {(t) => (
          <div class="docs-dim-row">
            <code class="docs-dim-name">{t.name}</code>
            <div class="docs-dim-visual-wrap">
              {props.type === 'spacing' ? (
                <div
                  class="docs-dim-visual docs-dim-visual--spacing"
                  style={{ width: `var(${t.cssVar})` }}
                />
              ) : (
                <div
                  class="docs-dim-visual docs-dim-visual--radius"
                  style={{ 'border-radius': `var(${t.cssVar})` }}
                />
              )}
            </div>
            <code class="docs-dim-value">{t.value}</code>
            {t.hint && <span class="docs-dim-hint">{t.hint}</span>}
          </div>
        )}
      </For>
    </div>
  )
}
