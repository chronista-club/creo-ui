const PROPS = [
  {
    attr: 'data-placement (on .creo-toast-region)',
    values:
      'top-right (default) / top-left / top-center / bottom-right / bottom-left / bottom-center',
    def: 'top-right',
    meaning: 'toast 集合の出現位置、 region 1 つで 1 placement',
  },
  {
    attr: 'data-variant (on .creo-toast)',
    values: 'info / success / warning / error / neutral',
    def: 'neutral',
    meaning: 'icon + accent 色の semantic hint',
  },
  {
    attr: 'role="status" / "alert"',
    values: 'WAI-ARIA',
    def: '—',
    meaning: 'severity に応じて — info/success → status、 warning/error → alert',
  },
] as const

const TOKENS = [
  { slot: 'background', token: 'color.surface.surface + shadow.lg' },
  { slot: 'border', token: 'color.surface.border 1px' },
  { slot: 'icon (semantic)', token: 'color.semantic.{info/success/warning/error}' },
  { slot: 'border-radius', token: 'radius.md' },
  { slot: 'padding', token: 'spacing.s × spacing.m' },
  { slot: 'gap (icon + content)', token: 'spacing.s' },
  { slot: 'region offset', token: 'spacing.l (画面端からの距離)' },
  { slot: 'max-width', token: '420px (適切な readability)' },
] as const

export default function Toast() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Toast</h1>
        <p class="docs-page-lead">
          時間で消える transient notification (3-5 秒)、 successful action の feedback / non-
          blocking error 等。 portal で画面端に出現、 6 placement 選択可。 Alert (永続) と異なり
          "見逃しても良い" 軽い情報、 重要決定は Dialog を使う。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">5 variants (inline showcase、 真の portal は別)</div>
          <div class="docs-preview-stack" style={{ 'max-width': '420px', gap: 'var(--spacing-s)' }}>
            <div class="creo-toast" data-variant="info" role="status">
              <span class="creo-toast-icon" aria-hidden="true">
                ℹ
              </span>
              <div class="creo-toast-content">
                <strong>Info:</strong> Tokens v0.14.0 がリリースされました。
              </div>
              <button type="button" class="creo-toast-close" aria-label="閉じる">
                ✕
              </button>
            </div>
            <div class="creo-toast" data-variant="success" role="status">
              <span class="creo-toast-icon" aria-hidden="true">
                ✓
              </span>
              <div class="creo-toast-content">
                <strong>Saved:</strong> 設定が保存されました。
              </div>
              <button type="button" class="creo-toast-close" aria-label="閉じる">
                ✕
              </button>
            </div>
            <div class="creo-toast" data-variant="warning" role="alert">
              <span class="creo-toast-icon" aria-hidden="true">
                ⚠
              </span>
              <div class="creo-toast-content">
                <strong>Heads up:</strong> 接続が不安定です。
              </div>
              <button type="button" class="creo-toast-close" aria-label="閉じる">
                ✕
              </button>
            </div>
            <div class="creo-toast" data-variant="error" role="alert">
              <span class="creo-toast-icon" aria-hidden="true">
                ✕
              </span>
              <div class="creo-toast-content">
                <strong>Error:</strong> 保存に失敗しました。 再試行してください。
              </div>
              <button type="button" class="creo-toast-close" aria-label="閉じる">
                ✕
              </button>
            </div>
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
        <h2 class="docs-section-title">Toast vs Alert vs Dialog</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Toast</strong> — 時間で消える、 軽い feedback、 user 対応不要 (見逃しても OK)
          </li>
          <li>
            <strong>Alert</strong> — 永続、 page 内 banner、 user dismiss するまで残る
          </li>
          <li>
            <strong>Dialog</strong> — modal、 user 注意 hijack、 重要決定 (削除確認等)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            severity に応じた role: <code>status</code> (info/success、 polite) / <code>alert</code>{' '}
            (warning/error、 即時)
          </li>
          <li>
            icon は <code>aria-hidden</code>、 text と必ず併記 (色 only NG)
          </li>
          <li>
            close button は <code>aria-label="閉じる"</code> 必須 (icon-only)
          </li>
          <li>auto-dismiss 時間は user dismiss を妨げない (hover で pause、 focus 中は extend)</li>
          <li>多 stack 時 (3+) は old toast 上に新規 stack、 古いものを fade-out</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Region (1 placement = 1 region、 通常 portal で body 直下) -->
<div class="creo-toast-region" data-placement="top-right">

  <!-- Toast (success) -->
  <div class="creo-toast" data-variant="success" role="status">
    <span class="creo-toast-icon" aria-hidden="true">✓</span>
    <div class="creo-toast-content">
      <strong>Saved:</strong> 設定が保存されました
    </div>
    <button type="button" class="creo-toast-close" aria-label="閉じる">✕</button>
  </div>

  <!-- Toast (error、 即時通知) -->
  <div class="creo-toast" data-variant="error" role="alert">
    <span class="creo-toast-icon" aria-hidden="true">✕</span>
    <div class="creo-toast-content">
      <strong>Error:</strong> 接続失敗
    </div>
    <button type="button" class="creo-toast-close" aria-label="閉じる">✕</button>
  </div>

</div>`}</code>
        </pre>
      </section>
    </>
  )
}
