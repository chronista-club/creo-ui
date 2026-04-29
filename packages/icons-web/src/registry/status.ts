import type { IconName } from '../core/types'

// Status icons — success/error/warning/info/loading 等の汎用 state expression。
// 主 source: mingcute (Line/Fill 2 軸 で active 切替)、 loading は svg-spinners。
export const STATUS = {
  // success
  success: 'mingcute:check-circle-line' as IconName,
  successActive: 'mingcute:check-circle-fill' as IconName,

  // error / failure
  error: 'mingcute:close-circle-line' as IconName,
  errorActive: 'mingcute:close-circle-fill' as IconName,

  // warning / caution
  warning: 'mingcute:warning-line' as IconName,
  warningActive: 'mingcute:warning-fill' as IconName,

  // information / hint
  info: 'mingcute:information-line' as IconName,
  infoActive: 'mingcute:information-fill' as IconName,

  // question / unknown
  question: 'mingcute:question-line' as IconName,
  questionActive: 'mingcute:question-fill' as IconName,

  // loading / pending (動的、 svg-spinners は CSS 不要で動く)
  loading: 'svg-spinners:bars-rotate-fade' as IconName,
  loadingRing: 'svg-spinners:90-ring' as IconName,
  loadingDots: 'svg-spinners:dots-bounce' as IconName,
  loadingPulse: 'svg-spinners:pulse-3' as IconName,
} as const

export type StatusIconKey = keyof typeof STATUS
