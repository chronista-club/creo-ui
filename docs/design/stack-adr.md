# Stack ADR — Creo UI Architecture Decision Record

**Status**: ADR — 採用済 + 計画中の組合せ
**Date**: 2026-05-01
**Trigger**: 3D Frame system + Vision Input vision を踏まえた stack 再考、 + Motion One archived 事実
**Owners**: Creo UI maintainer
**Related**: [frame-system.md](./frame-system.md), [vision-input.md](./vision-input.md), [editor-mode.md](./editor-mode.md), [theme-system.md](./theme-system.md)

---

## 1. Decision summary

Keep current core (SolidJS + Vite + Bun + DTCG + DOM/CSS 3D)、
add **narrow self-built motion engine** + **MediaPipe** for vision、
optional Three.js for spatial canvas、
optional Lit for cross-framework primitive distribution。

## 2. Keep — 現スタック維持 (再考しても変える理由なし)

### 2.1 SolidJS 1.9 (reactivity)

**必然性**: Frame morph + motion capture の **60 FPS signal stream** で React VDOM だと 30-40% CPU、
Solid signal は変更箇所だけ DOM 直更新で 5-10% で済む。 VDOM 経由は性能ボトルネック。

候補比較:

| Lib | VDOM | bundle | Frame morph 適性 | 採用 |
|---|---|---|---|---|
| **SolidJS 1.9** | ❌ (signal) | ~7KB | ✅ 最良 | **✅ 採用** |
| Svelte 5 (runes) | ❌ (compile) | ~5KB | ✅ 良好 | 候補だが既存 creo-ui-* が Solid なので継続 |
| React 19 | ✅ | ~45KB | ⚠ 性能阻害 | ❌ |
| Vue 3 | ✅ (proxy) | ~40KB | ⚠ 性能阻害 | ❌ |
| Lit (web component) | ❌ | ~10KB | ✅ ただし dev velocity が落ちる | future cross-framework 配布用に併用 |

### 2.2 周辺 toolchain

- **Vite 5** — 高速 HMR + WASM 透過対応 (creo-md-wasm で検証済、 459KB WASM が dev で透過 load)
- **Bun 1.3** — install 速、 `bun test` も使える、 workspace 自然
- **TypeScript 5.5** — strict mode + signal 型推論
- **Biome 1.9** — 早い lint、 docs site の dogfood ループ確立

### 2.3 design system core

- **DTCG + Style Dictionary v4** — multi-platform parity の identity (creo-ui の identity)
- **DOM + CSS Grid + CSS 3D** — a11y / SEO / form / text 自然サポート、 Frame system は CSS 3D で 80% 実現

## 3. Add — narrow self-built (Creo UI が own すべき領域)

### 3.1 自作 motion engine (`creo-ui-frame` 内同梱、 将来 `creo-ui-motion` 抽出可)

**理由**:

