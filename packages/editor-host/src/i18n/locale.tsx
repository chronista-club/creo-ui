/**
 * @chronista-club/creoui-editor-host — Locale detection & provider
 *
 * `<LocaleProvider>` で現 locale を closure 化し、子 subtree が `useLocale()` /
 * `useT()` で読める。SSR / Node 環境では `navigator` を touch しない。
 */
import {
  type Accessor,
  type JSX,
  type Setter,
  createContext,
  createSignal,
  useContext,
} from 'solid-js'
import type { Locale } from './types'

interface LocaleContextValue {
  locale: Accessor<Locale>
  setLocale: Setter<Locale>
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

/**
 * browser `navigator.language` から Locale を推定。
 * - `ja` prefix → 'ja'
 * - それ以外 / navigator 無し → 'en'
 */
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language?.toLowerCase() ?? ''
  if (lang.startsWith('ja')) return 'ja'
  return 'en'
}

export interface LocaleProviderProps {
  /** 初期 locale。省略時は navigator 推定 → 'en' */
  initial?: Locale
  children: JSX.Element
}

export function LocaleProvider(props: LocaleProviderProps): JSX.Element {
  const [locale, setLocale] = createSignal<Locale>(props.initial ?? detectLocale())
  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>{props.children}</LocaleContext.Provider>
  )
}

/**
 * 現 locale を返す hook。`<LocaleProvider>` の外で呼ぶと fallback として
 * `{ locale: () => 'en', setLocale: noop }` を返す (throw しない、consumer が
 * Provider 忘れても UI が壊れないようにする配慮)。
 */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (ctx) return ctx
  // fallback: Provider 無しでも読めるように minimal stub を返す
  const [locale] = createSignal<Locale>(detectLocale())
  const setLocale: Setter<Locale> = () => locale()
  return { locale, setLocale }
}
