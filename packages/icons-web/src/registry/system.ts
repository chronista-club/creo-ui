import type { IconName } from '../core/types'

// System icons — universal UI primitives。
// 主 source: mingcute (friendly Line/Fill 2 軸)、 一部 phosphor (state-driven)。
export const SYSTEM = {
  // settings & config
  settings: 'mingcute:settings-3-line' as IconName,
  settingsActive: 'mingcute:settings-3-fill' as IconName,

  // search
  search: 'mingcute:search-line' as IconName,

  // close & dismiss
  close: 'mingcute:close-line' as IconName,

  // confirmation
  check: 'mingcute:check-line' as IconName,
  checkActive: 'mingcute:check-fill' as IconName,

  // navigation chevrons
  chevronUp: 'mingcute:up-line' as IconName,
  chevronDown: 'mingcute:down-line' as IconName,
  chevronLeft: 'mingcute:left-line' as IconName,
  chevronRight: 'mingcute:right-line' as IconName,

  // misc
  more: 'mingcute:more-3-line' as IconName,
  menu: 'mingcute:menu-line' as IconName,
  add: 'mingcute:add-line' as IconName,
  remove: 'mingcute:minus-line' as IconName,
  edit: 'mingcute:edit-line' as IconName,
  copy: 'mingcute:copy-line' as IconName,
  trash: 'mingcute:delete-line' as IconName,
} as const

export type SystemIconKey = keyof typeof SYSTEM
