/**
 * Corner concentric helper — Apple HIG iOS 16+ 流「親子同心円 radius」計算。
 *
 * 子要素の corner radius を親の radius と padding から計算すると、親子の
 * 角が視覚的に同心円で揃う。Creo UI の "柔らかく気持ちいい" aesthetic で
 * 最も活きる nesting パターン。
 *
 * @example
 * ```tsx
 * <article style={{
 *   'border-radius': 'var(--radius-md)',    // 15px
 *   padding: 'var(--spacing-md)',            // 18px
 * }}>
 *   <button style={{
 *     'border-radius': concentric('var(--radius-md)', 'var(--spacing-md)')
 *     // → 'calc(var(--radius-md) - var(--spacing-md))'
 *     // 実効値: 15px - 18px ... この場合は 0 以下になるので負数防止は consumer 判断、
 *     // 親 radius > padding になるよう設計するのが正しい (例: radius.lg=22, spacing.sm=8 → 14px)
 *   }}>Click</button>
 * </article>
 * ```
 *
 * 引数は CSS length value を表す文字列なら任意 (rem / px / var() / calc() 混在可)。
 * 計算は CSS 側で実行されるので、token を差し替えれば追従する。
 */
export function concentric(parentRadius: string, padding: string): string {
  return `calc(${parentRadius} - ${padding})`
}

/**
 * 親の radius と padding が token 系の場合のショートカット。
 * `concentric('var(--radius-lg)', 'var(--spacing-sm)')` と等価な呼び出しを
 * token key 指定で書ける。
 *
 * @example
 * concentricTokens('lg', 'sm', { radiusPrefix: '--radius-', paddingPrefix: '--spacing-' })
 * // → 'calc(var(--radius-lg) - var(--spacing-sm))'
 */
export function concentricTokens(
  radiusKey: string,
  paddingKey: string,
  opts: { radiusPrefix?: string; paddingPrefix?: string } = {},
): string {
  const radiusPrefix = opts.radiusPrefix ?? '--radius-'
  const paddingPrefix = opts.paddingPrefix ?? '--spacing-'
  return concentric(`var(${radiusPrefix}${radiusKey})`, `var(${paddingPrefix}${paddingKey})`)
}
