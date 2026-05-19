import { For } from 'solid-js'

// ============================================================
// Operational definition — 4 axis で articulate
// ============================================================
// Motion mapping は「何 ms か」 「どの easing か」 を主観で決めるのではなく、
// Use-case (どこで使うか) × Duration (時間) × Easing (動きの形) × Why
// (心理的根拠) の 4 axis で articulate。 11 use-case を SSOT として
// `tokens/motion/mapping.json` に articulate、 各 component は mapping
// token (alias) を参照することで意図を表現。

type AxisRow = {
  readonly useCase: string
  readonly duration: string
  readonly easing: string
  readonly why: string
}

const OPERATIONAL: readonly AxisRow[] = [
  {
    useCase: 'hover',
    duration: 'fast (160ms)',
    easing: 'out',
    why: 'small surface motion、 「変化が現れる」 感、 ease-out で「登場 → 落ち着く」',
  },
  {
    useCase: 'press',
    duration: 'instant (80ms)',
    easing: 'in',
    why: 'micro feedback、 押下の即時感、 ease-in で「押し込み」 (急停止)',
  },
  {
    useCase: 'toggle',
    duration: 'normal (220ms)',
    easing: 'in-out',
    why: 'state change (radio / checkbox / switch / segmented)、 両端滑らか',
  },
  {
    useCase: 'focus-ring',
    duration: 'instant (80ms)',
    easing: 'out',
    why: 'keyboard tab に即応、 「ring が現れる」 が即座に visible',
  },
  {
    useCase: 'dropdown',
    duration: 'fast (160ms)',
    easing: 'out',
    why: 'popover / menu / tooltip、 軽快な登場、 「ふわっと出る」',
  },
  {
    useCase: 'modal-enter',
    duration: 'slow (320ms)',
    easing: 'out',
    why: 'modal / drawer / dialog、 「落ち着いた登場」、 fast → slow で前面に止まる',
  },
  {
    useCase: 'modal-exit',
    duration: 'normal (220ms)',
    easing: 'in',
    why: 'modal close、 「素早く消える」、 slow → fast で退場',
  },
  {
    useCase: 'page-transition',
    duration: 'normal (220ms)',
    easing: 'in-out',
    why: 'route change、 滑らかな移動、 両端滑らか',
  },
  {
    useCase: 'frame-morph',
    duration: 'slow (320ms)',
    easing: 'spring',
    why: 'Frame system morph、 Creo brand bouncy curve (3D depth metaphor articulate)',
  },
  {
    useCase: 'skeleton-shimmer',
    duration: 'lazy (480ms)',
    easing: 'linear',
    why: 'loading shimmer、 cumulative motion、 「途切れない流れ」 (時間流動)',
  },
  {
    useCase: 'progress-indeterminate',
    duration: 'lazy (480ms)',
    easing: 'linear',
    why: 'progress bar 途中、 end-less cumulative、 constant velocity',
  },
] as const

// ============================================================
// Rubric — operational から派生する motion 設計基準
// ============================================================

type RubricItem = {
  readonly category: string
  readonly criteria: readonly string[]
}

