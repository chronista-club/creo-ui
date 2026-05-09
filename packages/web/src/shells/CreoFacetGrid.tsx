import type { Component, JSX } from 'solid-js'
import styles from './CreoFacetGrid.module.css'

interface CreoFacetGridProps {
  children: JSX.Element
  /**
   * Sidebar width (default 320px)。 CSS variable `--creo-facet-grid-sidebar-width` で
   * override 可能。
   */
  sidebarWidth?: string
  /**
   * Max width of grid (default 1100px)。 CSS variable `--creo-facet-grid-max-width` で
   * override 可能。
   */
  maxWidth?: string
  /** Class to merge with base */
  class?: string
}

/**
 * CreoFacetGrid — 2-col page grid primitive
 *
 * Layered Surface design v5.1 で確立した page grammar。 intrinsic main (1fr) +
 * extrinsic sidebar (sidebarWidth) の 2-col grid、 920px breakpoint で 1-col 化。
 *
 * 子要素は consumer が intrinsic / extrinsic 配置を決める (PR-3 で `<CreoFacet>`
 * primitive 化予定):
 *
 * ```tsx
 * <CreoFacetGrid>
 *   <article>main content</article>
 *   <aside>sidebar content</aside>
 * </CreoFacetGrid>
 * ```
 *
 * Vision: mem_1Cak5rxTFWvLNxjSRiQ1Ak (Layered Surface v5.1)
 * Origin: Phase 1 (CREO-160) `.memoryPage` から抽出
 */
export const CreoFacetGrid: Component<CreoFacetGridProps> = props => (
  <div
    class={`${styles.creoFacetGrid}${props.class ? ` ${props.class}` : ''}`}
    style={{
      ...(props.maxWidth && { '--creo-facet-grid-max-width': props.maxWidth }),
      ...(props.sidebarWidth && {
        '--creo-facet-grid-sidebar-width': props.sidebarWidth,
      }),
    }}
  >
    {props.children}
  </div>
)