- **Motion One が 2024 年 archive 化** ([motiondivision/motionone](https://github.com/motiondivision/motionone)) — 「人気 lib でも消える」 wake-up call
- Frame morph engine は Frame system の core 機能 → own すべき領域
- 既存 creo-ui の所有領域 (Token SSOT / Editor Mode protocol / md-view / editor-host) と整合

**実装基盤**:

- **Web Animations API** (`Element.animate()`) を直叩き — Chrome 84+ / Safari 13.1+ / Firefox 75+ 標準、 polyfill 不要
- **FLIP technique** (Paul Lewis) — measure → invert → play
- **Spring physics** 自作 (Hooke's law、 ~30 行)
- **Easing は token** (`tokens/motion/easing.json`) から bridge
- **Reduced motion guard** 統合 (`prefers-reduced-motion: reduce` で instant snap)
- **~600-800 LOC 想定** (narrow surface area)

**API surface**:

```ts
flip(el, prevRect, options)                          // FLIP core
morphFrame(slots, fromFrame, toFrame, options)        // Frame transition (coordinated)
ease(name) → cubic-bezier string                      // token bridge
spring(stiffness, damping)                            // physics
respectsReducedMotion()                               // a11y check
```

## 4. Add — third-party (replaceable な lib)

| Lib | 用途 | サイズ | risk 評価 |
|---|---|---|---|
| **MediaPipe Tasks Web** | Hand / Pose / Face / Gesture (`creo-ui-vision` で wrap) | ~3MB | Google 依存だが代替なし、 lazy load 必須 |
| **Three.js + solid-three** (optional) | spatial canvas (hero / playground)、 WebGL 区画限定 | ~600KB | 普及 lib、 archive リスク低 |
| **Lit web components** (future) | primitive 配布、 cross-framework consumer 対応 (`<creo-button>` 等) | ~10KB | W3C 標準、 安全 |
| **WebGPU** (future) | 全 browser 対応待ち、 高性能 | (built-in) | Chrome / Safari preview 段階 |

## 5. Rejected — 採用しない選択

| 候補 | 却下理由 |
|---|---|
| **Motion One** | 2024 年 archive 化 ([source](https://github.com/motiondivision/motionone))、 narrow self-built の決定打 |
| **React / Next.js** | VDOM が Frame morph + motion capture の性能を阻害、 SolidJS と比較して劣る |
| **Webcam frame の server 送信** | privacy 重視、 on-device (MediaPipe Tasks) 完結 |
| **Token hardcode** (depth / motion 含む) | 原則 6 (Token SSOT 強制) 違反 |

## 6. New packages (計画)

| Package | Scope | 工数目安 |
|---|---|---|
| `creo-ui-frame` | Frame system runtime (Solid + 自作 motion engine 同梱) | 1 session |
| `creo-ui-vision` | webcam motion (MediaPipe wrapper、 Solid signals) | 1 session |
| (future) `creo-ui-spatial` | WebGL spatial canvas (Three.js + solid-three) | multi-session |
| (future) `creo-ui-motion` | 自作 motion engine の独立 publish (`creo-ui-frame` から抽出) | 0.5 session |

## 7. New token directories (計画)

| Directory | Tokens |
|---|---|
| `tokens/depth/` | fg / mid / bg (3 step abstract) |
| `tokens/motion/` | easing curves / durations / spring presets |
| `tokens/frame/` | Frame 定義 (slots × perspective、 dashboard / reading / editor 等の preset) |

## 8. Tensions / Risks

| # | 緊張 | 対処方針 |
|---|---|---|
| T-1 | Multi-platform parity vs Frame | depth metaphor として abstract、 platform 慣習で render |
| T-2 | Bundle 肥大 (MediaPipe ~3MB + Three.js ~600KB で 4MB+) | vision / spatial は opt-in feature flag、 lazy load 必須 |
| T-3 | Webcam の cognitive overhead (gesture 語彙の覚え必要) | 「ヘルプ画面で gesture 一覧」 を docs に |
| T-4 | a11y 契約の重さ | reduced-motion / camera fallback / gesture 代替 keyboard / privacy LED 全部 contract、 自動 test 困難 |
| T-5 | Frame system の overhead vs gain (全画面 Frame 不要) | 適用粒度の判断、 普通の SPA route で十分なケースも |
| T-6 | Lib 依存 drift (Motion One archive 事例) | narrow に own できるものは own、 replaceable な lib は使う |

## 9. Decision principles — How to apply (新 lib 採用判断時)

1. **「narrow に own すべきか」 を問う**
   core 機能 / protocol owner なら own、 visual library や ML model のような重い専門領域は third-party
2. **「替えが効くか」 を問う**
   Motion One のように消える可能性、 普及度、 メンテナの安定性
3. **「creo-ui の哲学に合うか」 を問う**
   token SSOT 強制、 multi-platform abstract、 a11y / privacy 契約
4. **bundle / latency / cognitive cost を計上**
