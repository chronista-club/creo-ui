import { For } from 'solid-js'

// ============================================================
// Family operational definition — 4 axis で articulate
// ============================================================
// Family は note 1 行 (「mint green」 「sky blue」) では不十分で、 family
// 増設や既存 family 改訂の判断が subjective に流される。 Audience / Mood /
// Surface intent / Hue dominant の 4 axis で articulate することで、 「次に
// どんな family を作るべきか」「この hue は family に適切か」 の rubric が
// objective に成立する。

type FamilyAxis = {
  readonly family: string
  readonly hue: string
  readonly mood: string
  readonly audience: string
  readonly surfaceIntent: string
}

const FAMILY_OPERATIONAL: readonly FamilyAxis[] = [
  {
    family: 'Creo (mint)',
    hue: 'primary 160 (mint green) / secondary 300 (violet) — 補色 pair',
    mood: '生命 / 静寂 / 集中 — Creo identity の core (memory / canvas / 創造 surface)',
    audience: '日常的 dev session / long-form 思考 / memory recall — 集中持続 user',
    surfaceIntent: '主軸 surface (default 推奨)、 すべての ecosystem product 共通 baseline',
  },
  {
    family: '空 (Sora)',
    hue: 'primary 230 (sky blue) / secondary 200 (cyan)',
    mood: '冷静 / 観察 / 制御感 — tech-ops 系の落ち着き、 monitor の声',
    audience: 'observability / log monitoring / 長時間 watch、 stress 緩和重視',
    surfaceIntent: '管理画面 / dashboard / log viewer / VP terminal mode に適合',
  },
  {
    family: 'Contrast / Paradox',
    hue: 'primary 270 (violet) / secondary 335 (magenta) / tertiary 195 (cyan) — 高彩度三色',
    mood: '高揚 / 演出 / 主張 — creative session、 paradox 的な刺激',
    audience: 'creative output / presentation / demo、 短時間集中 burst user',
    surfaceIntent: 'editor mode / demo surface / hero / accent demo、 long-form は疲労原因',
  },
  {
    family: 'Old School',
    hue: 'primary 145 (olive green) / secondary 55 (amber)',
    mood: 'retro / typography 重視 / corporate — paper-like 落ち着き',
    audience: 'タイポ駆動 reading / corporate 用途 / 紙的体験を求める user',
    surfaceIntent: 'document viewer / blog / 長文 prose、 chrome は控えめ',
  },
] as const

// ============================================================
// Light/Dark axis — environment & state articulate
// ============================================================
// light/dark は user 個人の好みではなく、 環境 / 時間帯 / 注意疲労状態に応じた
// surface 適応。 各 family が light/dark の両方を持つ理由を articulate。

type ModeAxis = {
  readonly mode: string
  readonly environment: string
  readonly timeOfDay: string
  readonly attentionState: string
  readonly luminanceTarget: string
}

const MODE_OPERATIONAL: readonly ModeAxis[] = [
  {
    mode: 'Light',
    environment: '高照度 office / cafe / outdoor — 周囲光が強い',
    timeOfDay: '朝 / 日中 — circadian rhythm が能動的',
    attentionState: 'fresh / alert — 短時間 burst で集中可、 高 contrast を許容',
    luminanceTarget: 'bg luminance 0.95-1.0、 text 0.10-0.30 (黒寄り)',
  },
  {
    mode: 'Dark',
    environment: '低照度 home / 深夜 office / cinema mode — 周囲光が弱い',
    timeOfDay: '夕方 / 夜 / 深夜 — circadian が静寂モード',
    attentionState: 'fatigued / focused — 長時間 session で疲労最小化、 低 contrast 許容',
    luminanceTarget: 'bg luminance 0.10-0.25、 text 0.85-0.95 (白寄り、 純白避け)',
  },
] as const

const FAMILIES = [
  {
    family: 'Creo (mint)',
    light: 'mint-light',
    dark: 'mint-dark',
    note: 'Default — Creo ecosystem 共通の identity 色 (hue 160 mint)',
    isDefault: true,
  },
  {
    family: '空 (Sora)',
    light: 'sora-light',
    dark: 'sora-dark',
    note: 'Hue 230 sky blue。 落ち着いた tech-ops 系 surface 向き',
  },
  {
    family: 'Contrast / Paradox',
    light: 'contrast-light',
    dark: 'contrast-dark',
    note: 'Hue 270 violet (+335 magenta, +195 cyan)。 高彩度 / 強コントラスト演出',
  },
  {
    family: 'Old School',
    light: 'oldschool-light',
    dark: 'oldschool-dark',
    note: 'Hue 145 olive + 55 amber。 タイポ重視の retro / corporate',
  },
] as const

