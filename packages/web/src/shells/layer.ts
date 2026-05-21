/**
 * Principal Layout — Z 軸 layer add-on (docs/design/principal-layout.md §6)
 *
 * 多層 Atlas / Z 軸 (認知境界の積層、doc 29 §4) は **optional feature** (PL-6)。
 * Edge Ring + Rail の core は Z 軸ゼロで動く。本 module は Z 軸を使う consumer
 * (creo-web) 向けの opt-in add-on — `<CreoEdgeShell>` / `<CreoRail>` はこれを
 * 一切参照しない。
 *
 * currentLayer = 「今どの層 (Atlas = 認知境界) に居るか」= Z 位置 (doc 30 §6.6)。
 * 値は `LayerId` (atlasId | undefined)。undefined = ルート層 (全 Atlas 横断)。
 *
 * pure logic (parse / serialize / equals) と store / URL sync を分離 — pure 部は
 * router 非依存で bun:test できる。URL sync も router-agnostic (param accessor を
 * 引数で受ける) — `@solidjs/router` 等は import しない (CreoRail と同じ規律)。
 */

import { type Accessor, createEffect, createSignal } from 'solid-js'

/** Z 位置。atlasId 文字列、または undefined (= ルート層 = 全 Atlas 横断) */
export type LayerId = string | undefined

/** URL param 値 (`?layer=`) → LayerId。空文字 / null / undefined はルート層 */
export function parseLayerParam(raw: string | null | undefined): LayerId {
  return raw && raw.length > 0 ? raw : undefined
}

/** LayerId → URL param 値。ルート層は param 削除を意味する undefined を返す */
export function layerToParam(layer: LayerId): string | undefined {
  return layer && layer.length > 0 ? layer : undefined
}

/**
 * store の layer と URL param が一致するか。URL ⇄ store の双方向 sync で
 * 「一致なら書かない」ガードに使い、無限ループを収束させる (doc 30 §6.6)。
 */
export function layerEqualsParam(layer: LayerId, raw: string | null | undefined): boolean {
  return parseLayerParam(raw) === layer
}

export interface LayerStore {
  /** 現在の Z 位置 */
  layer: Accessor<LayerId>
  /** Z 位置を設定する (= 層切替 = 別の認知境界へ移動、doc 29 §4) */
  setLayer: (layer: LayerId) => void
}

/**
 * currentLayer store を作る。SSOT は signal (Rail 選択の route 跨ぎでも持続する
 * 必要があるため component-local では足りない、doc 30 §6.6)。
 */
export function createLayerStore(initial?: LayerId): LayerStore {
  const [layer, setLayer] = createSignal<LayerId>(initial)
  return { layer, setLayer: (l) => setLayer(() => l) }
}

export interface LayerUrlSyncPorts {
  /** URL の `?layer` param を読む (consumer が router から供給) */
  readParam: () => string | null | undefined
  /** URL の `?layer` param を書く。undefined は param 削除を意味する */
  writeParam: (value: string | undefined) => void
}

/**
 * currentLayer store ⇄ URL `?layer` の双方向同期を配線する (doc 30 §6.6)。
 *
 * router-agnostic — param の読み書きは consumer 供給の `readParam` / `writeParam`
 * 経由 (creo-web は `useSearchParams` を配線する)。reactive root の中で 1 度呼ぶ。
 *
 * 無限ループは `layerEqualsParam` ガード (一致なら書かない) で収束する。
 */
export function createLayerUrlSync(store: LayerStore, ports: LayerUrlSyncPorts): void {
  // URL → store
  createEffect(() => {
    const fromUrl = parseLayerParam(ports.readParam())
    if (fromUrl !== store.layer()) store.setLayer(fromUrl)
  })
  // store → URL
  createEffect(() => {
    const current = store.layer()
    if (!layerEqualsParam(current, ports.readParam())) {
      ports.writeParam(layerToParam(current))
    }
  })
}
