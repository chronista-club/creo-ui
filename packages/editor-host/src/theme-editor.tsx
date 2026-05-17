/**
 * creoui-editor-host — ThemeEditor (LEFT region)
 *
 * semantic='source' 寄りの役割: active theme の meta (name / family / flavor)
 * と主要 color swatch grid を表示。swatch 色は CSS 変数 `var(--color-*)` を
 * 直接参照するので、`theme.mode` 切替で自動追従する。
 *
 * 将来の拡張: swatch クリックで OKLCH 編集 (Phase M6)、custom theme 保存。
 */
import { For } from 'solid-js'
import type { JSX } from 'solid-js'
import { useEditorHost } from './provider'
import { DEFAULT_THEME_ID, SWATCH_ROWS, THEME_INFO } from './theme-info'

const headingStyle: JSX.CSSProperties = {
  margin: '0 0 var(--editor-mode-panel-group-gap) 0',
  'font-size': '11px',
  color: 'var(--editor-mode-axis-past)',
  'text-transform': 'uppercase',
  'letter-spacing': '0.08em',
  'font-weight': '700',
}

const infoCardStyle: JSX.CSSProperties = {
  'margin-bottom': 'var(--editor-mode-panel-group-gap)',
  padding: '8px',
  background: 'var(--color-surface-bg-subtle)',
  border: '1px solid var(--editor-mode-region-border)',
  'border-radius': '4px',
}

const infoNameStyle: JSX.CSSProperties = {
  'font-size': '12px',
  'font-weight': '700',
  color: 'var(--color-text-primary)',
  'margin-bottom': '2px',
}

const infoFamilyStyle: JSX.CSSProperties = {
  'font-size': '10px',
  color: 'var(--color-text-tertiary)',
  'margin-bottom': '4px',
  'font-family': 'var(--typography-family-mono)',
}

const infoFlavorStyle: JSX.CSSProperties = {
  'font-size': '10px',
  color: 'var(--color-text-secondary)',
  'line-height': '1.4',
}

const swatchesLabelStyle: JSX.CSSProperties = {
  'font-size': '10px',
  color: 'var(--editor-mode-panel-field-label)',
  'text-transform': 'uppercase',
  'letter-spacing': '0.05em',
  'margin-bottom': '6px',
}

const swatchRowStyle: JSX.CSSProperties = {
  display: 'flex',
  'align-items': 'center',
  gap: '6px',
  'font-size': '10px',
  'font-family': 'var(--typography-family-mono)',
}

const swatchBoxBase: JSX.CSSProperties = {
  width: '14px',
  height: '14px',
  'min-width': '14px',
  'border-radius': '3px',
  border: '1px solid var(--editor-mode-region-border)',
}

const swatchLabelStyle: JSX.CSSProperties = {
  color: 'var(--color-text-secondary)',
  'white-space': 'nowrap',
  overflow: 'hidden',
  'text-overflow': 'ellipsis',
}

export function ThemeEditor(): JSX.Element {
  const host = useEditorHost()
  const themeMode = (): string => {
    host.values() // reactive dependency
    return host.getValue<string>('theme.mode') ?? DEFAULT_THEME_ID
  }
  const info = () => THEME_INFO[themeMode()] ?? THEME_INFO[DEFAULT_THEME_ID]

  return (
    <>
      <h3 style={headingStyle}>◀ Theme</h3>

      <div style={infoCardStyle}>
        <div style={infoNameStyle}>{info().name}</div>
        <div style={infoFamilyStyle}>family: {info().family}</div>
        <div style={infoFlavorStyle}>{info().flavor}</div>
      </div>

      <div style={swatchesLabelStyle}>Swatches</div>
      <div style={{ display: 'grid', 'grid-template-columns': '1fr', gap: '3px' }}>
        <For each={SWATCH_ROWS}>
          {(row) => (
            <div style={swatchRowStyle} title={`${row.label}\n${row.cssVar}`}>
              <div style={{ ...swatchBoxBase, background: `var(${row.cssVar})` }} />
              <span style={swatchLabelStyle}>{row.label}</span>
            </div>
          )}
        </For>
      </div>
    </>
  )
}
