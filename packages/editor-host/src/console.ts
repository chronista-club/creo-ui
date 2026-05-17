/**
 * creoui-editor-host — Console REPL (F1)
 *
 * `window.creoEditor` に expose される DevTools Console / Claude
 * (claude-in-chrome) 兼用の live design API。Target × Control 分離が factory
 * 関数の組合せなので、rebuild なしで console から slider / picker / flip /
 * chooser を増やせる。
 *
 * provider.tsx が getOwner() を保持して buildConsoleApi に渡すことで、console
 * 側の bind() が SolidJS の provider context 内で実行される。
 */
import { type Owner, runWithOwner } from 'solid-js'
import { type BindOptions, type Binder, type Placement, bind } from './binder'
import {
  type BooleanControl,
  type ColorControl,
  type NumberControl,
  type SelectControl,
  type StringControl,
  boolean as booleanControl,
  color,
  number,
  readonlyText,
  select,
  string as stringControl,
} from './control'
import {
  cssVarNumberTarget,
  cssVarTarget,
  editorHostTarget,
  ephemeralTarget,
  localStorageTarget,
  signalTarget,
} from './target'
import type { EditorField, EditorHost, EditorMode, EditorRole, EditorSemantic } from './types'

const VERSION = '0.1.0-dev'

export interface ConsoleApi {
  readonly host: EditorHost
  readonly version: string

  // --- Full form (Target × Control × Placement) ---
  bind<T>(opts: BindOptions<T>): Binder<T>

  readonly t: {
    cssVar: typeof cssVarTarget
    cssVarNumber: typeof cssVarNumberTarget
    signal: typeof signalTarget
    localStorage: typeof localStorageTarget
    ephemeral: typeof ephemeralTarget
    host: typeof editorHostTarget
  }
  readonly c: {
    number: typeof number
    color: typeof color
    boolean: typeof booleanControl
    select: typeof select
    string: typeof stringControl
    readonlyText: typeof readonlyText
  }

  // --- Sugar (最頻用) ---
  slider(
    cssVar: string,
    initial: number,
    opts?: Omit<NumberControl, 'kind'> & { label?: string; semantic?: EditorSemantic },
  ): Binder<number>
  picker(
    cssVar: string,
    initial: string,
    opts?: Omit<ColorControl, 'kind'> & { label?: string; semantic?: EditorSemantic },
  ): Binder<string>
  flip(
    id: string,
    initial: boolean,
    opts?: Omit<BooleanControl, 'kind'> & { label?: string; semantic?: EditorSemantic },
  ): Binder<boolean>
  chooser(
    id: string,
    initial: string,
    options: readonly string[],
    opts?: Omit<SelectControl, 'kind' | 'options'> & {
      label?: string
      semantic?: EditorSemantic
    },
  ): Binder<string>
  text(
    id: string,
    initial: string,
    opts?: Omit<StringControl, 'kind'> & { label?: string; semantic?: EditorSemantic },
  ): Binder<string>

  // --- Direct value read/write (host.mcp alias) ---
  getValue<T>(id: string): T | undefined
  setValue<T>(id: string, value: T): void

  // --- Inspection ---
  fields(filter?: { semantic?: EditorSemantic; role?: EditorRole }): EditorField[]
  values(): Record<string, unknown>
  describe(id: string): void

  // --- Snapshot / Restore (AI 親和: safe experiment → rollback) ---
  snapshot(): Record<string, unknown>
  restore(snapshot: Record<string, unknown>): void

  // --- Mode control ---
  readonly mode: {
    enable(): void
    disable(): void
    toggle(): void
    is(): EditorMode
  }

  // --- Share / Export / Auto-discover (F3/F4/F2 から注入) ---
  share(): string
  export(opts?: {
    format?: 'json' | 'yaml' | 'css' | 'css-patch'
    onlyChanged?: boolean
    indent?: number
  }): string
  autoDiscover(opts?: {
    prefixes?: readonly string[]
    semantic?: EditorSemantic
    skipExisting?: boolean
  }): Binder[]

  // --- Dev write-back (tokens/<cat>/scale.json に直書き戻し) ---
  /**
   * 現 editor state を dev server の `/_creo/tokens/commit` に POST し、
   * tokens/*.json の `$value` を書き換える。Vite plugin `creoTokensPlugin` が
   * 同 endpoint を listen している前提。production では fetch 失敗 or 404 が返る。
   */
  commitToTokens(opts?: {
    endpoint?: string
    onlyChanged?: boolean
  }): Promise<{
    applied: { id: string; value: unknown; file: string }[]
    skipped: string[]
  }>