const RUBRIC: readonly RubricItem[] = [
  {
    category: 'Use-case driven (主観 → rubric)',
    criteria: [
      '「何 ms か」 を 主観で決めない、 use-case ごとに mapping token を 参照する',
      '新 component で transition を articulate するときは、 既存 mapping から 最も近い意図を 探す',
      '既存 11 mapping で表現できない場合のみ 新 mapping を 追加 (PR review で 必須 articulate)',
      'duration / easing の組み合わせは 11 mapping に articulate 済、 random な 組み合わせ禁止',
    ],
  },
  {
    category: 'Duration scale (5 step、 5 tier convention)',
    criteria: [
      'instant (80ms) — micro feedback (button click、 focus ring)',
      'fast (160ms) — small UI transition (hover、 dropdown)',
      'normal (220ms) — default state change (toggle、 page transition、 modal exit)',
      'slow (320ms) — perceptible motion (modal enter、 frame morph)',
      'lazy (480ms) — long cumulative (loading、 progress)',
    ],
  },
  {
    category: 'Easing semantic',
    criteria: [
      'linear — constant velocity (loading / progress、 cumulative motion)',
      'ease-in — slow → fast (退場、 引っ込む、 急停止)',
      'ease-out — fast → slow (登場、 落ち着く、 Material 3 default)',
      'ease-in-out — 両端滑らか (state change、 toggle、 page transition)',
      'spring — Creo brand bouncy (Frame system 専用、 lively interaction)',
    ],
  },
  {
    category: 'Reduced-motion 適合 (a11y baseline)',
    criteria: [
      'prefers-reduced-motion: reduce 環境では transition / animation を 無効化',
      'ただし state change は static で示す (color / position の即時変化)',
      'focus ring は ring 自体は表示、 transition のみ無効化 (a11y 最優先)',
      'Frame morph は static fallback (perspective / depth は CSS 維持)',
      '全 component CSS で `@media (prefers-reduced-motion: reduce)` を articulate',
    ],
  },
  {
    category: 'Component override 規約',
    criteria: [
      '原則: 個別 component CSS で hardcode duration / easing 禁止',
      '例外: animation 自身 (skeleton shimmer の keyframes) は @keyframes 内で specific 値、 transition の length は mapping token',
      'mapping token に articulate されない use-case があれば PR で 新 mapping を 議論',
      'consumer も同 mapping token を import 可能 (CSS variable で全 platform expose)',
    ],
  },
] as const

// ============================================================
// Live tokens (mapping articulate viewer)
// ============================================================

type MappingToken = {
  readonly name: string
  readonly durationVar: string
  readonly easingVar: string
}

const MAPPING_TOKENS: readonly MappingToken[] = [
  {
    name: 'hover',
    durationVar: '--motion-mapping-hover-duration',
    easingVar: '--motion-mapping-hover-easing',
  },
  {
    name: 'press',
    durationVar: '--motion-mapping-press-duration',
    easingVar: '--motion-mapping-press-easing',
  },
  {
    name: 'toggle',
    durationVar: '--motion-mapping-toggle-duration',
    easingVar: '--motion-mapping-toggle-easing',
  },
  {
    name: 'focus-ring',
    durationVar: '--motion-mapping-focus-ring-duration',
    easingVar: '--motion-mapping-focus-ring-easing',
  },
  {
    name: 'dropdown',
    durationVar: '--motion-mapping-dropdown-duration',
    easingVar: '--motion-mapping-dropdown-easing',
  },
  {
    name: 'modal-enter',
    durationVar: '--motion-mapping-modal-enter-duration',
    easingVar: '--motion-mapping-modal-enter-easing',
  },
  {
    name: 'modal-exit',
    durationVar: '--motion-mapping-modal-exit-duration',
    easingVar: '--motion-mapping-modal-exit-easing',
  },
  {
    name: 'page-transition',
    durationVar: '--motion-mapping-page-transition-duration',
    easingVar: '--motion-mapping-page-transition-easing',
  },
  {
    name: 'frame-morph',
    durationVar: '--motion-mapping-frame-morph-duration',
    easingVar: '--motion-mapping-frame-morph-easing',
  },
  {
    name: 'skeleton-shimmer',
    durationVar: '--motion-mapping-skeleton-shimmer-duration',
    easingVar: '--motion-mapping-skeleton-shimmer-easing',
  },
  {
    name: 'progress-indeterminate',
    durationVar: '--motion-mapping-progress-indeterminate-duration',
    easingVar: '--motion-mapping-progress-indeterminate-easing',
  },
] as const

