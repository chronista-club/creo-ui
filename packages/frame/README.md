# creo-ui-frame

> 3D Frame system runtime for Creo UI — Spatial Layout protocol + self-built motion engine。
> docs/design/frame-system.md の **P-3 reference 実装**。

## Status (2026-05-05)

**P-2 (motion engine) + P-3 (Frame protocol) + P-4 (vision 連結) + P-5 (docs Playground dogfood) ship 済**。 P-6 (VP 統合) のみ remaining。

| Surface | Status |
|---|---|
| `creo-ui-frame/motion` | ✅ FLIP / spring (Hooke's law + WAAPI `linear()`) / token bridge / reduced-motion guard |
| `creo-ui-frame/frame` | ✅ FrameProvider / FrameSlot / useFrame / setFrame |
| `creo-ui-frame` (root) | ✅ frame + motion 統合 export |
| `creo-ui-vision` 連結 | ✅ docs Playground で gesture (`useGesture('wave')` → `setFrame`) + spatial pinch bridge dogfood |
| `morphFrame()` coordinator | ✅ Ship (`motion/morph.ts` — 複数 slot の atomic transition、 `flip()` 再利用、 reduced-motion guard 自動承継) |

## Why self-built motion?

[Motion One](https://github.com/motiondivision/motionone) が 2024 年 archive 化。 narrow に own すべき
core 機能 (Frame morph engine) は creo-ui の哲学 (token SSOT / multi-platform parity) と一致するので
**自作で持つ**。 詳細は [`docs/design/stack-adr.md`](../../docs/design/stack-adr.md) 参照。

## Install

```sh
bun add creo-ui-frame solid-js
```

## Usage — Frame protocol (Phase 3)

```tsx
import { FrameProvider, FrameSlot, useFrame, type Frame } from 'creo-ui-frame'

const dashboardFrame: Frame = {
  id: 'dashboard',
  slots: {
    hero:    { x: 0,    y: 0,   z: 8 },
    sidebar: { x: -240, y: 0,   z: 0 },
    main:    { x: 240,  y: 0,   z: 0 },
  },
  perspective: 1400,
}

const readingFrame: Frame = {
  id: 'reading',
  slots: {
    hero:    { x: 0,    y: -40, z: 16, scale: 1.2 },
    sidebar: { x: -480, y: 0,   z: -20, opacity: 0.3 },
    main:    { x: 0,    y: 0,   z: 0,  scale: 1.05 },
  },
  perspective: 'var(--frame-perspective-deep)',
  transition: { duration: 480, easing: 'spring' },
}

function App() {
  return (
    <FrameProvider frames={[dashboardFrame, readingFrame]} initial="dashboard">
      <FrameSlot name="hero">
        <Hero />
      </FrameSlot>
      <FrameSlot name="sidebar">
        <Nav />
      </FrameSlot>
      <FrameSlot name="main">
        <Article />
      </FrameSlot>
      <FrameSwitcher />
    </FrameProvider>
  )
}

function FrameSwitcher() {
  const { currentFrameId, setFrame } = useFrame()
  return (
    <button onClick={() => setFrame(currentFrameId() === 'dashboard' ? 'reading' : 'dashboard')}>
      Switch
    </button>
  )
}
```

`<FrameSlot>` は CSS transition で transform / opacity を morph。 reduce-motion 時は
`transition: none` で snap。 同 DOM が保持されるので scroll position / focus / animation
state は連続 (D-2 視点移動メタファ)。

## Usage — motion engine

### FLIP technique

```ts
import { flip, measureRect } from 'creo-ui-frame/motion'

const el = document.querySelector('.box')!
const prev = measureRect(el)

// ... layout 変化 (DOM 操作 / class 変更 / style 変更) ...

flip(el, prev, { duration: 220, easing: 'spring' })
//   measure → invert → animate to identity transform
```

### Easing / duration token bridge

```ts
import { ease, duration } from 'creo-ui-frame/motion'

const easing = ease('spring')        // 'cubic-bezier(0.2, 0.8, 0.2, 1)'
const ms = duration('normal')        // 220

// CSS variable から runtime 取得 (theme 切替に追従可能)
import { easeFromCss, durationFromCss } from 'creo-ui-frame/motion'
const dynEasing = easeFromCss('spring')   // CSS var '--motion-easing-spring' を読む
```

### Spring physics

```ts
import { springEasing, springPreset } from 'creo-ui-frame/motion'

// 慣習 5 preset (gentle / wobbly / stiff / slow / tight) — 最短記述
const easing = springEasing('gentle')

// 物理パラメータ直接指定
const custom = springEasing({ stiffness: 280, damping: 20 })

// Preset を base に override
const blend = springEasing({ ...springPreset('wobbly'), samples: 100 })

el.animate([{ opacity: 0 }, { opacity: 1 }], {
  duration: 400,
  easing,
})
```

| Preset | stiffness | damping | mass | 用途 |
|---|---|---|---|---|
| `gentle` | 120 | 14 | 1 | UI hover / tooltip 等の控えめ動き |
| `wobbly` | 180 | 12 | 1 | 注意喚起 / playful UI |
| `stiff` | 280 | 24 | 1 | modal / sheet 開閉 |
| `slow` | 80 | 16 | 1 | 大きな page transition / hero 演出 |
| `tight` | 300 | 30 | 1 | chip / pill toggle 等 |

### Reduced-motion guard

```ts
import { respectsReducedMotion, watchReducedMotion } from 'creo-ui-frame/motion'

if (respectsReducedMotion()) {
  // user preferred reduce — skip animation, instant snap
}

// Subscribe to changes
const unsubscribe = watchReducedMotion((reduced) => {
  console.log('reduced-motion:', reduced)
})
```

`flip()` は内部で自動 short-circuit — `prefers-reduced-motion: reduce` では `null` を返し animation skip。
consumer は guard を毎回書かなくて良い。

## Token bridge

`creo-ui-web/tokens.css` の motion / depth / frame token と直結:

| API | Token (CSS variable) | Status |
|---|---|---|
| `ease(name)` | `--motion-easing-{linear,in,out,in-out,spring}` | ✅ |
| `duration(name)` | `--motion-duration-{instant,fast,normal,slow,lazy}` | ✅ |
| `Frame.perspective` (string で `var(...)` 渡し可) | `--frame-perspective-{default,shallow,deep}` | ✅ (`utils.ts#formatPerspective`) |
| `SlotPlacement.z` (string で `var(...)` 渡し可) | `--depth-{flat,raised,elevated,floating,modal}` | ✅ (`utils.ts#formatLength`) |
| Spring preset (`gentle` / `wobbly` / `stiff` / `slow` / `tight`) | (TS-only、 DTCG 化は B-δ-2) | ✅ `springEasing('gentle')` / `springPreset('gentle')` |

## Roadmap

| Phase | scope | Status |
|---|---|---|
| **P-2** | motion engine (this) — FLIP + spring + token bridge + reduced-motion | ✅ Ship (v0.1.0) |
| **P-3** | `<FrameProvider>` + `<FrameSlot>` + `setFrame()` API | ✅ Ship (v0.1.0) |
| **P-4** | `creo-ui-vision` 統合 (gesture → Frame morph) | ✅ Ship (mock + MediaPipe lazy load) |
| **P-5** | docs Playground demo (Frame morph + gesture + spatial pinch) | ✅ Ship (`examples/docs/src/pages/Lab/Playground.tsx`) |
| **P-6** | VP 統合 (VP の pane を Frame protocol に refactor) | ⏳ multi-session |
| **B-β** | `morphFrame()` coordinator (複数 slot の atomic transition) | ✅ Ship (本 PR、 `motion/morph.ts`) |
| **B-γ** | `<FrameSlot>` opt-in `useFlip` path (FLIP + spring 統合) | ⏳ 着手予定 |
| **B-δ** | Spring preset name (`gentle` / `wobbly` / `stiff` / `slow` / `tight`) | ✅ Ship (本 PR、 `motion/spring.ts`) |
| **B-ε** | test coverage 拡充 (flip / provider / slot Medium test) | ⏳ 着手予定 |

## License

Apache-2.0
