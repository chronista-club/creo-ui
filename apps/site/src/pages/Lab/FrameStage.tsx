import { FrameSlot, useFrame } from 'creo-ui-frame'

/**
 * dashboard / reading の 2 frame を切替える共有 stage (FrameLab / VisionLab 共用)。
 * hero / sidebar / main の 3 slot に card を bind し、setFrame で morph する。
 */
export function FrameStage() {
  const { setFrame, currentFrameId } = useFrame()

  return (
    <div>
      <div class="cu-row cu-center cu-gap-s docs-frame-controls">
        <button
          type="button"
          class="creo-btn"
          data-variant={currentFrameId() === 'dashboard' ? 'primary' : 'secondary'}
          onClick={() => setFrame('dashboard')}
        >
          dashboard
        </button>
        <button
          type="button"
          class="creo-btn"
          data-variant={currentFrameId() === 'reading' ? 'primary' : 'secondary'}
          onClick={() => setFrame('reading')}
        >
          reading
        </button>
        <span class="docs-frame-current">
          current: <code>{currentFrameId()}</code>
        </span>
      </div>
      <div class="docs-frame-stage">
        <FrameSlot name="hero">
          <div class="docs-frame-slot-card" data-slot="hero">
            <span class="docs-frame-slot-label">HERO</span>
            <p>Title / page entrance</p>
          </div>
        </FrameSlot>
        <FrameSlot name="sidebar">
          <div class="docs-frame-slot-card" data-slot="sidebar">
            <span class="docs-frame-slot-label">SIDEBAR</span>
            <p>Nav / source</p>
          </div>
        </FrameSlot>
        <FrameSlot name="main">
          <div class="docs-frame-slot-card" data-slot="main">
            <span class="docs-frame-slot-label">MAIN</span>
            <p>Content / focus</p>
          </div>
        </FrameSlot>
      </div>
    </div>
  )
}
