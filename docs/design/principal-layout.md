# Principal Layout — creoui Edge Ring + Rail System

**Status**: P-0〜P-1 実装済 (2026-05-19、PR #48) — Edge Ring + Rail primitive 本体。P-2 以降 (consumer 移行) は未着手。fleetstage handoff (`mem_1CbCE1rdYJ4ySg87DF5hwa`) を起点に creoui lead が起こした設計 + 実装。CREO-84 Phase B の primitive スライス。
**Owners**: creoui (primitive schema + SolidJS reference 実装)、consumer apps (Rail registry 供給)
**Scope**: 2D の基盤レイアウト primitive — 4 edge + center の Edge Ring と、left edge の Rail System。app に依存しない layout 機構のみを規定し、各 App は Rail registry を供給する。
**Related**: [frame-system.md](./frame-system.md) (3D spatial morph、別 primitive), [editor-mode.md](./editor-mode.md), creo-memories doc 29 `29-3x3-frame.md` / doc 30 `30-principal-layout.md` (概念の起源)

---

## 1. Overview (Why)

creo-memories が doc 29/30 で確立した **3x3 Frame + Rail UX 哲学** を、creoui の共有 primitive として landing させる。creo-web / fleetstage hq / fleetstage backstage の 3 App が同一の layout 基盤に乗るための土台。

> **起源**: fleetstage が hq/backstage 画面を creo-memories の Rail UX を reference に再構成したい、と。コピー実装は creoui primitive との divergence を生むため、**creoui primitive 経由** (A) で共有し、各 App が consumer になる (B) 方針を fleetstage lead が確定 (handoff `mem_1CbCE1rdYJ4ySg87DF5hwa`)。本 doc が A。

creoui には既に layout protocol が 1 本ある — `creoui-frame` ([frame-system.md](./frame-system.md))。これは **3D spatial morph** (名前付き 3D Frame の連続、slot binding、FLIP morph)。本 doc の Principal Layout はそれとは **別の primitive** — 2D の基盤フレーム。両者の関係は §4。

## 2. 何が Principal Layout か

Principal Layout = **4 edge が center を囲む 2D フレーム** (doc 30 §4 "Edge Ring")。

```
┌─────────┬─────────────────┬─────────┐
│ corner  │    up edge      │ corner  │
├─────────┼─────────────────┼─────────┤
│  left   │     center      │  right  │
│  edge   │  主要活動拠点     │  edge   │
│  起点    │ (route 内容)     │  ツール  │
├─────────┼─────────────────┼─────────┤
│ corner  │   down edge     │ corner  │
└─────────┴─────────────────┴─────────┘
```

| region | doc 29 §3.2 の意味 | primitive での扱い |
|---|---|---|
| **leftEdge** | 起点 (operation の出発点) | Rail System を入れる枠 (§5) |
| **rightEdge** | ツール (center の活動支援) | 枠のみ、中身は consumer |
| **upEdge** | global / cross-layer | 枠のみ、中身は consumer |
| **downEdge** | local / in-layer | 枠のみ、中身は consumer |
| **center** | 主要活動拠点 (route 内容) | consumer の route component |
| **corner** ×4 | 隣接 2 edge の積 | 枠のみ、中身は consumer |

center = 主要活動拠点。4 edge = 2 直交軸 (横 = 起点⇄ツール、縦 = global⇄local)。**left edge には Rail System が入る** — それが本 primitive の華 (§5)。

### 2.1. 羅針盤であって格子ではない

doc 29 §3.5 の epistemic status を primitive の不変条件として継承する: Edge Ring は **認知ガイド (compass)** であって UI を閉じ込める格子 (cage) ではない。

- region は home を与えるが `overflow:hidden` の rigid grid にしない — 要素は寸法自由、region を越えてよい
- 中身が空の edge は DOM を描かない (高さ/幅 0、center が驚き最小に保たれる)
- 実装は原則ほぼ常にガイドに従う (強い原則 + 明示的逃げ道)

## 3. 設計決定 (PL-1 〜 PL-8)

### PL-1 — Principal Layout は `creoui-frame` と別 primitive

2D consumer (hq/backstage) が 3D morph 機構をゼロ背負いで使えること。詳細 §4。

### PL-2 — 位置語彙を SSOT 化、「sidebar」を禁ずる

region は **位置 (どこ) で命名**: `leftEdge` / `rightEdge` / `upEdge` / `downEdge` / `center` / `cornerTL`〜`cornerBR`。「sidebar」のような位置を持たない語を API・class・data-attribute に出さない (doc 30 §3.1)。位置が意味だから、命名が位置を失うと設計意図が消える。

### PL-3 — Rail registry は app 供給 (最重要の再利用要件)

primitive は Edge Ring + Rail 機構 **だけ** 提供する。**特定 App の rail を primitive に hardcode しない**。各 App が自分の `RailDef[]` を供給する — creo-web は Memory/Atlas/Views、fleetstage hq/backstage は別 rail。これが「3 App が同一基盤」を成立させる核 (handoff 要件3)。

### PL-4 — Rail 選択 = route が唯一の SSOT

selected Rail = `longestPrefixMatch(pathname, registry)`。click 由来の別 signal は持たない (route-由来 と click-由来 の 2 系統 state 競合を回避、doc 30 §6.4)。Rail column の icon click = その Rail の主 route へ navigate → route 変化で選択確定。

### PL-5 — peek = collapsed ⇄ expanded の 2 状態

peek panel は **collapsed (細い/0) ⇄ expanded (~240px)**。default collapsed、選択中 Rail の route に居る時 auto expand (doc 29「ひょこっと = 在るが控えめ」、doc 30 §6.3)。「240px 固定常駐」にしない — peek 概念が実装されず常時居座りを再生産するため。

### PL-6 — 多層 Atlas / Z 軸は optional feature

Z 軸 (認知境界の積層、doc 29 §4) は creo-memories 固有の product 概念。hq/backstage・ops Console は Z 軸を持たない。primitive は **Z 軸機能を使わなくても成立する形** にする — `currentLayer` 的な state hook は opt-in の add-on、registry / Edge Ring は Z 軸ゼロで動く (handoff 要件4)。primitive の core surface に Z 軸 API を出さない。

### PL-7 — landing 先 = `creoui/shells` subpath、SolidJS reference 実装

`packages/web/src/shells/` (CREO-84 Phase B、既に `CreoPageShell` / `CreoFacetGrid` が在る) に追加。fleetstage backstage は既に `creoui/shells` の `CreoPageShell` を使用 — 同 family。SolidJS reference 実装を creoui に持ち、Swift / 他 framework は consumer 側 ([editor-mode.md](./editor-mode.md) EH-1/EH-2 方針と整合)。

### PL-8 — Rail 入場資格は consumer の product strategy

doc 30 §6.2 の admission gate (「Rail = 記憶の相、first-class entity に裏打ち」) は creo-memories 固有の規律。primitive は gate を **強制しない** — registry に何を入れるかは各 App の product 判断。primitive が課すのは構造契約 (`RailDef` の形、route 必須) のみ。

## 4. `creoui-frame` との関係 — 語彙だけ共有

| | `creoui-frame` (既存) | Principal Layout (本 doc) |
|---|---|---|
| 本質 | 3D spatial morph protocol | 2D 基盤レイアウト |
| slot | 3D 配置 (x/y/z/rotate/scale) | 位置 region (4 edge + center + corner) |
| 動き | Frame morph (FLIP + z + opacity) | edge の collapsed⇄expanded |
| consumer 負荷 | perspective / camera / motion engine | DOM + CSS のみ |

両者は無関係ではない — doc 29 §3.5 は「同じ認知構造が 2D display でも 3D field でも違う形で現れる」と言う。**位置語彙** (leftEdge/center/... の region 名) はその *同じ認知構造* の表層。

→ **決定**: 位置語彙を **単一の canonical vocabulary type** として定義し、`creoui-frame` と Principal Layout の双方が参照する。ただし Principal Layout は `creoui-frame` を **import しない** (3D 依存を 2D consumer に持ち込まないため、PL-1)。vocabulary type は両者から依存できる軽量な置き場に持つ (厳密な module 位置は実装 P-0 の確定事項)。

**命名**: 既存 `creoui-frame` が "Frame" 語を持つため、本 primitive は別名で名乗る。handoff / doc 29/30 の placeholder 名 `<CreoFrame>` は採らない (衝突回避)。proposed: **`<CreoEdgeShell>`** (Edge Ring) + **`<CreoRail>`** (Rail System) — `shells` family の命名と整合。最終確定は naming SSOT (mito) レビュー時。

## 5. Rail System (left edge)

Rail System = **Rail column (アイコン縦列) + peek panel (選択中 Rail の中身)**。

### 5.1. データモデル

```ts
type RailAspect = string  // App 定義 (creo-memories は 'content'|'space'|'form')

interface RailDef {
  id: string
  icon: Component         // Rail column アイコン
  labelKey: string        // i18n key (consumer の i18n 層が解決)
  route: string           // 主 route (全 Rail 必須 — PL-4)
  peek: Component         // peek component (未実装は empty-state を渡す)
  order: number
  aspect?: RailAspect     // App 定義の分類 (primitive は意味づけしない)
}
```

primitive は `RailDef[]` を **app から受け取る** — `<CreoRail registry={APP_RAIL_REGISTRY} />`。`selectRailId` / `longestPrefixMatch` は primitive が提供する pure logic。

creo-web の `registry.ts` (pure data + logic) / `rails.tsx` (icon・peek 配線) の **pure / component 分離パターン** は primitive にも持ち込む — contract test を pure に保てる (doc 30 §8、`@tabler/icons-solidjs` 等の client-only import を test から隔離)。

### 5.2. registry contract test

primitive は `RailDef[]` を反復し各 entry が描画・選択・peek 表示されることを検証する contract test の枠を提供する。Rail 追加 = registry 1 行 = 自動カバレッジ ("open-closed" を安全にする)。

## 6. 多層 Atlas / Z 軸 (optional add-on)

doc 29 §4 / doc 30 §5-6 の Z 軸 (認知境界の積層、cross-layer / in-layer の swap) は **optional feature**:

- primitive 本体 (Edge Ring + Rail) は Z 軸ゼロで完全に動く
- Z 軸を使う App (creo-web) 向けに `currentLayer` 的な opt-in state hook + URL mirror を別 export として提供
- Z 軸を使わない App (hq/backstage、ops Console) はその hook を import しないだけ

→ Z 軸は primitive の **add-on**。core surface に Z 軸 API を出さない (PL-6)。

## 7. Phase plan

| Phase | scope |
|---|---|
| **P-0** ✅ | 位置語彙 vocabulary type (`regions.ts`) + `<CreoEdgeShell>` (4 edge 枠 + center) + epistemic status (格子でない) の CSS 規律 |
| **P-1** ✅ | `<CreoRail>` — Rail column + peek (collapsed⇄expanded) + `RailDef`/`railRegistry` + `selectRailId` pure logic + contract test 11 cases |
| **P-2** | creo-web を primitive の consumer に rewrite (既存 `RailSystem`/`EdgeFrame` を creoui primitive に置換、Memory/Atlas/Views registry を creo-web 側に) |
| **P-3** | Z 軸 add-on (`currentLayer` hook + URL sync) — creo-web 専用、optional export |
| **P-4** | fleetstage hq/backstage が consumer 化 (B、fleetstage lead 領分) |

P-0〜P-1 が creoui primitive 本体。P-2 以降は consumer 移行。各 Phase は独立に出荷可能な縦スライス。

## 8. やってはいけない

- 特定 App の Rail (Memory/Atlas/Views 等) を primitive に hardcode する (PL-3 違反)
- 「sidebar」「nav」等の位置を持たない語を API・class・data-attribute に出す (PL-2 違反)
- Principal Layout を `creoui-frame` の 3D Frame protocol の上に乗せる (PL-1 で否決、2D consumer に 3D 依存を持ち込む)
- Z 軸 / 多層 Atlas API を primitive の core surface に出す (PL-6 — optional add-on に留める)
- Edge Ring を `overflow:hidden` の rigid grid にする (PL-8 / doc 29 §3.5 — 羅針盤であって格子でない)
- Rail 選択に route 以外の signal を作る (PL-4 — route が唯一の SSOT)
- `creoui-frame` を rename する (別 primitive 方針で不要、既存 consumer の breaking change を避ける)

## 9. 関連

- 概念の起源: creo-memories doc 29 `docs/design/29-3x3-frame.md` (3x3 Frame + 多層 Atlas) / doc 30 `30-principal-layout.md` (Edge System / Rail System)
- handoff: `mem_1CbCE1rdYJ4ySg87DF5hwa` (fleetstage → creoui lead) + 受領 annotation `mem_1CbCEC1Ng5YE5kfEQe1Zd2`
- 別 primitive: [frame-system.md](./frame-system.md) (3D spatial morph)
- 抽出元実装: creo-web `apps/creo-web/src/components/layout/{rail/,edge/}` (`RailSystem` / `EdgeFrame` / `registry.ts` / `rails.tsx`)
- Epic: CREO-84 Phase B (creoui Design System、shells primitive)
