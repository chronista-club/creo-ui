/**
 * creoui-editor-host — i18n types
 *
 * UI primitive (Editor Mode labels, Button default label 等) に使う
 * 最小 i18n 型。anycreative-tech の messages SSOT パターン (CREO-91) を
 * creoui の i18n primitive として port したもの。
 *
 * 思想:
 *   - UI chrome 文字列は **TypeScript SSOT** で持つ (翻訳漏れが tsc で検出される)
 *   - consumer は messages object を `satisfies Record<Enum, LocalizedText>` で
 *     型駆動に validate できる
 *   - `useT()` hook は current locale を閉じ込めて LocalizedText → string に解決
 *
 * Locale 拡張: creoui は minimum `ja | en` を default に持つ。consumer が
 * 他言語 (ko / zh / fr 等) を扱う場合は declaration merging で `Locale` を
 * 拡張し、LocalizedText にも対応キーを持たせる (module augmentation example
 * は src/i18n/README.md 予定)。
 */

/** creoui 標準 locale — ja (source), en (international) */
export type Locale = 'ja' | 'en'

/**
 * ローカライズされた文字列 map。
 *
 * - `ja` が source (Creo プロジェクトの主言語)
 * - `en` が international fallback
 * - 他 locale は optional (consumer が declaration merging で足せる)
 *
 * useT(text) の fallback chain: `current locale → en → ja → ''`
 */
export interface LocalizedText {
  ja?: string
  en?: string
  /** pragmatic escape hatch: locale key として文字列を許容 (型駆動で弱くなる代わりに consumer の拡張性を守る) */
  [locale: string]: string | undefined
}

/** messages.ts の内部構造 (再帰的な namespace 構造を許容) */
export type Messages = {
  [key: string]: LocalizedText | Messages
}
