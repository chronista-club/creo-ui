# creo-ui-vision

> Webcam motion capture for Creo UI — MediaPipe Tasks wrapper exposed as SolidJS signals。
> docs/design/vision-input.md の reference 実装。

## Status (2026-05-02)

**Phase 4 (skeleton + types + provider + hooks + mock source)** ship 中。
実 MediaPipe Tasks Web SDK 統合は P-4.5 で実装予定。 現状は **mock source** で dev / Playground 動作確認可能。

| Surface | Status |
|---|---|
| Types (HandPinch / HeadPose / FaceMesh / GestureEvent) | ✅ |
| `<VisionProvider source>` + Solid context | ✅ |
| Hooks (useHandPinch / useHeadPose / useFaceMesh / useFacePresence / useGesture) | ✅ |
| Permission helper (getUserMedia wrapper) | ✅ |
| Mock source (dev / test / CI) | ✅ |
| MediaPipe Tasks 実 source (`createMediaPipeSource`) | ⚠ P-4.5 |

## なぜ source plug-in pattern?

`<VisionProvider source={...}>` で **inference engine を差し替え可**:
- `createMediaPipeSource()` — 実 webcam + MediaPipe (P-4.5)
- `createMockSource()` — synthetic data (dev / test / docs Playground、 ✅ ship 済)
- `createDisabledSource()` — camera off / permission denied 時の fallback

同 hooks API (`useHandPinch()` 等) が source 横断で動作。 docs Playground は mock で実演、
production app は MediaPipe で本番 inference、 と use case 別に最適 source を選べる。

## 5 不変条件 (a11y / privacy contract — docs/design/vision-input.md V-1〜V-5)

1. **Keyboard fallback 必須** — gesture が唯一の入力経路にしない
2. **Camera ON indicator 常時可視** — privacy transparency
3. **prefers-reduced-motion で head-pose parallax 無効** — vestibular 配慮
4. **Raw frame on-device only** — server 送信なし (MediaPipe Tasks 採用の決定打)
5. **User opt-in default** — default OFF、 explicit enable 必須

## Install

```sh
bun add creo-ui-vision solid-js
```

## Usage — mock source (P-4 ship、 dev / test 向け)

```tsx
import { VisionProvider, useHandPinch, useHeadPose } from 'creo-ui-vision'
import { createMockSource } from 'creo-ui-vision/mock'

const mockSource = createMockSource({
  // 1.5 秒周期で pinch ON/OFF 繰り返し、 円周上を移動
  pattern: 'orbit',
  interval: 1500,
})

function App() {
  return (
    <VisionProvider source={mockSource}>
      <Demo />
    </VisionProvider>
  )
}

function Demo() {
  const pinch = useHandPinch()
  const head = useHeadPose()
  return (
    <div>
      <p>pinch: {pinch()?.active ? 'YES' : 'no'}</p>
      <p>x: {pinch()?.x.toFixed(2)}, y: {pinch()?.y.toFixed(2)}</p>
      <p>head pitch: {head()?.pitch.toFixed(1)}deg</p>
    </div>
  )
}
```

## Usage — MediaPipe source (P-4.5 予定、 production)

```tsx
// 将来 API 想定 (まだ未実装)
import { createMediaPipeSource } from 'creo-ui-vision/mediapipe'

const source = await createMediaPipeSource({
  camera: 'user',
  sampleRate: 30,
  models: ['hand', 'face'],   // load を要求する task
})

<VisionProvider source={source}>
  <App />
</VisionProvider>
```

## Editor Mode protocol との統合 (将来 P-5)

`creo-ui-vision` の signals を `creo-ui-editor-host` の field に bridge:

```tsx
import { useHandPinch } from 'creo-ui-vision'
import { useEditorHost } from 'creo-ui-editor-host'

const pinch = useHandPinch()
const host = useEditorHost()

createEffect(() => {
  if (pinch()?.active) {
    host.setValue('frame.action', 'select')   // gesture → field operation
  }
})
```

→ keyboard / mouse / gesture / MCP の 4 経路が **unified field operation model** に収まる。

## Frame system との統合 (将来 P-5)

```tsx
import { useFrame } from 'creo-ui-frame'
import { useGesture } from 'creo-ui-vision'

const { setFrame } = useFrame()

useGesture((event) => {
  if (event.type === 'wave') setFrame('next')   // wave → Frame morph trigger
})
```

## License

Apache-2.0
