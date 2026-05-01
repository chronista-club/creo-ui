# Frame system — Creo UI Spatial Layout Protocol

**Status**: Concept articulated (P-0 docs visual depth shipping、 P-1+ runtime 未着手)
**Owners**: Creo UI (schema + protocol)、 consumer packages (runtime 実装)
**Scope**: layout philosophy at the same level as Editor Mode protocol。 既存の Story / Scene / Field 統一メンタルモデル (creo-memories `mem_1CZCk1Zg8cQpiLvjqqDKNA`) の **Scene 層** を spatial に articulate する protocol
**Related**: [editor-mode.md](./editor-mode.md), [theme-system.md](./theme-system.md), [stack-adr.md](./stack-adr.md), [vision-input.md](./vision-input.md)

---

## 1. Overview

Creo UI の layout 哲学。 画面 = **名前付き 3D Frame の連続** として表現する。
各 Frame は slot 集合と perspective を持ち、 view component は slot に bind される。
Scene 遷移 = Frame morph で、 view は解体せず spatial 移動。 平面 2D の `(x, y, z-index)`
に対して、 `(x, y, z, rotation, depth-of-field)` で **情報密度を倍以上** に。

> **Vision (原文)**: Layout には基本 3D Frame があり、それに合わせて 3D 配置で魅せていくスタイル。
> Frame は場面場面で柔軟に変化、 そこにバインドされているビューコンポーネントが合わせて表示される感じ。
> 今の構造に少し 3D 表現を加えて、 UI からの情報密度を高めたい。

## 2. 何が Frame か

```ts
type Frame = {
  id: string                              // "dashboard" / "reading" / "editor" / ...
  slots: Record<SlotName, SlotPlacement>  // 名前付き slot の集合
  perspective: PerspectiveConfig          // camera 位置 / FOV / depth budget
  transition: TransitionConfig            // 別 Frame への morph (FLIP + z + opacity)
}

type SlotPlacement = {
  x: number | string  // % / px / vw
  y: number | string
  z: number | string  // depth (px or token alias)
  rotateX?: number
  rotateY?: number
  scale?: number
  opacity?: number
}
```

View component は `<FrameSlot name="hero">...</FrameSlot>` 等で slot に bind。
`setFrame('reading')` で Frame morph trigger → 全 bound component が新 Frame の slot 位置に animate。
解体・再 mount せず、 同じ DOM が空間移動するだけ。

## 3. Story / Scene / Field との連携

既存の ANYCREATIVE 統一メンタルモデル (creo-memories `mem_1CZCk1Zg8cQpiLvjqqDKNA`、 2026-03-20):

| 層 | 役割 | ECS 対応 | Frame system との関係 |
|---|---|---|---|
| **Story** | データ・台本・体験グラフ | Component | Frame system は touch しない |
| **Scene** | レンダリング・インタラクション | System | **Frame system はここを spatial に articulate** |
| **Field** | 3D 空間・ブラウザ・ライフサイクル | World | Frame system は Field を前提として動作 |

Frame system は Scene 層に「**名前付き spatial 配置 + slot binding + scene morph**」 を追加する protocol。
Field 層 (環境) は変えず、 Scene 層を richer にする位置付け。

## 4. 設計決定 (F-1 ~ F-3)

| # | 項目 | 決定 |
|---|------|------|
| F-1 | Frame の定義 | 名前付き spatial container (slot 集合 + perspective + transition)。 視点移動メタファ |
| F-2 | View binding | slot に component が「住む」、 Frame morph 時は protocol が transform 自動計算 |
| F-3 | Multi-platform abstract | depth metaphor として表現 (TUI = dim/bright、 SwiftUI = Liquid Glass、 Web = CSS 3D) |

### F-1 詳細

画面遷移を「別 page を mount する」 とすると、 view が解体されて context が切れる
(scroll position / focus / animation state lost)。 Frame system は **同じ世界の中での視点移動** を
メタファとして採用 — view は持続、 配置だけ変わる。 結果として遷移が **連続性のある体験** に。

### F-2 詳細

Component が「どの Frame の」「どの slot に住む」 を **宣言的に** 定義することで、
Frame morph 時の transform は protocol が自動計算。 component author は配置を気にせず、 機能だけ書く。

### F-3 詳細

Web は CSS 3D で literal な perspective を持てるが、 TUI (ratatui) / native (SwiftUI / iced) では
literal 3D 不可。 しかし「奥行き」 という **知覚** は表現可能 — TUI は dim/bright で深度、 SwiftUI は
Liquid Glass + shadow、 ratatui は border 強度で foreground / background。
Frame system は **「depth metaphor」 として abstract**、 platform は最良の表現を選択。