export default function Motion() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Motion</h1>
        <p class="docs-page-lead">
          Motion は <strong>11 use-case × 4 axis</strong> で operational に articulate。 base token
          (5 duration × 5 easing) を組み合わせる主観判断ではなく、{' '}
          <strong>use-case 駆動 rubric</strong> で「hover / press / toggle / modal-enter /
          frame-morph / 等」 を選ぶ path に shift する。 Material 3 distance-based を Creo brand
          (mint + spring) で reinterpret した SSOT。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Motion mapping operational definition — 4 axis</h2>
        <p class="docs-page-helper">
          各 use-case を <strong>Use-case (どこで使うか)</strong> × <strong>Duration (時間)</strong>{' '}
          × <strong>Easing (動きの形)</strong> × <strong>Why (心理的根拠)</strong> で articulate。{' '}
          consumer は mapping token (例: <code>var(--motion-mapping-hover-duration)</code>) を参照、
          maintainer は base (duration / easing) を tune する。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>Use-case</th>
                <th>Duration</th>
                <th>Easing</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              <For each={OPERATIONAL}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.useCase}</code>
                    </th>
                    <td>{row.duration}</td>
                    <td>{row.easing}</td>
                    <td>{row.why}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">派生要件 — operational から rubric へ</h2>
        <p class="docs-page-helper">
          Use-case driven 選定 / Duration scale / Easing semantic / Reduced-motion 適合 / Component
          override 規約 の 5 軸で rubric を articulate。 PR review でこの基準と照合する。
        </p>
        <dl class="docs-rubric">
          <For each={RUBRIC}>
            {(item) => (
              <>
                <dt>
                  <code>{item.category}</code>
                </dt>
                <dd>
                  <ul>
                    <For each={item.criteria}>{(c) => <li>{c}</li>}</For>
                  </ul>
                </dd>
              </>
            )}
          </For>
        </dl>
      </section>

      <section>
        <h2 class="docs-section-title">Mapping tokens</h2>
        <p class="docs-page-helper">
          11 use-case で duration + easing が SSOT として articulate。 各 token は base
          (motion.duration.* / motion.easing.*) への alias 参照。
        </p>
        <div class="docs-token-table">
          <For each={MAPPING_TOKENS}>
            {(t) => (
              <div class="docs-token-row">
                <code class="docs-token-name">motion.mapping.{t.name}</code>
                <code class="docs-token-value">
                  {(() => {
                    const d =
                      typeof window === 'undefined'
                        ? ''
                        : getComputedStyle(document.documentElement)
                            .getPropertyValue(t.durationVar)
                            .trim()
                    const e =
                      typeof window === 'undefined'
                        ? ''
                        : getComputedStyle(document.documentElement)
                            .getPropertyValue(t.easingVar)
                            .trim()
                    return `${d || '—'} / ${e || '—'}`
                  })()}
                </code>
              </div>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`/* CSS — component で mapping token を参照 */
.creo-btn {
  transition:
    background-color
      var(--motion-mapping-hover-duration)
      var(--motion-mapping-hover-easing),
    transform
      var(--motion-mapping-press-duration)
      var(--motion-mapping-press-easing);
}

.creo-btn:active {
  transform: translateY(1px); /* press 時の押下感 */
}

/* Modal / Drawer / Dialog の登場 / 退場 */
.creo-dialog[open] {
  animation: dialog-enter
    var(--motion-mapping-modal-enter-duration)
    var(--motion-mapping-modal-enter-easing);
}

/* Skeleton shimmer */
.creo-skeleton::after {
  animation: shimmer
    var(--motion-mapping-skeleton-shimmer-duration)
    var(--motion-mapping-skeleton-shimmer-easing)
    infinite;
}

/* Reduced-motion (a11y baseline) */
@media (prefers-reduced-motion: reduce) {
  .creo-btn,
  .creo-skeleton::after {
    transition: none;
    animation: none;
  }
}`}</code>
        </pre>
      </section>
    </>
  )
}
