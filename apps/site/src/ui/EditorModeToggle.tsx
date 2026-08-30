import { CUButton } from '@chronista-club/creo-ui/controls'
import { useEditorHost, useEditorMode } from '@chronista-club/creo-ui-editor-host'
import { CreoIcon } from '@chronista-club/creo-ui-icons-web'

/**
 * Editor Mode の見た目 toggle (component ページ共通)。
 * Phosphor の weight 切替 (ph:pencil-simple ⇄ ph:pencil-simple-fill) で ON/OFF を表現し、
 * ghost + aria-pressed の pressed style が状態の視覚を補強する。
 * EditorHostProvider の内側でのみ使えること (useEditorHost が context 解決するため)。
 */
export default function EditorModeToggle() {
  const host = useEditorHost()
  const mode = useEditorMode()
  const on = () => mode() === 'on'
  return (
    <div class="cu-row cu-gap-s cu-center docs-preview-grid">
      <CUButton
        variant="ghost"
        size="s"
        pressed={on()}
        aria-label={`Editor Mode: ${on() ? 'ON' : 'OFF'}`}
        title={`Editor Mode ${on() ? 'ON' : 'OFF'} — click to toggle`}
        onClick={() => host.toggle()}
      >
        <CreoIcon name={on() ? 'ph:pencil-simple-fill' : 'ph:pencil-simple'} size={16} />
      </CUButton>
    </div>
  )
}
