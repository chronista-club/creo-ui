import type { IconName } from '../core/types'

// Emoji icons — Noto Emoji (OFL 1.1、 Google maintain)。
// Unicode emoji を SVG として cross-platform 統一表示。
// VP context: mailbox body 内の inline emoji、 notification text、 Stand glyph 代替 (cross-platform 統一が要る場合)。
// 拡張は consumer 側で direct 名 (e.g. 'noto:eyes') 利用可。
export const EMOJI = {
  // basic feeling
  smile: 'noto:smiling-face-with-smiling-eyes' as IconName,
  thinking: 'noto:thinking-face' as IconName,
  sad: 'noto:disappointed-face' as IconName,
  surprise: 'noto:astonished-face' as IconName,

  // semantic / signal
  rocket: 'noto:rocket' as IconName,
  sparkles: 'noto:sparkles' as IconName,
  fire: 'noto:fire' as IconName,
  warning: 'noto:warning' as IconName,
  check: 'noto:check-mark' as IconName,
  cross: 'noto:cross-mark' as IconName,
  bell: 'noto:bell' as IconName,
  speechBalloon: 'noto:speech-balloon' as IconName,

  // VP Stand glyph cross-platform alternatives (現 Solar の代替)
  bookOpen: 'noto:open-book' as IconName,
  compass: 'noto:compass' as IconName,
  herb: 'noto:herb' as IconName,
  electricPlug: 'noto:electric-plug' as IconName,
  snake: 'noto:snake' as IconName,
  globe: 'noto:globe-showing-asia-australia' as IconName,

  // collab / signal
  handshake: 'noto:handshake' as IconName,
  party: 'noto:party-popper' as IconName,
  thumbsUp: 'noto:thumbs-up' as IconName,
  eyes: 'noto:eyes' as IconName,
} as const

export type EmojiIconKey = keyof typeof EMOJI
