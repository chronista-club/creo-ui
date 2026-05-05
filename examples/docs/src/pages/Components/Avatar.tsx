import { A } from '@solidjs/router'
import {
  EditorHostProvider,
  EditorLayer,
  bind,
  select,
  signalTarget,
  string,
} from 'creo-ui-editor-host'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'data-size',
    values: 'sm / md / lg / xl',
    def: 'md',
    meaning: 'diameter (24 / 32 / 44 / 64 px)',
  },
  { attr: 'data-shape', values: 'circle / square', def: 'circle', meaning: '形' },
] as const

const TOKENS = [
  { slot: 'diameter (sm / md / lg / xl)', token: '24 / 32 / 44 / 64 px (lg = tap target)' },
  { slot: 'bg (initials fallback)', token: 'color.brand.primary-subtle' },
  { slot: 'color (initials)', token: 'color.text.primary' },
  { slot: 'font-size (initials)', token: 'typography.size.{xs/sm/base/md} (size に応じて)' },
  { slot: 'border (square)', token: 'radius.sm' },
  { slot: 'status dot', token: '25% of diameter, color.surface.surface 2px border' },
] as const

export default function Avatar() {
  return (
    <>
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
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Sizes (initials fallback)</div>
          <div class="docs-preview-row docs-preview-row--baseline">
            <span class="creo-avatar" data-size="sm">
              <span class="creo-avatar-initials" aria-label="Mako">
                M
              </span>
            </span>
            <span class="creo-avatar" data-size="md">
              <span class="creo-avatar-initials" aria-label="Claude">
                C
              </span>
            </span>
            <span class="creo-avatar" data-size="lg">
              <span class="creo-avatar-initials" aria-label="Akira">
                A
              </span>
            </span>
            <span class="creo-avatar" data-size="xl">
              <span class="creo-avatar-initials" aria-label="Yui">
                Y
              </span>
            </span>
          </div>
          <div class="docs-preview-row-label">Shape × Size</div>
          <div class="docs-preview-row docs-preview-row--baseline">
            <span class="creo-avatar" data-shape="circle" data-size="lg">
              <span class="creo-avatar-initials" aria-label="Circle">
                ●
              </span>
            </span>
            <span class="creo-avatar" data-shape="square" data-size="lg">
              <span class="creo-avatar-initials" aria-label="Square">
                ■
              </span>
            </span>
            <span class="creo-avatar" data-shape="square" data-size="xl">
              <span class="creo-avatar-initials" aria-label="Square XL">
                ■
              </span>
            </span>
          </div>
          <div class="docs-preview-row-label">With status dot</div>
          <div class="docs-preview-row docs-preview-row--baseline">
            <span class="creo-avatar" data-size="lg">
              <span class="creo-avatar-initials" aria-label="Online">
                O
              </span>
              <span class="creo-avatar-status" data-status="online" aria-hidden="true" />
            </span>
            <span class="creo-avatar" data-size="lg">
              <span class="creo-avatar-initials" aria-label="Busy">
                B
              </span>
              <span class="creo-avatar-status" data-status="busy" aria-hidden="true" />
            </span>
            <span class="creo-avatar" data-size="lg">
              <span class="creo-avatar-initials" aria-label="Offline">
                F
              </span>
              <span class="creo-avatar-status" data-status="offline" aria-hidden="true" />
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Props</h2>
        <div class="docs-props-table">
          <div class="docs-props-row docs-props-head">
            <div>Attribute</div>
            <div>Values</div>
            <div>Default</div>
            <div>Meaning</div>
          </div>
          {PROPS.map((p) => (
            <div class="docs-props-row">
              <code>{p.attr}</code>
              <code>{p.values}</code>
              <code>{p.def}</code>
              <span>{p.meaning}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Token reference</h2>
        <div class="docs-tokens-table">
          {TOKENS.map((t) => (
            <div class="docs-tokens-row">
              <span class="docs-tokens-slot">{t.slot}</span>
              <code class="docs-tokens-name">{t.token}</code>
            </div>
          ))}
        </div>
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
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle、 right panel から
          avatar の size / shape / initials を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              shortcut: ['ctrl+shift+e', 'meta+shift+e'],
              exposeConsole: true,
              localStorageNamespace: 'creo-ui-docs.avatar-editor',
            }}
          >
            <AvatarEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
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
  <span class="creo-avatar-initials" aria-label="Mako">M</span>
</span>

<!-- With status dot (online) -->
<span class="creo-avatar" data-size="lg">
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
    </>
  )
}

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'
type AvatarShape = 'circle' | 'square'

function AvatarEditorDemo() {
  const [size, setSize] = createSignal<AvatarSize>('lg')
  const [shape, setShape] = createSignal<AvatarShape>('circle')
  const [initials, setInitials] = createSignal('CU')

  bind({
    id: 'avatar.size',
    control: select({ options: ['sm', 'md', 'lg', 'xl'] as const }),
    target: signalTarget('avatar.size', size, setSize),
    initial: 'lg',
    semantic: 'tool',
    placement: { region: 'right', group: 'avatar', label: 'Size', order: 1 },
  })
  bind({
    id: 'avatar.shape',
    control: select({ options: ['circle', 'square'] as const }),
    target: signalTarget('avatar.shape', shape, setShape),
    initial: 'circle',
    semantic: 'tool',
    placement: { region: 'right', group: 'avatar', label: 'Shape', order: 2 },
  })
  bind({
    id: 'avatar.initials',
    control: string({ variant: 'input' }),
    target: signalTarget('avatar.initials', initials, setInitials),
    initial: 'CU',
    semantic: 'content',
    placement: { region: 'right', group: 'content', label: 'Initials', order: 1 },
  })

  return (
    <div class="docs-playground-stage">
      <span
        class="creo-avatar"
        data-size={size()}
        data-shape={shape() === 'circle' ? undefined : shape()}
        aria-label={`Avatar with initials ${initials()}`}
      >
        <span class="creo-avatar-initials">{initials()}</span>
      </span>
    </div>
  )
}
