# creo-ui-vision

> Webcam motion capture for Creo UI — MediaPipe Tasks wrapper exposed as SolidJS signals。
> docs/design/vision-input.md の reference 実装。

## Status (2026-05-03)

**Phase 4 (skeleton) + Phase 4.5 (MediaPipe 実 source)** ship 済。
mock 動作確認 → 実 webcam 統合まで完成。

| Surface | Status |
|---|---|
| Types (HandPinch / HeadPose / FaceMesh / GestureEvent) | ✅ |
| `<VisionProvider source>` + Solid context | ✅ |
| Hooks (useHandPinch / useHeadPose / useFaceMesh / useFacePresence / useGesture) | ✅ |
| Permission helper (getUserMedia wrapper) | ✅ |
| Mock source (dev / test / CI) | ✅ |
| MediaPipe Tasks 実 source (`createMediaPipeSource`) | ✅ Phase 4.5 |

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

## Usage — MediaPipe source (P-4.5 ship、 production)

`@mediapipe/tasks-vision` は **optional peerDependency**。 createMediaPipeSource を
使う場合のみ install 必要 (mock-only consumer は不要):

```sh
bun add @mediapipe/tasks-vision
```

```tsx
import { VisionProvider, useHandPinch, useHeadPose } from 'creo-ui-vision'
import { createMediaPipeSource } from 'creo-ui-vision/mediapipe'

// Async factory — FilesetResolver + Landmarker を init (Google CDN から WASM + model load)
const source = await createMediaPipeSource({
  camera: 'user',
  models: ['hand', 'face'],   // 'hand' のみで軽量化も可
  delegate: 'GPU',             // CPU fallback も対応
})

function App() {
  return (
    <VisionProvider source={source} autoStart={false}>
      <Demo />
    </VisionProvider>
  )
}

function Demo() {
  const { state, start, stop } = useVision()
  const pinch = useHandPinch()
  const head = useHeadPose()
  return (
    <>
      <Show when={!state().enabled}>
        <button onClick={() => void start()}>Enable webcam</button>
      </Show>
      <Show when={state().enabled}>
        <button onClick={stop}>Stop</button>
        <p>pinch: {pinch()?.active ? 'YES' : 'no'} ({pinch()?.x.toFixed(2)})</p>
        <p>head pitch: {head()?.pitch.toFixed(1)}deg</p>
      </Show>
    </>
  )
}
```

### Lazy load + bundle

`createMediaPipeSource` は内部で `await import('@mediapipe/tasks-vision')` を使う dynamic import。
consumer の bundler (vite/webpack) が **vendor chunk として分割** するので、 createMediaPipeSource
が呼ばれない page では @mediapipe/tasks-vision のコードは読み込まれない (~3MB lazy)。

### Privacy (V-4)

Raw video frame は `<video>` element から HandLandmarker / FaceLandmarker の WASM 内に閉じ、
**server 送信なし**。 すべて on-device 推論。 model file (~15MB hand model) は CDN から download
されるが、 これは推論に必要な weights であって video frame は送られない。

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