  // --- Meta ---
  help(): void
}

/**
 * Provider から注入される sibling feature 群。循環依存を避けるため interface で
 * 受ける (実装は export.ts / url-sync.ts / auto-discover.ts が提供)。
 */
export interface ConsoleApiDeps {
  host: EditorHost
  /** provider の onMount で保持した getOwner() の結果 */
  owner: Owner | null
  exportSnapshot: (
    host: EditorHost,
    opts?: {
      format?: 'json' | 'yaml' | 'css' | 'css-patch'
      onlyChanged?: boolean
      indent?: number
    },
  ) => string
  shareUrl: (host: EditorHost) => string
  autoDiscover: (
    host: EditorHost,
    owner: Owner | null,
    opts?: { prefixes?: readonly string[]; semantic?: EditorSemantic; skipExisting?: boolean },
  ) => Binder[]
}

/** provider 側で deps を wire して console API object を構築する */
export function buildConsoleApi(deps: ConsoleApiDeps): ConsoleApi {
  const { host, owner } = deps

  const withOwner = <R>(fn: () => R): R => {
    if (owner) {
      const result = runWithOwner(owner, fn)
      if (result === undefined) {
        throw new Error(
          'creoEditor: provider owner が失効しました。<EditorHostProvider> を mount し直してください。',
        )
      }
      return result as R
    }
    return fn()
  }

  const api: ConsoleApi = {
    host,
    version: VERSION,

    bind<T>(opts: BindOptions<T>): Binder<T> {
      return withOwner(() => bind(opts))
    },

    t: {
      cssVar: cssVarTarget,
      cssVarNumber: cssVarNumberTarget,
      signal: signalTarget,
      localStorage: localStorageTarget,
      ephemeral: ephemeralTarget,
      host: editorHostTarget,
    },
    c: {
      number,
      color,
      boolean: booleanControl,
      select,
      string: stringControl,
      readonlyText,
    },

    // --- Sugar ---
    slider(cssVar, initial, opts = {}) {
      const { label, semantic = 'tool', ...controlOpts } = opts
      return withOwner(() =>
        bind<number>({
          target: cssVarNumberTarget(cssVar, cssVar, initial, controlOpts.unit ?? 'px'),
          control: number({ variant: 'slider', ...controlOpts }),
          placement: { label: label ?? cssVar, semantic },
        }),
      )
    },

    picker(cssVar, initial, opts = {}) {
      const { label, semantic = 'tool', ...controlOpts } = opts
      return withOwner(() =>
        bind<string>({
          target: cssVarTarget(cssVar, cssVar, initial),
          control: color({ variant: 'picker', ...controlOpts }),
          placement: { label: label ?? cssVar, semantic },
        }),
      )
    },

    flip(id, initial, opts = {}) {
      const { label, semantic = 'tool', ...controlOpts } = opts
      return withOwner(() =>
        bind<boolean>({
          target: ephemeralTarget(id, initial),
          control: booleanControl({ variant: 'switch', ...controlOpts }),
          placement: { label: label ?? id, semantic },
        }),
      )
    },

    chooser(id, initial, options, opts = {}) {
      const { label, semantic = 'tool', variant } = opts
      return withOwner(() =>
        bind<string>({
          target: ephemeralTarget(id, initial),
          control: select(options, variant),
          placement: { label: label ?? id, semantic },
        }),
      )
    },

    text(id, initial, opts = {}) {
      const { label, semantic = 'tool', ...controlOpts } = opts
      return withOwner(() =>
        bind<string>({
          target: ephemeralTarget(id, initial),
          control: stringControl(controlOpts.variant),
          placement: { label: label ?? id, semantic },
        }),
      )
    },

    // --- Value ---
    getValue<T>(id: string): T | undefined {
      return host.getValue<T>(id)
    },
    setValue<T>(id: string, value: T): void {
      host.setValue<T>(id, value)
    },

    // --- Inspection ---
    fields(filter) {
      return host.mcp.listFields(filter)
    },
    values() {
      return host.values()
    },
    describe(id) {
      const field = host.getField(id)
      if (!field) {
        console.warn(`[creoEditor] field "${id}" is not registered`)
        return
      }
      const current = host.getValue(id)
      console.log('%c[creoEditor] field', 'font-weight:bold', {
        id: field.id,
        label: field.label,
        type: field.type,
        semantic: field.semantic,
        group: field.group,
        role: field.role,
        persistence: field.persistence,
        initial: field.initial,
        current,
        constraints: field.constraints,
      })
    },

    // --- Snapshot ---
    snapshot() {
      return { ...host.values() }
    },
    restore(snapshot) {
      for (const [id, value] of Object.entries(snapshot)) {
        if (host.getField(id)) host.setValue(id, value)
      }
    },

    // --- Mode ---
    mode: {
      enable: () => host.enable(),
      disable: () => host.disable(),
      toggle: () => host.toggle(),
      is: () => host.mode(),
    },

    // --- Share / Export / AutoDiscover (deps 経由) ---
    share() {
      return deps.shareUrl(host)
    },
    export(opts) {
      return deps.exportSnapshot(host, opts)
    },
    autoDiscover(opts) {
      return withOwner(() => deps.autoDiscover(host, owner, opts))
    },

    // --- Dev write-back ---
    async commitToTokens(opts = {}) {
      const endpoint = opts.endpoint ?? '/_creo/tokens/commit'
      const onlyChanged = opts.onlyChanged ?? false
      const allValues = host.values()
      let values: Record<string, unknown> = allValues
      if (onlyChanged) {
        values = {}
        for (const field of host.fields()) {
          if (!Object.is(allValues[field.id], field.initial)) {
            values[field.id] = allValues[field.id]
          }
        }
      }
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values }),
        })
        if (!res.ok) {
          console.error(`[creoEditor.commitToTokens] HTTP ${res.status}`, await res.text())
          return { applied: [], skipped: Object.keys(values) }
        }
        const result = (await res.json()) as {
          applied: { id: string; value: unknown; file: string }[]
          skipped: string[]
        }
        if (result.applied.length > 0) {
          console.log(
            `[creoEditor] ✓ committed ${result.applied.length} token(s) to source files:`,
            result.applied.map((a) => `${a.id}=${a.value}`).join(', '),
          )
        }
        return result
      } catch (err) {
        console.error('[creoEditor.commitToTokens] failed:', err)
        return { applied: [], skipped: Object.keys(values) }
      }
    },

    // --- Help ---
    help() {
      const msg = [
        '────────────────────────────────────────────────',
        `creoEditor v${VERSION} — Live design surface`,
        '────────────────────────────────────────────────',
        '',
        '[Sugar]',
        "  creoEditor.slider('--spacing-m', 16, { min: 0, max: 48 })",
        "  creoEditor.picker('--color-brand-primary', '#73e7aa')",
        "  creoEditor.flip('app.show-footer', true)",
        "  creoEditor.chooser('theme.mode', 'mint-dark', ['mint-dark', 'sora-dark', ...])",
        "  creoEditor.text('user.name', 'Mako')",
        '',
        '[Full form]',
        '  creoEditor.bind({ target: t.cssVarNumber(...), control: c.number(...), placement: {...} })',
        '',
        '[Inspection]',
        '  creoEditor.fields()              // 全 field list',
        '  creoEditor.values()              // 現 snapshot',
        "  creoEditor.describe('foo.bar')   // field meta + current value",
        '',
        '[Snapshot / Restore (safe experiment)]',
        '  const s = creoEditor.snapshot()',
        '  // ... いろいろ試す ...',
        '  creoEditor.restore(s)            // 元に戻す',
        '',
        '[Mode control]',
        '  creoEditor.mode.enable() / disable() / toggle() / is()',
        '',
        '[Share / Export / AutoDiscover]',
        '  creoEditor.share()                          // URL に #creo=... を付与',
        "  creoEditor.export({ format: 'css-patch' })  // 差分 CSS 返却",
        '  creoEditor.autoDiscover()                    // 既知 CSS var を自動 bind',
        '',
        '[Dev write-back (Vite plugin 要 attach)]',
        '  await creoEditor.commitToTokens()           // 現値を tokens/*.json に書き戻す',
        '  await creoEditor.commitToTokens({ onlyChanged: true })  // 変更分のみ',
        '',
        '────────────────────────────────────────────────',
      ].join('\n')
      console.log(msg)
    },
  }

  return api
}

/** window[name] に api を expose。戻り値で uninstall (delete) */
export function installConsoleApi(api: ConsoleApi, name = 'creoEditor'): () => void {
  if (typeof window === 'undefined') return () => {}
  // biome-ignore lint/suspicious/noExplicitAny: window への dynamic property 設定
  const w = window as any
  if (w[name] !== undefined) {
    console.warn(
      `[creoEditor] window.${name} は既に存在します。EditorHostProvider が複数マウントされている可能性。新しい API で上書きします。`,
    )
  }
  w[name] = api
  return () => {
    if (w[name] === api) delete w[name]
  }
}
