/**
 * @creo/ui-web
 *
 * Creo UI Web package entry point.
 *
 * Phase 1: Style Dictionary から生成された CSS custom properties / JS 値を配布する。
 *
 * Consumer は以下のいずれかの方法で使う:
 *
 *   1. CSS custom properties を読み込む:
 *        import '@creo/ui-web/tokens.css'
 *
 *   2. JS 値として token を参照する:
 *        import * as tokens from '@creo/ui-web/tokens.js'
 *        // 例: tokens.ColorBrandPrimary === '#73e7aa'
 *
 * 将来 Phase 2 では Web Components / framework helper も追加する予定。
 */

export const CREO_UI_VERSION = '0.0.1'
