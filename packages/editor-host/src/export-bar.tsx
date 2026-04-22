/**
 * creo-ui-editor-host — ExportBar (BOTTOM region 常駐 UI)
 *
 * 現 editor state を clipboard へ copy する minimal utility。
 * Apple HIG 路線 (d) pipeline の UI 部。format select + Copy button + 短時間 feedback。
 */
import { For, type JSX, Show, createSignal } from 'solid-js'
import { type ExportFormat, exportSnapshot } from './export'
import type { EditorHost } from './types'
import { shareUrl } from './url-sync'

const formats: readonly { value: ExportFormat | 'url'; label: string }[] = [
  { value: 'css-patch', label: 'CSS patch (diff)' },
  { value: 'css', label: 'CSS (全量)' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'url', label: 'Share URL' },
]

interface ExportBarProps {
  host: EditorHost
  urlKey?: string
}

export function ExportBar(props: ExportBarProps): JSX.Element {
  const [format, setFormat] = createSignal<ExportFormat | 'url'>('css-patch')
  const [status, setStatus] = createSignal<'idle' | 'copied' | 'error'>('idle')

  const doCopy = async (): Promise<void> => {
    const fmt = format()
    let payload: string
    try {
      payload =
        fmt === 'url'
          ? shareUrl(props.host, { key: props.urlKey ?? 'creo' })
          : exportSnapshot(props.host, { format: fmt as ExportFormat })
    } catch {
      setStatus('error')
      window.setTimeout(() => setStatus('idle'), 1500)
      return
    }
    try {
      await navigator.clipboard.writeText(payload)
      setStatus('copied')
    } catch {
      setStatus('error')
    }
    window.setTimeout(() => setStatus('idle'), 1500)
  }

  return (
    <div style={containerStyle}>
      <span style={labelStyle}>🎨 Export</span>
      <select
        value={format()}
        onChange={(e) => setFormat(e.currentTarget.value as ExportFormat | 'url')}
        style={selectStyle}
      >
        <For each={formats}>{(f) => <option value={f.value}>{f.label}</option>}</For>
      </select>
      <button type="button" onClick={doCopy} style={buttonStyle(status())}>
        <Show when={status() === 'idle'} fallback={status() === 'copied' ? '✓ copied!' : '× error'}>
          Copy to clipboard
        </Show>
      </button>
      <span style={hintStyle}>現 editor state を clipboard にコピー → PR / Slack に直貼り</span>
    </div>
  )
}

const containerStyle: JSX.CSSProperties = {
  display: 'flex',
  'align-items': 'center',
  gap: '8px',
  width: '100%',
  'font-size': '11px',
  color: 'var(--color-text-secondary)',
}

const labelStyle: JSX.CSSProperties = {
  'font-weight': 'var(--typography-weight-semibold)',
  color: 'var(--color-text-primary)',
}

const selectStyle: JSX.CSSProperties = {
  'font-size': '11px',
  padding: '2px 6px',
  'border-radius': 'var(--radius-xs)',
  border: '1px solid var(--color-surface-border)',
  background: 'var(--color-surface-surface)',
  color: 'var(--color-text-primary)',
}

const buttonStyle = (status: 'idle' | 'copied' | 'error'): JSX.CSSProperties => ({
  'font-size': '11px',
  padding: '4px 10px',
  'border-radius': 'var(--radius-xs)',
  border: '1px solid var(--color-brand-primary)',
  background:
    status === 'copied'
      ? 'var(--color-semantic-success)'
      : status === 'error'
        ? 'var(--color-semantic-error)'
        : 'var(--color-brand-primary)',
  color: 'var(--color-surface-bg-base)',
  cursor: 'pointer',
  'font-weight': 'var(--typography-weight-medium)',
  transition: 'background 120ms ease',
})

const hintStyle: JSX.CSSProperties = {
  flex: '1',
  'text-align': 'right',
  color: 'var(--color-text-tertiary)',
  overflow: 'hidden',
  'text-overflow': 'ellipsis',
  'white-space': 'nowrap',
}
