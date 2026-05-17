/**
 * creoui-editor-host — UI primitive messages (SSOT)
 *
 * Editor Mode chrome (TOP / RIGHT / LEFT / BOTTOM region の既定 label /
 * hint / button text) をここに集約。consumer は Locale を切り替えるだけで
 * 全 chrome が追従する。
 *
 * consumer が独自 app messages を作る時は、`messages.ts` として consumer 側に
 * 用意 (creoui が提供するのはあくまで primitive の "UI chrome" 部分のみ)。
 */
import type { LocalizedText } from './types'

/** 翻訳漏れ検出用 type-safe helper (`Record<K, LocalizedText>`) */
type Localized<K extends string> = Record<K, LocalizedText>

/** Editor Mode 全体 chrome の messages */
export const messages = {
  /** TOP region の hint text */
  editorMode: {
    label: { ja: 'Editor Mode', en: 'Editor Mode' },
    on: { ja: 'ON', en: 'ON' },
    off: { ja: 'OFF', en: 'OFF' },
    clickToSelect: { ja: '要素をクリックで選択', en: 'Click an element to select' },
    selectedPrefix: { ja: '選択中: ', en: 'Selected: ' },
    escapeToExit: { ja: '終了', en: 'exit' },
    escapeToDeselect: { ja: '選択解除', en: 'deselect' },
    toggleShortcut: { ja: 'で切替', en: 'to toggle' },
  } satisfies Localized<
    | 'label'
    | 'on'
    | 'off'
    | 'clickToSelect'
    | 'selectedPrefix'
    | 'escapeToExit'
    | 'escapeToDeselect'
    | 'toggleShortcut'
  >,

  /** RIGHT region: ツール panel */
  toolPanel: {
    heading: { ja: '▶ ツール', en: '▶ Tools' },
    noFieldsForSelection: {
      ja: 'この選択に紐付く field はありません。',
      en: 'No fields bound to the current selection.',
    },
    showAllFields: { ja: '全 tool field を表示', en: 'Show all tool fields' },
  } satisfies Localized<'heading' | 'noFieldsForSelection' | 'showAllFields'>,

  /** BOTTOM region: ExportBar */
  exportBar: {
    label: { ja: '🎨 Export', en: '🎨 Export' },
    copyAction: { ja: 'Copy', en: 'Copy' },
    copied: { ja: '✓ copied!', en: '✓ copied!' },
    commitAction: { ja: 'Commit to tokens →', en: 'Commit to tokens →' },
    committed: { ja: '✓ committed!', en: '✓ committed!' },
    errorStatus: { ja: '× error', en: '× error' },
    commitTitle: {
      ja: '現 editor state を tokens/*.json に書き戻す (dev-only)',
      en: 'Write current editor state back to tokens/*.json (dev-only)',
    },
    hint: {
      ja: 'Copy → PR/Slack · Commit → tokens/*.json 直書き (dev)',
      en: 'Copy → PR/Slack · Commit → write tokens/*.json (dev)',
    },
    formatCssPatch: { ja: 'CSS patch (diff)', en: 'CSS patch (diff)' },
    formatCss: { ja: 'CSS (全量)', en: 'CSS (full)' },
    formatJson: { ja: 'JSON', en: 'JSON' },
    formatYaml: { ja: 'YAML', en: 'YAML' },
    formatShareUrl: { ja: 'Share URL', en: 'Share URL' },
  } satisfies Localized<
    | 'label'
    | 'copyAction'
    | 'copied'
    | 'commitAction'
    | 'committed'
    | 'errorStatus'
    | 'commitTitle'
    | 'hint'
    | 'formatCssPatch'
    | 'formatCss'
    | 'formatJson'
    | 'formatYaml'
    | 'formatShareUrl'
  >,
} as const
