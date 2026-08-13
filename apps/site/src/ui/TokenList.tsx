import { For, type JSX } from 'solid-js'

export interface DimensionToken {
  name: string
  cssVar: string
  /** Display value, e.g., '18px' */
  value: string
  /** Optional usage hint */
  hint?: string
  /**
   * Editor Mode の field id (provider の framework field と対)。指定すると
   * この行が Mode ON で選択可能になり、クリックで当該 token のノブが開く。
   */
  editorField?: string
}

/**
 * Visual scale for spacing / radius dimension tokens.
 * - 'spacing' renders a horizontal bar whose width = the token
 * - 'radius' renders a square with that border-radius
 */
export function DimensionScale(props: {
  tokens: readonly DimensionToken[]
  type: 'spacing' | 'radius'
  /** 行を creo-card 化する (Editor Mode の Discovery / 選択と噛み合う見た目) */
  card?: boolean
}): JSX.Element {
  return (
    <div class="docs-dim-scale">
      <For each={props.tokens}>
        {(t) => (
          <div
            class={props.card ? 'creo-card docs-dim-row' : 'docs-dim-row'}
            data-padding={props.card ? 's' : undefined}
            data-editor-fields={t.editorField}
            data-editor-selectable-id={t.editorField ? t.name : undefined}
          >
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