## 5. Editor Mode protocol との関係

[editor-mode.md](./editor-mode.md) の D-1 〜 D-12 は Frame system の **"Editor Frame" specialization** として再解釈できる:

| Editor Mode 決定 | Frame system 上での解釈 |
|---|---|
| D-2 4 方向 layout | Editor Frame の 4 slot (`top-global` / `left-past` / `right-future` / `bottom-utility`) |
| D-3 2 軸 | Editor Frame slot 配置の意味的 axes (時系列 horizontal / 階層 vertical) |
| D-6 非侵襲性 | z 軸で Editor Frame と Content Frame が完全分離 |
| Mode toggle | Frame 切替の特殊形 (dual state morph、 opacity + translateZ + scale) |

つまり **Frame system が generalize**、 Editor Mode は Editor scene instance。
Frame system が ship した暁には Editor Mode は Frame protocol の上に再実装される (D-2 〜 D-12 は
Editor Frame の slot 定義として残る)。

## 6. VP との関係 — primary consumer

Vantage Point は multi-pane app (TUI + WebView)。 Frame system 適用後:

- VP scene (`terminal-mode` / `doc-mode` / `browse-mode`) を Frame として定義
- pane = view component の slot binding
- 切替 = Frame morph
- TUI + WebView 混合は同 Frame に対して platform-specific render

VP が Frame system の **最重要 proof point**。 VP で動けば creo-memories DevEditor 等も追従しやすい。

## 7. 情報密度の理屈

平面 2D は `(x, y)` + z-index = 3 axis (視覚的 flat)。
Frame system では:

- **x, y** — 既存の平面位置
- **z** — 実深度 (CSS perspective による視差含む)
- **rotateX / rotateY** — 角度による「向き」 表現
- **scale** — 大小による「重要度」 表現
- **depth-of-field (blur)** — focus / unfocus の選択的提示

5+ axis を視覚に投影できる → 同じ画面面積で表現できる「相対関係」 が倍以上。
ただし trade-off は cognitive load — 過剰な 3D は情報密度を上げず、 視覚 noise になる。 適切な restraint が必要。

## 8. 不変条件 (Constraints)

1. `prefers-reduced-motion: reduce` で全 3D 動きを flat fallback (a11y 契約、 negotiable ではない)
2. Mobile / 低性能 device で graceful degradation (60 FPS を割らない、 perspective 切る)
3. Token SSOT 強制継続 (3D parameter / depth 値も hardcode 禁止、 `--depth-*` token 経由)
4. Cross-platform abstract 維持 (depth metaphor 抽象、 literal 3D 非依存)
5. Cognitive load 制限 (1 画面で active depth layer は 3 まで、 それ以上は flatten)

## 9. Phase plan

| Phase | scope | 工数 |
|---|---|---|
| **P-0** | docs site visual depth (perspective + card translateZ + sidebar depth + reduced-motion guard) | 着手中 |
| **P-1** | `tokens/depth/` + `tokens/motion/` + `tokens/frame/` 追加 | 1h |
| **P-2** | **自作 motion engine** (Web Animations API 直叩き、 FLIP + spring + easing token bridge) — Motion One が 2024 年 archive 化したため自作必須。 詳細は [stack-adr.md](./stack-adr.md) | 2-3h |
| **P-3** | 新 package `creo-ui-frame` (Solid + 自作 motion engine 同梱)、 `<FrameProvider>` `<FrameSlot>` `setFrame()` | 1 session |
| **P-4** | 新 package `creo-ui-vision` (webcam motion との統合)。 詳細は [vision-input.md](./vision-input.md) | 1 session |
| **P-5** | docs site Playground で Frame morph + gesture demo (P-3, P-4 合成) | 0.5 session |
| **P-6** | VP 統合 (VP の pane を Frame protocol に refactor) | multi-session |

## 10. やってはいけない

- 全 page を Frame で扱おうとしない (適用粒度の判断、 普通の SPA route で十分なケースも)
- Frame system が Editor Mode を置き換えると思わない (Editor Mode は Frame の Editor scene instance)
- Web の派手な 3D を SwiftUI / ratatui に強要しない (depth metaphor abstract で render する)
- 3D 値を hardcode しない (必ず token 経由、 原則 6 ([principles](../../examples/docs/src/pages/Foundations/Principles.tsx)))