export default function Theming() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Theming</h1>
        <p class="docs-page-lead">
          4 family × light/dark = <strong>8 theme</strong> を同梱。 family は{' '}
          <strong>4 axis</strong> (Hue / Mood / Audience / Surface intent) で operational に
          articulate、 light/dark も 4 axis (Environment / Time / Attention / Luminance target)
          で。 切替は <code>data-theme</code> 属性、 値は OKLCH、 Swift / Rust ビルド時に hex / Rgb
          に変換 (Mint Dark のみ)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Family operational definition — 4 axis</h2>
        <p class="docs-page-helper">
          各 family を <strong>支配 hue (Hue dominant)</strong> ×{' '}
          <strong>表現される気分 (Mood)</strong> × <strong>想定 audience</strong> ×{' '}
          <strong>適用 surface intent</strong> で articulate。 「mint green」 「sky blue」 のような
          色名 1 行ではなく、 family の <strong>意図と居場所</strong> を計測可能な軸で定義することで、
          family 増設や既存 family 改訂の判断が rubric ベースに shift する。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>Family</th>
                <th>支配 hue</th>
                <th>気分 (Mood)</th>
                <th>想定 audience</th>
                <th>Surface intent</th>
              </tr>
            </thead>
            <tbody>
              <For each={FAMILY_OPERATIONAL}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.family}</code>
                    </th>
                    <td>{row.hue}</td>
                    <td>{row.mood}</td>
                    <td>{row.audience}</td>
                    <td>{row.surfaceIntent}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Light/Dark mode operational definition — 4 axis</h2>
        <p class="docs-page-helper">
          light/dark は単なる「user の好み」 ではなく、{' '}
          <strong>環境 (Environment)</strong> × <strong>時間帯 (Time of day)</strong> ×{' '}
          <strong>注意状態 (Attention state)</strong> × <strong>luminance target</strong> に応じた
          surface 適応。 system <code>prefers-color-scheme</code> media query は時間帯軸を
          自動追従、 user override は注意状態軸を本人が manual に切替える operation。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>Mode</th>
                <th>Environment</th>
                <th>Time of day</th>
                <th>Attention state</th>
                <th>Luminance target</th>
              </tr>
            </thead>
            <tbody>
              <For each={MODE_OPERATIONAL}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.mode}</code>
                    </th>
                    <td>{row.environment}</td>
                    <td>{row.timeOfDay}</td>
                    <td>{row.attentionState}</td>
                    <td>{row.luminanceTarget}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">8 themes</h2>
        <div class="docs-theme-grid">
          <For each={FAMILIES}>
            {(f) => (
              <article class="docs-theme-card">
                <header class="docs-theme-card-head">
                  <h3>{f.family}</h3>
                  {'isDefault' in f && f.isDefault && (
                    <span class="docs-theme-default-badge">default</span>
                  )}
                </header>
                <p class="docs-theme-note">{f.note}</p>
                <div class="docs-theme-pair">
                  <ThemePreview themeId={f.light} label="Light" />
                  <ThemePreview themeId={f.dark} label="Dark" />
                </div>
              </article>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Switching</h2>
        <pre class="docs-code">
          <code>{`<!-- HTML attribute -->
<html data-theme="sora-dark">
  ...
</html>

/* CSS — token 値が自動で切替 */
body {
  background: var(--color-surface-bg-base);
  color: var(--color-text-primary);
}`}</code>
        </pre>
        <p class="docs-page-helper">
          Header 右上の theme switcher は <code>localStorage</code> に永続化、 全 page 共通。
          fleetstage 互換 alias として <code>.dark</code> / <code>[data-theme="dark"]</code> =
          mint-dark、 <code>[data-theme="light"]</code> = mint-light も解釈。 system{' '}
          <code>prefers-color-scheme: light</code> で <code>[data-theme]</code> 未指定なら
          mint-light に逆転。
        </p>
      </section>
    </>
  )
}

function ThemePreview(props: { themeId: string; label: string }) {
  return (
    <div class="docs-theme-preview" data-theme={props.themeId}>
      <div class="docs-theme-preview-bar">
        <span class="docs-theme-preview-dot" style={{ background: 'var(--color-brand-primary)' }} />
        <span
          class="docs-theme-preview-dot"
          style={{ background: 'var(--color-brand-secondary)' }}
        />
        <span
          class="docs-theme-preview-dot"
          style={{ background: 'var(--color-semantic-success)' }}
        />
        <span
          class="docs-theme-preview-dot"
          style={{ background: 'var(--color-semantic-warning)' }}
        />
        <span
          class="docs-theme-preview-dot"
          style={{ background: 'var(--color-semantic-error)' }}
        />
      </div>
      <code class="docs-theme-preview-label">{props.themeId}</code>
      <span class="docs-theme-preview-mode">{props.label}</span>
    </div>
  )
}
