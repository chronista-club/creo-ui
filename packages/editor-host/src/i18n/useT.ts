/**
 * creo-ui-editor-host — useT() translation hook
 *
 * `useT()` は current locale を閉じ込めた translate 関数を返す。
 * LocalizedText → string 解決で fallback chain を挟み、"翻訳欠け" で UI
 * が空白になる事故を抑える。
 *
 * 使用例:
 * ```tsx
 * const t = useT()
 * return <p>{t({ ja: 'こんにちは', en: 'Hello' })}</p>
 * ```
 */
import { useLocale } from './locale'
import type { Locale, LocalizedText } from './types'

/** LocalizedText → string resolver (pure 関数、hook でない) */
export function translate(text: LocalizedText, locale: Locale, fallback = ''): string {
  const primary = text[locale]
  if (primary != null) return primary
  // fallback chain: en → ja → その他 defined な最初の値 → fallback 引数
  if (text.en != null) return text.en
  if (text.ja != null) return text.ja
  for (const key of Object.keys(text)) {
    const v = text[key]
    if (typeof v === 'string') return v
  }
  return fallback
}

/**
 * Solid hook: 現 locale を解決した translate 関数を返す。
 *
 * - 返す関数は `(text: LocalizedText, fallback?: string) => string`
 * - reactive: `setLocale()` で変更すると Signal が走り、component が再描画される
 */
export function useT(): (text: LocalizedText, fallback?: string) => string {
  const { locale } = useLocale()
  return (text, fallback = '') => translate(text, locale(), fallback)
}
