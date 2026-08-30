import {
  bind,
  EditorHostProvider,
  EditorLayer,
  select,
  signalTarget,
  string,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'
import EditorModeToggle from '../../ui/EditorModeToggle'

const PROPS = [
  {
    attr: 'data-size',
    values: 's / m / l / xl',
    def: 'm',
    meaning: 'diameter (24 / 32 / 44 / 64 px)',
  },
  { attr: 'data-shape', values: 'circle / square', def: 'circle', meaning: '形' },
] as const

const TOKENS = [
  { slot: 'diameter (s / m / l / xl)', token: '24 / 32 / 44 / 64 px (l = tap target)' },
  { slot: 'bg (initials fallback)', token: 'color.brand.primary-subtle' },
  { slot: 'color (initials)', token: 'color.text.primary' },
  { slot: 'font-size (initials)', token: 'typography.size.{xs/s/m/l} (size に応じて)' },
  { slot: 'border (square)', token: 'radius.s' },
  { slot: 'status dot', token: '25% of diameter, color.surface.surface 2px border' },
] as const

export default function Avatar() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.avatar-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Avatar</h1>
        <p class="docs-page-lead">
          User / account / project 等の visual identity を{' '}
          <strong>小さな円形 (または rounded square)</strong> に 凝縮する token。 list / header /
          comment thread で頻出。 image or initials fallback。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground avatar の size / shape / initials
          を即時編集できる。 Mode ON 中に playground avatar を click するとその instance に field
          が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <AvatarLivePreview />
          <div class="docs-preview-row-label">Sizes (initials fallback)</div>
          <div class="cu-row cu-center cu-gap-m docs-preview-row docs-preview-row--baseline">
            <span class="creo-avatar" data-size="s">
              <span class="creo-avatar-initials" role="img" aria-label="Mako">
                M
              </span>
            </span>
            <span class="creo-avatar" data-size="m">
              <span class="creo-avatar-initials" role="img" aria-label="Claude">
                C
              </span>
            </span>
            <span class="creo-avatar" data-size="l">
              <span class="creo-avatar-initials" role="img" aria-label="Akira">
                A
              </span>
            </span>
            <span class="creo-avatar" data-size="xl">
              <span class="creo-avatar-initials" role="img" aria-label="Yui">
                Y
              </span>
            </span>
          </div>
          <div class="docs-preview-row-label">Shape × Size</div>
          <div class="cu-row cu-center cu-gap-m docs-preview-row docs-preview-row--baseline">
            <span class="creo-avatar" data-shape="circle" data-size="l">
              <span class="creo-avatar-initials" role="img" aria-label="Circle">
                ●
              </span>
            </span>
            <span class="creo-avatar" data-shape="square" data-size="l">
              <span class="creo-avatar-initials" role="img" aria-label="Square">
                ■
              </span>
            </span>
            <span class="creo-avatar" data-shape="square" data-size="xl">
              <span class="creo-avatar-initials" role="img" aria-label="Square XL">
                ■
              </span>
            </span>
          </div>
          <div class="docs-preview-row-label">With status dot</div>
          <div class="cu-row cu-center cu-gap-m docs-preview-row docs-preview-row--baseline">
            <span class="creo-avatar" data-size="l">
              <span class="creo-avatar-initials" role="img" aria-label="Online">
                O
              </span>
              <span class="creo-avatar-status" data-status="online" aria-hidden="true" />
            </span>
            <span class="creo-avatar" data-size="l">
              <span class="creo-avatar-initials" role="img" aria-label="Busy">
                B
              </span>
              <span class="creo-avatar-status" data-status="busy" aria-hidden="true" />
            </span>
            <span class="creo-avatar" data-size="l">
              <span class="creo-avatar-initials" role="img" aria-label="Offline">
                F
              </span>
              <span class="creo-avatar-status" data-status="offline" aria-hidden="true" />
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Props</h2>
        <PropsTable rows={PROPS} />
      </section>

      <section>
        <h2 class="docs-section-title">Token reference</h2>
        <TokensTable rows={TOKENS} />
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            <code>&lt;img&gt;</code> には必ず <code>alt</code> 属性
          </li>
          <li>
            initials fallback は <code>aria-label</code> で name を明示 (M だけでは読み取れない)
          </li>
          <li>
            status dot は装飾なので <code>aria-hidden="true"</code>、 状態は別途 text で伝える
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Image -->
<span class="creo-avatar">
  <img class="creo-avatar-image" src="/mako.jpg" alt="Mako" />
</span>

<!-- Initials fallback -->
<span class="creo-avatar">
  <span class="creo-avatar-initials" role="img" aria-label="Mako">M</span>
</span>

<!-- With status dot (online) -->
<span class="creo-avatar" data-size="l">
  <img class="creo-avatar-image" src="..." alt="User">
  <span class="creo-avatar-status" data-status="online" aria-hidden="true"></span>
</span>`}</code>
        </pre>
        <p class="docs-page-helper">
          詳細 spec:{' '}
          <a
            href="https://github.com/chronista-club/creo-ui/blob/main/docs/components/avatar.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs/components/avatar.md ↗
          </a>
        </p>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type AvatarSize = 's' | 'm' | 'l' | 'xl'
type AvatarShape = 'circle' | 'square'

/**
 * Live preview の playground。editor-host の bind() で size / shape / initials を
 * inspector panel に生やし、stage の avatar 自体を selectable にする (Mode ON で click →
 * その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function AvatarLivePreview() {
  const [size, setSize] = createSignal<AvatarSize>('l')
  const [shape, setShape] = createSignal<AvatarShape>('circle')
  const [initials, setInitials] = createSignal('CU')

  const binders = [
    bind({
      target: signalTarget('avatar.size', size, (v) => setSize(v as AvatarSize)),
      control: select(['s', 'm', 'l', 'xl'] as const),
      placement: { semantic: 'tool', group: 'avatar', label: 'Size', order: 1 },
    }),
    bind({
      target: signalTarget('avatar.shape', shape, (v) => setShape(v as AvatarShape)),
      control: select(['circle', 'square'] as const),
      placement: { semantic: 'tool', group: 'avatar', label: 'Shape', order: 2 },
    }),
    bind({
      target: signalTarget('avatar.initials', initials, setInitials),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Initials', order: 1 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'avatar-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        <span
          ref={selectable}
          class="creo-avatar"
          data-size={size()}
          data-shape={shape() === 'circle' ? undefined : shape()}
        >
          {/* 読み上げ名は role を持つ initials 側に置く — 素の <span> (.creo-avatar) に
              aria-label を付けても暗黙 role が無く screen reader に無視されるため */}
          <span
            class="creo-avatar-initials"
            role="img"
            aria-label={`Avatar with initials ${initials()}`}
          >
            {initials()}
          </span>
        </span>
      </div>
      <EditorModeToggle />
    </>
  )
}
