import type { Component, JSX } from 'solid-js'
import styles from './CUPageShell.module.css'

interface CUPageShellProps {
  children: JSX.Element
  /**
   * Inner container max width (default 1100px)。 CSS variable
   * `--creo-page-shell-max-width` で override 可能。
   */
  maxWidth?: string
  /**
   * Entrance animation (opacity + translateY) を無効化する。
   * `prefers-reduced-motion: reduce` は CSS module 側で自動対応するので
   * 通常は明示指定不要、 navigation snap や test 環境で off にする用途。
   */
  noAnimation?: boolean
  /** Class to merge with base (outer `<main>`) */
  class?: string
}

/**
 * CUPageShell — full-canvas page wrapper primitive
 *
 * Layered Surface design v5.1 の **page mode** primitive。 Rail / Nav の右側に
 * 配置され、 max-width 1100px の inner container + entrance animation で
 * page 遷移を視覚化。 子要素は consumer が `<CUFacetGrid>` 等で組み立てる。
 *
 * ```tsx
 * <div class="flex h-screen">
 *   <Rail />
 *   <Nav />
 *   <CUPageShell>
 *     <CUFacetGrid>
 *       <article>main</article>
 *       <aside>sidebar</aside>
 *     </CUFacetGrid>
 *   </CUPageShell>
 * </div>
 * ```
 *
 * Vision: mem_1Cak5rxTFWvLNxjSRiQ1Ak (Layered Surface v5.1)
 * Origin: Phase 1 (CREO-160) `MemoryPageShell` から layout 部分を抽出
 */
export const CUPageShell: Component<CUPageShellProps> = (props) => (
  <main
    class={`${styles.creoPageShell}${props.class ? ` ${props.class}` : ''}`}
    style={props.maxWidth ? { '--creo-page-shell-max-width': props.maxWidth } : undefined}
  >
    <div
      class={`${styles.creoPageShellInner}${props.noAnimation ? '' : ` ${styles.creoPageShellEntrance}`}`}
    >
      {props.children}
    </div>
  </main>
)
