import { For, createEffect, createSignal, onMount } from 'solid-js'

const THEMES = [
  { id: 'mint-light', label: 'Creo (light)' },
  { id: 'mint-dark', label: 'Creo (dark)' },
  { id: 'sora-light', label: 'Sora (light)' },
  { id: 'sora-dark', label: 'Sora (dark)' },
  { id: 'contrast-light', label: 'Contrast (light)' },
  { id: 'contrast-dark', label: 'Contrast (dark)' },
  { id: 'oldschool-light', label: 'Old School (light)' },
  { id: 'oldschool-dark', label: 'Old School (dark)' },
] as const

type ThemeId = (typeof THEMES)[number]['id']

const STORAGE_KEY = 'creo-ui-docs.theme'

export default function ThemeSwitcher() {
  const [theme, setTheme] = createSignal<ThemeId>('mint-dark')

  onMount(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null
    if (saved && THEMES.some((t) => t.id === saved)) {
      setTheme(saved)
    }
  })

  createEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme())
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme())
    }
  })

  return (
    <label>
      <span class="visually-hidden">Theme</span>
      {/* .creo-select (native select の styled wrapper) の初 consumer。
          arrow / size / focus はすべて component 側 (select.css) が持つ。 */}
      <span class="creo-select" data-size="s">
        <select
          class="creo-select-input"
          value={theme()}
          onChange={(e) => setTheme(e.currentTarget.value as ThemeId)}
        >
          <For each={THEMES}>{(t) => <option value={t.id}>{t.label}</option>}</For>
        </select>
      </span>
    </label>
  )
}
