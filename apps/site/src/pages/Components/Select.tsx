import { A } from '@solidjs/router'
import { PropsTable, TokensTable } from '../../ui/DocsTables'

const PROPS = [
  {
    attr: 'data-variant',
    values: 'bordered / filled',
    def: 'bordered',
    meaning: 'filled = borderless の recessed well (input と同語彙)',
  },
  {
    attr: 'data-size',
    values: 's / m / l',
    def: 'm',
    meaning: '5 tier convention 中央の m が標準',
  },
  {
    attr: 'data-width',
    values: 'fit / full',
    def: 'fit',
    meaning: 'fit = 内容幅 (toolbar) / full = 全幅 (form、segmented と同語彙)',
  },
  {
    attr: 'data-state',
    values: 'error',
    def: '—',
    meaning: 'error 枠。select 側の aria-invalid="true" でも同表現',
  },
  {
    attr: 'disabled (select 側)',
    values: '(boolean)',
    def: '—',
    meaning: 'native。wrapper の arrow も :has() で減光',
  },
] as const

const TOKENS = [
  { slot: 'background', token: 'color.surface.surface / filled: --surface-veil-1 + well' },
  { slot: 'border', token: 'color.surface.border 1px / error: color.semantic.error 1.5px' },
  { slot: 'arrow', token: 'color.text.tertiary (hover: text.secondary)、wrapper ::after' },
  { slot: 'padding', token: 'spacing.{xs/s/m} × spacing.{s/m/l} + arrow の逃げ 14px' },
  { slot: 'min-height', token: 'layout.target.tap (m) / focus (s) — density scale 追従' },
  { slot: 'focus', token: '_focus.css policy (.creo-select-input が :where 登録済み)' },
] as const

const THEME_OPTIONS = ['Creo (dark)', 'Creo (light)', 'Sora (dark)', 'Sora (light)'] as const

export default function Select() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Select</h1>
        <p class="docs-page-lead">
          native <code>&lt;select&gt;</code> の styled wrapper — 単一選択の dropdown を{' '}
          <code>.creo-input</code> と同じ form field の声で。 dropdown の中身 (option list) は
          browser native なので keyboard / a11y / mobile picker は OS に任せる。{' '}
          <code>&lt;select&gt;</code> は replaced element で pseudo-element を持てないため、
          checkbox / radio と同じ wrapper + input の 2 要素構成 (arrow は wrapper の ::after)。 この
          site の header theme switcher が初 consumer。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Sizes (s / m / l)</div>
          <div class="docs-preview-row">
            <span class="creo-select" data-size="s">
              <select class="creo-select-input" aria-label="Theme (small)">
                {THEME_OPTIONS.map((t) => (
                  <option>{t}</option>
                ))}
              </select>
            </span>
            <span class="creo-select">
              <select class="creo-select-input" aria-label="Theme (medium)">
                {THEME_OPTIONS.map((t) => (
                  <option>{t}</option>
                ))}
              </select>
            </span>
            <span class="creo-select" data-size="l">
              <select class="creo-select-input" aria-label="Theme (large)">
                {THEME_OPTIONS.map((t) => (
                  <option>{t}</option>
                ))}
              </select>
            </span>
          </div>

          <div class="docs-preview-row-label">Filled variant</div>
          <div class="docs-preview-row">
            <span class="creo-select" data-variant="filled">
              <select class="creo-select-input" aria-label="Sort order">
                <option>Newest first</option>
                <option>Oldest first</option>
                <option>Most active</option>
              </select>
            </span>
            <span class="creo-select" data-variant="filled" data-size="s">
              <select class="creo-select-input" aria-label="Locale">
                <option>日本語</option>
                <option>English</option>
              </select>
            </span>
          </div>

          <div class="docs-preview-row-label">Form (width full + FormField)</div>
          <div class="creo-form-field" style={{ 'max-width': '360px' }}>
            <label class="creo-form-field-label" for="select-tz">
              Timezone
            </label>
            <span class="creo-select" data-width="full">
              <select class="creo-select-input" id="select-tz">
                <option>Asia/Tokyo (UTC+9)</option>
                <option>UTC</option>
                <option>America/Los_Angeles (UTC-8)</option>
                <option>Europe/Berlin (UTC+1)</option>
              </select>
            </span>
          </div>

          <div class="docs-preview-row-label">States (error / disabled)</div>
          <div class="docs-preview-row">
            <span class="creo-select" data-state="error">
              <select class="creo-select-input" aria-invalid="true" aria-label="Region (error)">
                <option>— 選択してください —</option>
                <option>ap-northeast-1</option>
                <option>us-west-2</option>
              </select>
            </span>
            <span class="creo-select">
              <select class="creo-select-input" disabled aria-label="Plan (disabled)">
                <option>Pro (契約中)</option>
              </select>
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
        <h2 class="docs-section-title">Select vs Combobox vs Menu</h2>
        <p class="docs-page-lead">
          <strong>Select</strong> = 固定リストからの単一選択 (目安 ~15 件、 選択が状態として残る)。{' '}
          <strong>
            <A href="/components/combobox">Combobox</A>
          </strong>{' '}
          = type-ahead で絞り込む検索付き選択 (数十件以上)。{' '}
          <strong>
            <A href="/components/menu">Menu</A>
          </strong>{' '}
          = action list — 選択の永続化ではなく実行 (削除等の destructive を含む)。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-list">
          <li>
            native <code>&lt;select&gt;</code> を使う — listbox の再発明をしない。 ↑↓ / typeahead /
            Enter は browser が提供
          </li>
          <li>
            label は <code>&lt;label&gt;</code> で包むか <code>aria-label</code> を必ず付ける
          </li>
          <li>
            error は select 側に <code>aria-invalid="true"</code> (見た目も連動)
          </li>
          <li>
            focus ring は keyboard-only (<code>_focus.css</code> policy)。 mouse focus は border
            色変化のみ
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- toolbar (header の theme switcher) -->
<label>
  <span class="visually-hidden">Theme</span>
  <span class="creo-select" data-size="s">
    <select class="creo-select-input">
      <option value="mint-dark">Creo (dark)</option>
      <option value="mint-light">Creo (light)</option>
    </select>
  </span>
</label>

<!-- form -->
<div class="creo-form-field">
  <label class="creo-form-field-label" for="tz">Timezone</label>
  <span class="creo-select" data-width="full">
    <select class="creo-select-input" id="tz">…</select>
  </span>
</div>

<!-- error -->
<span class="creo-select" data-width="full">
  <select class="creo-select-input" aria-invalid="true">…</select>
</span>`}</code>
        </pre>
      </section>
    </>
  )
}
