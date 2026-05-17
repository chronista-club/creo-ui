/**
 * @chronista-club/creoui-editor-host — 8 theme meta (name / family / flavor)
 *
 * creoui 0.1.0 が同梱する 8 theme に対応。`theme.mode` field の値を引けば
 * ThemeEditor が name / family / flavor を表示できる。theme 追加時は
 * `tokens/color/themes/` と合わせてここも更新する。
 */

export interface ThemeInfo {
  id: string
  name: string
  family: string
  flavor: string
}

export const THEME_INFO: Record<string, ThemeInfo> = {
  'mint-dark': {
    id: 'mint-dark',
    name: 'Mint Dark',
    family: 'Creo',
    flavor: 'Dark theme with mint green accent — Creo Design System default',
  },
  'mint-light': {
    id: 'mint-light',
    name: 'Mint Light',
    family: 'Creo',
    flavor: 'Default light theme with mint green accent',
  },
  'sora-dark': {
    id: 'sora-dark',
    name: '空 (Sora) Dark',
    family: '空 (Sora)',
    flavor: 'Night sky-inspired dark theme',
  },
  'sora-light': {
    id: 'sora-light',
    name: '空 (Sora)',
    family: '空 (Sora)',
    flavor: 'Sky-inspired light theme with sky blue accent',
  },
  'contrast-dark': {
    id: 'contrast-dark',
    name: 'Paradox Dark',
    family: 'Contrast / Paradox',
    flavor: 'The paradox at nightfall — purple × pink × cyan が暗闇で際立つ',
  },
  'contrast-light': {
    id: 'contrast-light',
    name: 'Paradox Light',
    family: 'Contrast / Paradox',
    flavor: 'The paradox in daylight — 対立色が白の上で共存する矛盾',
  },
  'oldschool-dark': {
    id: 'oldschool-dark',
    name: 'Old School Dark',
    family: 'Old School',
    flavor: 'Retro natural dark theme — teal × orange',
  },
  'oldschool-light': {
    id: 'oldschool-light',
    name: 'Old School',
    family: 'Old School',
    flavor: 'Retro natural light theme — teal × orange',
  },
}

/** 8 theme の id (default = mint-dark が先頭) */
export const THEME_IDS = [
  'mint-dark',
  'mint-light',
  'sora-dark',
  'sora-light',
  'contrast-dark',
  'contrast-light',
  'oldschool-dark',
  'oldschool-light',
] as const

export type ThemeId = (typeof THEME_IDS)[number]

export const DEFAULT_THEME_ID: ThemeId = 'mint-dark'

/**
 * ThemeEditor / swatch grid で表示する代表 token (15 種、CSS 変数で theme 追従)。
 */
export const SWATCH_ROWS: readonly { label: string; cssVar: string }[] = [
  { label: 'brand.primary', cssVar: '--color-brand-primary' },
  { label: 'brand.primary-hover', cssVar: '--color-brand-primary-hover' },
  { label: 'brand.primary-subtle', cssVar: '--color-brand-primary-subtle' },
  { label: 'brand.secondary', cssVar: '--color-brand-secondary' },
  { label: 'semantic.success', cssVar: '--color-semantic-success' },
  { label: 'semantic.warning', cssVar: '--color-semantic-warning' },
  { label: 'semantic.error', cssVar: '--color-semantic-error' },
  { label: 'semantic.info', cssVar: '--color-semantic-info' },
  { label: 'surface.bg-base', cssVar: '--color-surface-bg-base' },
  { label: 'surface.bg-subtle', cssVar: '--color-surface-bg-subtle' },
  { label: 'surface.surface', cssVar: '--color-surface-surface' },
  { label: 'surface.border', cssVar: '--color-surface-border' },
  { label: 'text.primary', cssVar: '--color-text-primary' },
  { label: 'text.secondary', cssVar: '--color-text-secondary' },
  { label: 'text.tertiary', cssVar: '--color-text-tertiary' },
] as const
