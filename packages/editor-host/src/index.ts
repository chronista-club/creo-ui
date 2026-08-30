/**
 * @chronista-club/creo-ui-editor-host — public API (Step 5 + Target × Control 分離)
 *
 * Consumer が import するのは bind() を中心とする high-level API。
 * EditorField / EditorHost / register / createEditorHost 等の低レベルは
 * internal に隠蔽 (package 内部でのみ使われる)。
 */

// ---------- Binder (Target × Control conductor) ----------
export type { Binder, BindOptions, Placement } from './binder'
export { bind } from './binder'

// ---------- Control (UI 操作体系) ----------
export type {
  BooleanControl,
  BooleanVariant,
  ColorControl,
  ColorVariant,
  Control,
  NumberControl,
  NumberVariant,
  ReadonlyTextControl,
  SelectControl,
  SelectVariant,
  StringControl,
  StringVariant,
} from './control'
export { boolean, color, number, readonlyText, select, string } from './control'
export { ExportBar } from './export-bar'
export { useEditorHover, useEditorMode, useEditorSelectable, useEditorSelection } from './hooks'
// ---------- UI components ----------
export { EditorLayer } from './layer'
// ---------- Provider + hooks ----------
export { EditorHostProvider, useComponentResolver, useEditorHost } from './provider'
// ---------- Target (対象、データ源) ----------
export type { Target } from './target'
export {
  cssVarNumberTarget,
  cssVarTarget,
  editorHostTarget,
  ephemeralTarget,
  localStorageTarget,
  signalTarget,
} from './target'
export { ThemeEditor } from './theme-editor'
// ---------- Theme meta ----------
export {
  DEFAULT_THEME_ID,
  SWATCH_ROWS,
  THEME_IDS,
  THEME_INFO,
  type ThemeId,
  type ThemeInfo,
} from './theme-info'
// ---------- Public semantic types ----------
export type {
  EditorField,
  EditorFieldConstraints,
  EditorFieldType,
  EditorHost,
  EditorHostConfig,
  EditorHostMcpApi,
  EditorMode,
  EditorPersistence,
  EditorRole,
  EditorSemantic,
  EditorShortcut,
  SelectionInfo,
} from './types'

// ---------- Live design surface (Step 6: F1-F5) ----------

// F2: DOM auto-discover / F2b: private tweak var auto-discover
export {
  type AutoDiscoverOptions,
  autoDiscover,
  autoDiscoverTweaks,
  bindDiscoveredVar,
  type DiscoveredPlacement,
  type DiscoveredVar,
  parseTweakVarRefs,
  type RawTweakVar,
  resolveTweakVar,
  scanCssVars,
  scanRawTweakVars,
  scanTweakVars,
  sliderSpecFor,
  type TweakDiscoverOptions,
  type TweakVarRef,
  tweakPlacement,
  tweakVarToId,
} from './auto-discover'
// F2c: 選択駆動の component field 解決 (data-editor-fields の事前仕込みが不要)
export {
  buildKnobIndex,
  type ComponentEntry,
  type ComponentFieldResolver,
  type ComponentFieldResolverOptions,
  type ComponentKnob,
  type ComponentSelection,
  createComponentFieldResolver,
  type KnobIndex,
  matchKnobs,
  toComponentKnobs,
} from './component-fields'
export {
  COMPONENT_CLASS_PREFIX,
  componentClassIdsOf,
  componentDisplayName,
  componentIdOfElement,
  componentSelector,
  knobLabel,
  parseTweakVarName,
  TWEAK_SEPARATOR,
  type TweakVarName,
} from './component-id'
export { buildComponentTree, type ComponentTreeNode } from './component-tree'
// F1: Console REPL
export type { ConsoleApi } from './console'
// F5: Cross-tab sync
export { type CrossTabOptions, installCrossTabSync } from './cross-tab'
// F3: Export
export { type ExportFormat, type ExportOptions, exportSnapshot } from './export'
// Phase M6: OKLCH utilities (color editor / theme editor 向け)
export {
  formatOklch,
  OKLCH_C_MAX,
  type Oklch,
  type OklchChannel,
  oklchTrackGradient,
  parseOklch,
} from './oklch'
// F4: URL share
export {
  applyFromUrl,
  installUrlSync,
  shareUrl,
  type UrlSyncOptions,
} from './url-sync'

// ---------- Layout helpers ----------

/** Corner concentric (Apple HIG iOS 16+): 親子同心円 radius helper */
export { concentric, concentricTokens } from './helpers/concentric'

// ---------- i18n primitive (CREO-91) ----------

export type { Locale, LocaleProviderProps, LocalizedText, Messages } from './i18n'
export { detectLocale, LocaleProvider, messages, translate, useLocale, useT } from './i18n'
