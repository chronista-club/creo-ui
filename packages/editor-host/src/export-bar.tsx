/**
 * @chronista-club/creoui-editor-host — ExportBar (BOTTOM region 常駐 UI)
 *
 * 現 editor state を clipboard へ copy する minimal utility。
 * Apple HIG 路線 (d) pipeline の UI 部。format select + Copy button + 短時間 feedback。
 */
import { For, type JSX, Show, createSignal } from 'solid-js'
import { type ExportFormat, exportSnapshot } from './export'
import { messages, useT } from './i18n'
import type { LocalizedText } from './i18n'
import type { EditorHost } from './types'
import { shareUrl } from './url-sync'

const formats: readonly {
  value: ExportFormat | 'url'
  messageKey: keyof typeof messages.exportBar
}[] = [
  { value: 'css-patch', messageKey: 'formatCssPatch' },
  { value: 'css', messageKey: 'formatCss' },
  { value: 'json', messageKey: 'formatJson' },
  { value: 'yaml', messageKey: 'formatYaml' },
  { value: 'url', messageKey: 'formatShareUrl' },
]

interface ExportBarProps {
  host: EditorHost
  urlKey?: string
  /** dev write-back endpoint (`creoTokensPlugin` 側と合わせる)。default: '/_creo/tokens/commit' */
  commitEndpoint?: string
  /** dev write-back ボタンを表示するか。default: true (fetch 失敗した場合は自動 error 表示) */
  showCommit?: boolean
}

type Status = 'idle' | 'copied' | 'error' | 'committed'

export function ExportBar(props: ExportBarProps): JSX.Element {
  const [format, setFormat] = createSignal<ExportFormat | 'url'>('css-patch')
  const [status, setStatus] = createSignal<Status>('idle')
  const [commitStatus, setCommitStatus] = createSignal<Status>('idle')
  const t = useT()
  const tx = (key: keyof typeof messages.exportBar): string =>
    t(messages.exportBar[key] as LocalizedText)

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

  const doCommit = async (): Promise<void> => {
    setCommitStatus('idle')
    const endpoint = props.commitEndpoint ?? '/_creo/tokens/commit'
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: props.host.values() }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const result = (await res.json()) as { applied: { id: string }[] }
      if (result.applied.length > 0) {
        setCommitStatus('committed')
        console.log(
          `[creoEditor ExportBar] ✓ committed ${result.applied.length} token(s) — rebuild tokens で反映`,
        )
      } else {
        setCommitStatus('error')
      }
    } catch (err) {
      console.error('[creoEditor ExportBar] commit failed:', err)
      setCommitStatus('error')
    }
    window.setTimeout(() => setCommitStatus('idle'), 1800)
  }

  const showCommit = (): boolean => props.showCommit !== false

  return (
    <div style={containerStyle}>
      <span style={labelStyle}>{tx('label')}</span>
      <select
        value={format()}
        onChange={(e) => setFormat(e.currentTarget.value as ExportFormat | 'url')}
        style={selectStyle}
      >
        <For each={formats}>{(f) => <option value={f.value}>{tx(f.messageKey)}</option>}</For>
      </select>
      <button type="button" onClick={doCopy} style={buttonStyle(status())}>
        <Show
          when={status() === 'idle'}
          fallback={status() === 'copied' ? tx('copied') : tx('errorStatus')}
        >
          {tx('copyAction')}
        </Show>
      </button>
      <Show when={showCommit()}>
        <button
          type="button"
          onClick={doCommit}
          style={buttonStyle(commitStatus(), 'semantic')}
          title={tx('commitTitle')}
        >
          <Show
            when={commitStatus() === 'idle'}
            fallback={commitStatus() === 'committed' ? tx('committed') : tx('errorStatus')}
          >
            {tx('commitAction')}
          </Show>
        </button>
      </Show>
      <span style={hintStyle}>{tx('hint')}</span>
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

const buttonStyle = (
  status: Status,
  variant: 'brand' | 'semantic' = 'brand',
): JSX.CSSProperties => {
  const idle = variant === 'semantic' ? 'var(--color-semantic-info)' : 'var(--color-brand-primary)'
  return {
    'font-size': '11px',
    padding: '4px 10px',
    'border-radius': 'var(--radius-xs)',
    border: '1px solid currentColor',
    background:
      status === 'copied' || status === 'committed'
        ? 'var(--color-semantic-success)'
        : status === 'error'
          ? 'var(--color-semantic-error)'
          : idle,
    color: 'var(--color-surface-bg-base)',
    cursor: 'pointer',
    'font-weight': 'var(--typography-weight-medium)',
    transition: 'background 120ms ease',
  }
}

const hintStyle: JSX.CSSProperties = {
  flex: '1',
  'text-align': 'right',
  color: 'var(--color-text-tertiary)',
  overflow: 'hidden',
  'text-overflow': 'ellipsis',
  'white-space': 'nowrap',
}
