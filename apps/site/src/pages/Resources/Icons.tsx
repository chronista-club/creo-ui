import { A } from '@solidjs/router'
import {
  BRAND,
  CreoIcon,
  EDITOR,
  EMOJI,
  FILETYPE,
  FLAG,
  type IconName,
  MOTION,
  STATUS,
  SYSTEM,
} from 'creo-ui-icons-web'
import { For } from 'solid-js'

interface CategorySpec {
  name: string
  registry: Record<string, IconName>
  source: string
  description?: string
}

const CATEGORIES: readonly CategorySpec[] = [
  {
    name: 'System',
    registry: SYSTEM as Record<string, IconName>,
    source: 'mingcute / phosphor',
    description: 'navigation / common UI control 用 — close / search / menu / settings 等',
  },
  {
    name: 'Status',
    registry: STATUS as Record<string, IconName>,
    source: 'mingcute / svg-spinners',
    description: 'success / error / warning / info / loading の汎用 state expression',
  },
  {
    name: 'Editor',
    registry: EDITOR as Record<string, IconName>,
    source: 'mingcute',
    description: 'text edit / format / shortcut / keyboard 系',
  },
  {
    name: 'Brand',
    registry: BRAND as Record<string, IconName>,
    source: 'logos / iconoir',
    description: '外部 service / framework のロゴ — github / npm / discord / framework logos',
  },
  {
    name: 'Motion',
    registry: MOTION as Record<string, IconName>,
    source: 'mingcute',
    description: 'play / pause / forward / record 等 transport control',
  },
  {
    name: 'Flag',
    registry: FLAG as Record<string, IconName>,
    source: 'flag-icons / circle-flags',
    description: '国旗 (i18n / locale UI 用)',
  },
  {
    name: 'Emoji',
    registry: EMOJI as Record<string, IconName>,
    source: 'noto / openmoji',
    description: '感情 / decorative ピクト',
  },
  {
    name: 'Filetype',
    registry: FILETYPE as Record<string, IconName>,
    source: 'vscode-icons',
    description: '拡張子 → アイコン (file explorer / upload UI 用)',
  },
]

export default function Icons() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Resources</p>
        <h1>Icons</h1>
        <p class="docs-page-lead">
          Iconify-based icon adapter (<code>creo-ui-icons-web</code>)。 8 つの semantic category
          に整理された universal registry。 <code>{'<CreoIcon name="..." size={24} />'}</code> で
          render、 色は <code>currentColor</code> 経由で{' '}
          <A href="/foundations/color">creo-ui token</A> に追従。
        </p>
      </header>

      <For each={CATEGORIES}>
        {(cat) => (
          <section class="docs-icons-category">
            <header class="docs-icons-category-head">
              <h3>{cat.name}</h3>
              <span class="docs-icons-source">{cat.source}</span>
            </header>
            {cat.description && <p class="docs-icons-category-desc">{cat.description}</p>}
            <div class="docs-icons-grid">
              <For each={Object.entries(cat.registry)}>
                {([key, iconName]) => (
                  <div class="docs-icons-cell" title={iconName}>
                    <CreoIcon name={iconName} size={28} />
                    <code class="docs-icons-key">{key}</code>
                  </div>
                )}
              </For>
            </div>
          </section>
        )}
      </For>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`import { CreoIcon, STATUS } from 'creo-ui-icons-web'

// Registry の semantic key 経由 (推奨)
<CreoIcon name={STATUS.success} size={24} />
<CreoIcon name={STATUS.error} size={32} />

// 直接 iconify name を渡す
<CreoIcon name="mingcute:check-circle-line" size={24} />

// token 連動
<CreoIcon
  name={STATUS.success}
  size={24}
  color="var(--color-semantic-success)"
/>

// Rotate / flip
<CreoIcon name={SYSTEM.arrowRight} rotate={90} />
<CreoIcon name={EDITOR.bold} flip="horizontal" />`}</code>
        </pre>
      </section>

      <section>
        <h2 class="docs-section-title">設計</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Iconify Web Component</strong> (<code>iconify-icon</code>) を thin wrap、
            customElements + currentColor で <code>1em</code> default サイズ
          </li>
          <li>
            Registry は <code>const</code> map で <strong>tree-shake 効く</strong> — 使った key だけ
            bundle に乗る (registry import は metadata のみ、 svg は CDN)
          </li>
          <li>
            8 category は <strong>semantic 分類</strong> (icon set 横断) — 「success」 が mingcute
            から、 「github」 が logos から、 同じ意味で違う source を統合
          </li>
          <li>
            将来 platform abstract: SwiftUI / Rust 側で同じ semantic key 経由で SF Symbols / 別 set
            に backing 切替予定 (multi-platform parity)
          </li>
        </ul>
      </section>
    </>
  )
}
