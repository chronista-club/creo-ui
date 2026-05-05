const PROPS = [
  {
    attr: 'data-size',
    values: 'sm / md / lg',
    def: 'md',
    meaning: 'icon + text scale (compact list = sm、 main page = md、 hero = lg)',
  },
] as const

const TOKENS = [
  { slot: 'icon size (sm/md/lg)', token: '32 / 48 / 64 px' },
  { slot: 'icon color', token: 'color.text.tertiary' },
  { slot: 'title', token: 'color.text.primary、 weight.semibold' },
  { slot: 'description', token: 'color.text.secondary' },
  { slot: 'gap (icon → title → desc → actions)', token: 'spacing.s' },
  { slot: 'padding (page-level)', token: 'spacing.xl × spacing.m' },
  { slot: 'max-width', token: '480px (text wrap)' },
] as const

export default function EmptyState() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Empty state</h1>
        <p class="docs-page-lead">
          data 不在 / 検索結果 0 / 初回 onboarding 等の "何もない状態" を意味あるものに変える UI。
          icon + title + description + action(s) の 4 part 構成。 user に「何が起きたか」 +
          「次に何ができるか」 を一目で示す、 dead-end でなく opportunity に。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">First-time / no items yet</div>
          <div class="creo-empty-state">
            <div class="creo-empty-state-icon" aria-hidden="true">
              📁
            </div>
            <h3 class="creo-empty-state-title">No projects yet</h3>
            <p class="creo-empty-state-description">
              最初の project を作って始めましょう。 token / component / docs を一元管理できます。
            </p>
            <div class="creo-empty-state-actions">
              <button type="button" class="creo-btn" data-variant="primary">
                Create project
              </button>
              <button type="button" class="creo-btn" data-variant="ghost">
                Read docs
              </button>
            </div>
          </div>

          <div class="docs-preview-row-label">Search no results</div>
          <div class="creo-empty-state" data-size="sm">
            <div class="creo-empty-state-icon" aria-hidden="true">
              🔍
            </div>
            <h3 class="creo-empty-state-title">No results for "xyz"</h3>
            <p class="creo-empty-state-description">
              別の keyword で再検索するか、 filter を緩めてください。
            </p>
            <div class="creo-empty-state-actions">
              <button type="button" class="creo-btn" data-variant="secondary" data-size="sm">
                Clear filters
              </button>
            </div>
          </div>

          <div class="docs-preview-row-label">Hero / page-level</div>
          <div class="creo-empty-state" data-size="lg">
            <div class="creo-empty-state-icon" aria-hidden="true">
              ✨
            </div>
            <h3 class="creo-empty-state-title">Welcome to Creo UI</h3>
            <p class="creo-empty-state-description">
              token-driven な multi-platform design system。 まず Foundations から見るか、 直接
              Components catalog を探索できます。
            </p>
            <div class="creo-empty-state-actions">
              <button type="button" class="creo-btn" data-variant="primary">
                Get started
              </button>
              <button type="button" class="creo-btn" data-variant="secondary">
                Components
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
        <h2 class="docs-section-title">3 use cases</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>First-time</strong> — まだ何もない、 onboarding を兼ねる "Create" CTA
          </li>
          <li>
            <strong>Search no result</strong> — 検索 hit 0、 "Clear filters" or "再検索" を促す
          </li>
          <li>
            <strong>Error / unauthorized</strong> — 接続失敗 / 権限なし、 retry or contact CTA
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            icon は <code>aria-hidden="true"</code>、 状態は title + description で text 伝達
          </li>
          <li>
            title は <code>&lt;h3&gt;</code> 等の heading で document hierarchy 維持
          </li>
          <li>action は最大 2 button (primary + secondary)、 多すぎる選択肢は decision fatigue</li>
          <li>"何もない" の state は user の current intent を理解した提案文を提示</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<div class="creo-empty-state">
  <div class="creo-empty-state-icon" aria-hidden="true">📁</div>
  <h3 class="creo-empty-state-title">No projects yet</h3>
  <p class="creo-empty-state-description">
    最初の project を作って始めましょう。
  </p>
  <div class="creo-empty-state-actions">
    <button type="button" class="creo-btn" data-variant="primary">
      Create project
    </button>
    <button type="button" class="creo-btn" data-variant="ghost">
      Read docs
    </button>
  </div>
</div>

<!-- Compact (sm) for inline empty -->
<div class="creo-empty-state" data-size="sm">
  ...
</div>`}</code>
        </pre>
      </section>
    </>
  )
}
