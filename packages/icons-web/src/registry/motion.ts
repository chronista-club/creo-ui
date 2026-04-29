import type { IconName } from '../core/types'

// Motion icons — svg-spinners (MIT、 SMIL animated)。
// 「待ち状態」専用、 CSS keyframes 不要で動く。 contextual variant 別 alias を提供。
// VP context: Lane init 起動中 / SP spawn 待ち / MCP request pending / OSC 配送中 / build 中 等。
export const MOTION = {
  // generic / universal
  default: 'svg-spinners:90-ring' as IconName,

  // process spawn (long-running、 自然な回転)
  spawn: 'svg-spinners:bars-rotate-fade' as IconName,

  // network request (短時間、 軽い動き)
  request: 'svg-spinners:dots-bounce' as IconName,

  // notification 配送 (脈動)
  notify: 'svg-spinners:pulse-3' as IconName,

  // ring resize (port scan の rhythm)
  scan: 'svg-spinners:ring-resize' as IconName,

  // build / work-in-progress (rhythm 視認)
  build: 'svg-spinners:bars-scale' as IconName,

  // gooey / playful
  gooey: 'svg-spinners:gooey-balls-1' as IconName,

  // wifi (network status)
  wifi: 'svg-spinners:wifi' as IconName,

  // clock (時間関連)
  clock: 'svg-spinners:clock' as IconName,
} as const

export type MotionIconKey = keyof typeof MOTION
