// Iconify icon name format: "{prefix}:{name}"
// 例: "ph:book-open" / "mingcute:settings-3-line" / "bi:filetype-rs"
export type IconName = `${string}:${string}`

// Curated VP-favored Iconify prefixes (10-set lineup)
// 詳細は creoui memory: feedback_creoui_icon_dual_axis.md (2026-04-29 確定)
export type IconPrefix =
  | 'mingcute' // friendly UI (button/dialog/menu)
  | 'iconoir' // minimal/dense (sidebar/list)
  | 'ph' // phosphor — expressive 6 weight (state-driven)
  | 'svg-spinners' // loading/pending (動的)
  | 'codicon' // editor/git/layout (VS Code 文化)
  | 'simple-icons' // brand mono logo
  | 'flagpack' // i18n 国旗 (ISO 3166-1)
  | 'noto' // Unicode emoji (cross-platform 統一)
  | 'bi' // Bootstrap Icons (filetype-* subset)

// Phosphor weight literal (state-driven mapping 用)
export type PhosphorWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
