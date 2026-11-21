/**
 * Rail registry — Principal Layout の left edge = Rail System の pure data + logic
 *
 * docs/design/principal-layout.md §5。
 *
 * 設計判断 (creo-web `registry.ts` から抽出):
 * - 本 module は **pure data + logic のみ**。SolidJS component (icon / peek) は
 *   型 (`Component`) としてのみ持つ。bun:test で client-only API を踏まずに
 *   contract test できる。
 * - registry は primitive が持たず **app が供給する** (PL-3) — 全 logic 関数は
 *   `registry` を引数で受け取る。特定 App の Rail を hardcode しない。
 * - 「選択中 Rail」は route が唯一の SSOT (PL-4)。click 由来の signal は作らない。
 */

import type { Component } from 'solid-js'

/** 記憶/情報の相 — App が定義する分類。primitive は意味づけしない (PL-8) */
export type RailAspect = string

/**
 * RailDef — Rail registry の 1 entry。
 *
 * `icon` / `peek` は consumer 供給の SolidJS component。peek が未実装の Rail には
 * consumer が empty-state component を `peek` として渡す (docs §5.1)。
 */
export interface RailDef {
  /** Rail 識別子 (例: 'memory' | 'atlas' | 'views') */
  id: string
  /** Rail column のアイコン component */
  icon: Component
  /** i18n key — 表示文字列の解決は consumer の i18n 層 (位置語彙 namespace 推奨) */
  labelKey: string
  /** 主 route — 全 Rail 必須 (PL-4: route = SSOT) */
  route: string
  /** peek panel の中身 component */
  peek: Component
  /** Rail column での表示順 */
  order: number
  /** App 定義の分類 (任意、primitive は解釈しない) */
  aspect?: RailAspect
}

/** order 昇順に並べた registry のコピーを返す (元配列は破壊しない) */
export function railsByOrder(registry: readonly RailDef[]): RailDef[] {
  return [...registry].sort((a, b) => a.order - b.order)
}

/** id から RailDef を引く。未指定 / 未発見は undefined */
export function railById(
  registry: readonly RailDef[],
  id: string | undefined,
): RailDef | undefined {
  if (!id) return undefined
  return registry.find((rail) => rail.id === id)
}

/**
 * selectRailId — route = SSOT で「選択中 Rail」を導出する (PL-4 / doc 30 §6.4)。
 *
 * 最長 prefix 一致: `/memories/xyz` は `/memories` Rail にマッチ。複数 Rail が
 * 同 prefix にマッチした場合は route 文字列が最長のものを採る。
 * マッチは path-segment 境界で判定する (`/atlasation` は `/atlas` にマッチしない)。
 * どの Rail にもマッチしなければ undefined (= Rail 非選択)。
 */
export function selectRailId(pathname: string, registry: readonly RailDef[]): string | undefined {
  let best: RailDef | undefined
  for (const rail of registry) {
    const isPrefix = pathname === rail.route || pathname.startsWith(`${rail.route}/`)
    if (!isPrefix) continue
    if (!best || rail.route.length > best.route.length) {
      best = rail
    }
  }
  return best?.id
}
