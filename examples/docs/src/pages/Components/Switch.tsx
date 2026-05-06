import { A } from '@solidjs/router'
import {
  EditorHostProvider,
  EditorLayer,
  bind,
  boolean,
  signalTarget,
  string,
} from 'creo-ui-editor-host'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'checked',
    values: '(boolean)',
    def: '—',
    meaning: 'native HTML、 ON / OFF の真の state',
  },
  {
    attr: 'disabled',
    values: '(boolean)',
    def: '—',
    meaning: 'opacity 低下 + cursor not-allowed',
  },
  {
    attr: 'role',
    values: '"switch" (推奨)',
    def: '—',
    meaning: 'screen reader に "ON / OFF" と読ませるための ARIA role',
  },
] as const

const TOKENS = [
  { slot: 'track (off)', token: 'color.surface.bg-subtle + border' },
  { slot: 'track (on)', token: 'color.brand.primary' },
  { slot: 'thumb', token: 'color.surface.bg-base + shadow.sm' },
  { slot: 'transition', token: 'motion.duration.fast (160ms)' },
  { slot: 'gap (track + label)', token: 'layout.gap.tight' },
  { slot: 'focus ring', token: 'color.brand.primary (2px outline)' },
] as const

export default function Switch() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Switch</h1>
        <p class="docs-page-lead">
          即時反映の binary toggle。 設定の ON/OFF や feature flag の即時切替に使う (form submit
          経由でなく現場で反映)。 native checkbox を visually-hidden で残し、 track / thumb は
          custom CSS で描画、 keyboard / a11y は native input が担保。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">States</div>
          <div class="docs-preview-grid">
            <label class="creo-switch">
              <input type="checkbox" class="creo-switch-input" role="switch" aria-checked="false" />
              <span class="creo-switch-track">
                <span class="creo-switch-thumb" />
              </span>
              <span>Off (default)</span>
            </label>
            <label class="creo-switch">
              <input
                type="checkbox"
                class="creo-switch-input"
                role="switch"
                checked
                aria-checked="true"
              />
              <span class="creo-switch-track">
                <span class="creo-switch-thumb" />
              </span>
              <span>On</span>
            </label>
            <label class="creo-switch">
              <input
                type="checkbox"
                class="creo-switch-input"
                role="switch"
                aria-checked="false"
                disabled
              />
              <span class="creo-switch-track">
                <span class="creo-switch-thumb" />
              </span>
              <span>Disabled off</span>
            </label>
            <label class="creo-switch">
              <input
                type="checkbox"
                class="creo-switch-input"
                role="switch"
                checked
                aria-checked="true"
                disabled
              />
              <span class="creo-switch-track">
                <span class="creo-switch-thumb" />
              </span>
              <span>Disabled on</span>
            </label>
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
        <h2 class="docs-section-title">Switch vs Checkbox</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Switch</strong> — 即時反映、 設定 / feature flag、 ON/OFF 単独で意味あり
          </li>
          <li>
            <strong>Checkbox</strong> — form submit で反映、 複数選択 list / 規約同意、 group の
            一部
          </li>
          <li>"設定 page で実装" なら switch、 "form の中で多 select" なら checkbox</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            <code>role="switch"</code> 必須 (screen reader が "ON / OFF" と読む)
          </li>
          <li>
            label 全体 click で toggle (<code>&lt;label&gt;</code> wrapper)
          </li>
          <li>keyboard: Tab で focus、 Space / Enter で toggle (native checkbox 挙動)</li>
          <li>track はあくまで visual、 真の state は隠れた input が保持 (keyboard で操作可能)</li>
          <li>
            <code>:focus-visible</code> で 2px outline ring (track 周り)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle、 right panel から
          switch の checked / disabled / label を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creo-ui-docs.switch-editor',
            }}
          >
            <SwitchEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<label class="creo-switch">
  <input type="checkbox" class="creo-switch-input" role="switch" />
  <span class="creo-switch-track">
    <span class="creo-switch-thumb"></span>
  </span>
  <span>通知を受け取る</span>
</label>`}</code>
        </pre>
      </section>
    </>
  )
}

function SwitchEditorDemo() {
  const [checked, setChecked] = createSignal(false)
  const [disabled, setDisabled] = createSignal(false)
  const [label, setLabel] = createSignal('通知を受け取る')

  bind({
    target: signalTarget('switch.checked', checked, setChecked),
    control: boolean({ variant: 'switch' }),
    placement: { semantic: 'tool', group: 'switch', label: 'Checked', order: 1 },
  })
  bind({
    target: signalTarget('switch.disabled', disabled, setDisabled),
    control: boolean({ variant: 'switch' }),
    placement: { semantic: 'tool', group: 'switch', label: 'Disabled', order: 2 },
  })
  bind({
    target: signalTarget('switch.label', label, setLabel),
    control: string('input'),
    placement: { semantic: 'tool', group: 'content', label: 'Label', order: 1 },
  })

  return (
    <div class="docs-playground-stage">
      <label class="creo-switch">
        <input
          type="checkbox"
          class="creo-switch-input"
          role="switch"
          checked={checked()}
          disabled={disabled()}
          aria-checked={checked() ? 'true' : 'false'}
        />
        <span class="creo-switch-track">
          <span class="creo-switch-thumb" />
        </span>
        <span>{label()}</span>
      </label>
    </div>
  )
}
