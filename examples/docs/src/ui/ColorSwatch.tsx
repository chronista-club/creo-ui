import { For, type JSX } from 'solid-js'

export interface ColorSwatchSpec {
  /** Token path, e.g., 'color.brand.primary' */
  name: string
  /** CSS variable, e.g., '--color-brand-primary' */
  cssVar: string
  /** Optional usage hint */
  hint?: string
}

export function ColorSwatch(props: ColorSwatchSpec): JSX.Element {
  return (
    <div class="docs-color-swatch">
      <div
        class="docs-color-swatch-chip"
        style={{ background: `var(${props.cssVar})` }}
        aria-hidden="true"
      />
      <div class="docs-color-swatch-info">
        <code class="docs-color-swatch-name">{props.name}</code>
        <code class="docs-color-swatch-var">{props.cssVar}</code>
        {props.hint && <span class="docs-color-swatch-hint">{props.hint}</span>}
      </div>
    </div>
  )
}

export interface ColorGroupSpec {
  title: string
  description?: string
  swatches: readonly ColorSwatchSpec[]
}

export function ColorGroup(props: ColorGroupSpec): JSX.Element {
  return (
    <section class="docs-color-group">
      <h3 class="docs-color-group-title">{props.title}</h3>
      {props.description && <p class="docs-color-group-desc">{props.description}</p>}
      <div class="docs-color-grid">
        <For each={props.swatches}>{(s) => <ColorSwatch {...s} />}</For>
      </div>
    </section>
  )
}
