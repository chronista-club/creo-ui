/**
 * Layout Engine lab — attention 連続場の secondary dogfood（LE-P1）。
 *
 * primary dogfood は VP gallery mode（LE-P2）。ここは protocol の全 primitive を
 * 1 画面で触れる検証台: 場（slider = share 指定）/ 構造（記法）/ scrub / settle log / float drag。
 * motion は意図的にゼロ（jump のみ）— 動きは全部 t を手で持つ（時間 driver は LE-P3）。
 */

import {
  admit,
  createLayoutEngine,
  equalize,
  formatNotation,
  interpolate,
  isMember,
  memberIds,
  moveDominance,
  mute,
  parseNotation,
  popIn,
  popOut,
  resolve,
  setShare,
  solo,
} from '@chronista-club/creo-ui-layout'
import type {
  DominanceDirection,
  Layout,
  PaneRef,
  ResolvedMap,
  Scene,
} from '@chronista-club/creo-ui-layout'
import { PaneStage, useEngineResolved } from '@chronista-club/creo-ui-layout/solid'
import { For, Show, createMemo, createSignal } from 'solid-js'

const SCOPE = 'lab'

/** demo 初期配置: console が主役、右列に doc/canvas、board が浮いている */
const INITIAL: Layout = {
  structure: parseNotation('console | doc/canvas').structure,
  attention: { console: 0.5, doc: 0.3, canvas: 0.2, board: 0.35 },
}

// engine は module 単位で 1 個 — route を離れても場と settle log が生き残る（dogfood 都合）
const engine = createLayoutEngine()
engine.update(SCOPE, () => INITIAL)
engine.settle(SCOPE, 'human')

/** pane id → 安定 hue（swatch 用） */
const hueOf = (id: string): number => {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360
  return h
}

/** PaneStage の契約: PaneRef は referentially stable に保つ（host 再生成 = LE-10 違反を防ぐ） */
const paneCache = new Map<string, PaneRef>()
const paneRef = (id: string): PaneRef => {
  let p = paneCache.get(id)
  if (!p) {
    p = { id }
    paneCache.set(id, p)
  }
  return p
}

const cloneLayout = (l: Layout): Layout => ({
  structure: { columns: l.structure.columns.map((c) => ({ panes: [...c.panes] })) },
  attention: { ...l.attention },
})

const PANE_ID_RE = /^[^\s|/~]+$/

export default function LayoutLab() {
  const resolved = useEngineResolved(engine, SCOPE)
  // settle log は engine 内部の配列なので、書き込み操作の後に tick で読み直す
  const [historyTick, setHistoryTick] = createSignal(0)
  const bump = () => setHistoryTick((n) => n + 1)
  const settle = () => {
    engine.settle(SCOPE, 'human')
    bump()
  }

  const layout = createMemo(() => {
    resolved() // 購読（update のたびに再評価）
    return engine.current(SCOPE)
  })

  const panes = createMemo(() => {
    const l = layout()
    const ids = new Set([...memberIds(l.structure), ...Object.keys(l.attention)])
    return [...ids].map(paneRef)
  })

  const floats = createMemo(() =>
    Object.keys(layout().attention).filter(
      (id) => !isMember(layout().structure, id) && (layout().attention[id] ?? 0) > 0,
    ),
  )

  const notationText = createMemo(() => formatNotation(layout().structure, floats()))

  // ---------- Scene & scrub ----------
  const [sceneA, setSceneA] = createSignal<Scene | null>(null)
  const [sceneB, setSceneB] = createSignal<Scene | null>(null)
  const [scrubT, setScrubT] = createSignal<number | null>(null)

  const displayed = createMemo<ResolvedMap>(() => {
    const t = scrubT()
    const a = sceneA()
    const b = sceneB()
    if (t == null || !a || !b) return resolved()
    return interpolate(resolve(a.layout), resolve(b.layout), t)
  })

  const capture = (which: 'A' | 'B') => {
    const scene: Scene = { id: which, name: `Scene ${which}`, layout: cloneLayout(layout()) }
    if (which === 'A') setSceneA(scene)
    else setSceneB(scene)
  }

  const applySceneNow = (scene: Scene | null) => {
    if (!scene) return
    engine.applyScene(SCOPE, scene)
    bump()
  }

  /** scrub 手放し = 近い端点へ着地（spring で運ぶのは LE-P3 の time driver。ここでは jump） */
  const releaseScrub = () => {
    const t = scrubT()
    if (t == null) return
    applySceneNow(t < 0.5 ? sceneA() : sceneB())
    setScrubT(null)
  }

  // ---------- 記法入力 ----------
  const [notationInput, setNotationInput] = createSignal('console | doc/canvas ~ board')
  const [inputError, setInputError] = createSignal<string | null>(null)

  const applyNotation = () => {
    try {
      const parsed = parseNotation(notationInput())
      const ids = [...parsed.structure.columns.flatMap((c) => [...c.panes]), ...parsed.floats]
      // 空の記法は場を全零にする = LE-3 の全零 guard と同じ理由で拒否（team-b review 反映）
      if (ids.length === 0) {
        setInputError('少なくとも 1 pane を書いてください（空の記法は全零になるため拒否）')
        return
      }
      engine.update(SCOPE, (l) => {
        // 新 id の初期値は admit と同じ「可視 pane の raw 平均」— raw=1 直書きだと突出する
        const visible = Object.keys(l.attention).filter((id) => (l.attention[id] ?? 0) > 0)
        const mean =
          visible.length > 0
            ? visible.reduce((s, v) => s + (l.attention[v] ?? 0), 0) / visible.length
            : 1
        const attention: Record<string, number> = {}
        for (const id of ids) {
          const prev = l.attention[id] ?? 0
          attention[id] = prev > 0 ? prev : mean
        }
        return { structure: parsed.structure, attention }
      })
      settle()
      setInputError(null)
    } catch (e) {
      setInputError(e instanceof Error ? e.message : String(e))
    }
  }

  // ---------- 新 pane 入場 ----------
  const [newPaneId, setNewPaneId] = createSignal('')
  const addPane = () => {
    const id = newPaneId().trim()
    if (!id) return
    if (!PANE_ID_RE.test(id)) {
      setInputError(`pane id "${id}" に空白と | / ~ は使えない`)
      return
    }
    engine.update(SCOPE, (l) => admit(l, id))
    settle()
    setNewPaneId('')
    setInputError(null)
  }

  const gesture = (fn: (l: Layout) => Layout, opts: { settle?: boolean } = { settle: true }) => {
    engine.update(SCOPE, fn)
    if (opts.settle) settle()
  }

  const history = createMemo(() => {
    historyTick()
    return engine.history(SCOPE)
  })

  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Lab</p>
        <h1>Layout Engine — attention 連続場 lab</h1>
        <p class="docs-page-lead">
          <code>creo-ui-layout</code>（仮称）の secondary dogfood。場（attention 1
          本）がサイズ・可視・重なりの唯一の真実源で、構造（<code>{'ec | cv/pp ~ board'}</code>
          ）は軸交代と所属だけを持つ。 motion はゼロ — <strong>動きは scrub の t を手で持つ</strong>
          （時間 driver は LE-P3）。 設計: <code>docs/design/layout-engine.md</code>
          （LE-1〜LE-20）。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Stage</h2>
        <p class="docs-page-helper">
          現在の記法: <code>{notationText()}</code>
          <Show when={scrubT() != null}>
            {' '}
            — <strong>scrub 中 t = {(scrubT() ?? 0).toFixed(2)}</strong>
          </Show>
        </p>
        <div
          style={{
            'aspect-ratio': '16 / 9',
            border: '1px solid var(--color-surface-border, #444)',
            'border-radius': '8px',
            overflow: 'hidden',
            background: 'var(--color-surface-bg-base, #16130f)',
          }}
        >
          <PaneStage
            resolved={displayed()}
            panes={panes()}
            onFloatMove={(id, pos) => engine.moveFloat(SCOPE, id, pos)}
            renderPane={(pane) => (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  'flex-direction': 'column',
                  'align-items': 'center',
                  'justify-content': 'center',
                  gap: '2px',
                  'box-sizing': 'border-box',
                  background: `oklch(0.42 0.08 ${hueOf(pane.id)} / 0.6)`,
                  border: `1px solid oklch(0.72 0.11 ${hueOf(pane.id)})`,
                  'border-radius': '6px',
                  cursor: displayed()[pane.id]?.floating ? 'grab' : 'default',
                  'user-select': 'none',
                }}
              >
                <strong style={{ 'font-family': 'monospace', 'font-size': '13px' }}>
                  {pane.id}
                </strong>
                <span style={{ 'font-family': 'monospace', 'font-size': '11px', opacity: 0.75 }}>
                  {Math.round((displayed()[pane.id]?.attention ?? 0) * 100)}%
                  {displayed()[pane.id]?.floating ? ' ~' : ''}
                </span>
              </div>
            )}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', 'margin-top': '8px', 'flex-wrap': 'wrap' }}>
          <button type="button" onClick={() => gesture(equalize)}>
            equalize
          </button>
          <button
            type="button"
            onClick={() => {
              engine.restoreLastSettle(SCOPE)
              bump()
            }}
          >
            last settle へ戻る（un-solo）
          </button>
          <For each={['left', 'up', 'down', 'right'] as DominanceDirection[]}>
            {(dir) => (
              <button type="button" onClick={() => gesture((l) => moveDominance(l, dir))}>
                主役を{dir === 'left' ? '←' : dir === 'right' ? '→' : dir === 'up' ? '↑' : '↓'}
              </button>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">場の操作 — slider = share 指定（VCA 同型）</h2>
        <p class="docs-page-helper">
          slider は share（正規化後の取り分）を直接指定する。1 本上げると untouched
          が余りを比例配分で duck する — モータライズノブが「連動して動く」のと同じ意味論。 solo
          は逸脱（settle しない）なので「last settle へ戻る」= un-solo。
        </p>
        <div style={{ display: 'grid', gap: '6px' }}>
          <For each={panes()}>
            {(pane) => {
              const share = () => displayed()[pane.id]?.attention ?? 0
              const floating = () => resolved()[pane.id]?.floating ?? false
              return (
                <div
                  style={{
                    display: 'flex',
                    'align-items': 'center',
                    gap: '10px',
                    'flex-wrap': 'wrap',
                  }}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      'border-radius': '3px',
                      background: `oklch(0.6 0.13 ${hueOf(pane.id)})`,
                      flex: 'none',
                    }}
                  />
                  <code style={{ width: '72px' }}>{pane.id}</code>
                  <input
                    type="range"
                    min="0"
                    max="0.95"
                    step="0.01"
                    value={share()}
                    style={{ flex: '1', 'min-width': '120px' }}
                    onInput={(e) =>
                      gesture((l) => setShare(l, pane.id, Number(e.currentTarget.value)), {
                        settle: false,
                      })
                    }
                    onChange={() => settle()}
                  />
                  <code style={{ width: '44px', 'text-align': 'right' }}>
                    {Math.round(share() * 100)}%
                  </code>
                  <button type="button" onClick={() => gesture((l) => mute(l, pane.id))}>
                    mute
                  </button>
                  <button
                    type="button"
                    onClick={() => gesture((l) => solo(l, pane.id), { settle: false })}
                  >
                    solo
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      gesture((l) => (isMember(l.structure, pane.id) ? popOut : popIn)(l, pane.id))
                    }
                  >
                    {floating() ? 'dock' : 'float'}
                  </button>
                </div>
              )
            }}
          </For>
        </div>
        <div style={{ display: 'flex', gap: '8px', 'margin-top': '10px' }}>
          <input
            type="text"
            placeholder="新 pane id（tiled 直入り）"
            value={newPaneId()}
            onInput={(e) => setNewPaneId(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPane()}
          />
          <button type="button" onClick={addPane}>
            admit
          </button>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">構造記法 — サイズを書かないトポロジー</h2>
        <p class="docs-page-helper">
          <code>|</code> = 列の区切り（軸の交代） / <code>/</code> = 列内の縦並び / <code>~</code> =
          floating。数字は書かない — サイズは場の領分（二重 SSOT の構造的排除）。
        </p>
        <div style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
          <input
            type="text"
            value={notationInput()}
            style={{ flex: '1', 'min-width': '240px', 'font-family': 'monospace' }}
            onInput={(e) => setNotationInput(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyNotation()}
          />
          <button type="button" onClick={applyNotation}>
            構造を適用
          </button>
        </div>
        <Show when={inputError()}>
          <p class="docs-page-helper" style={{ color: 'var(--color-semantic-error, #ff6b5e)' }}>
            {inputError()}
          </p>
        </Show>
      </section>

      <section>
        <h2 class="docs-section-title">Scene & scrub — 遷移を手で持つ</h2>
        <p class="docs-page-helper">
          形を作って capture A / B → slider で <code>interpolate(A, B, t)</code>{' '}
          の中間を見る。手放すと近い端点へ着地（LE-7 の一時状態規則。spring で運ぶのは LE-P3）。
        </p>
        <div style={{ display: 'flex', gap: '8px', 'align-items': 'center', 'flex-wrap': 'wrap' }}>
          <button type="button" onClick={() => capture('A')}>
            capture A{sceneA() ? ' ✓' : ''}
          </button>
          <button type="button" onClick={() => capture('B')}>
            capture B{sceneB() ? ' ✓' : ''}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            disabled={!sceneA() || !sceneB()}
            value={scrubT() ?? 0}
            style={{ flex: '1', 'min-width': '160px' }}
            onInput={(e) => setScrubT(Number(e.currentTarget.value))}
            onChange={releaseScrub}
          />
          <button type="button" disabled={!sceneA()} onClick={() => applySceneNow(sceneA())}>
            apply A
          </button>
          <button type="button" disabled={!sceneB()} onClick={() => applySceneNow(sceneB())}>
            apply B
          </button>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Settle log — 履歴は無名 Scene の列</h2>
        <p class="docs-page-helper">
          連続操作（slider drag 中）は log に入らず、settle（手放し / Scene apply）だけが刻まれる。
          entry click でその形に戻る（total recall + log undo）。
        </p>
        <ol
          style={{ display: 'grid', gap: '4px', 'font-family': 'monospace', 'font-size': '13px' }}
        >
          <For each={[...history()].slice(-10).reverse()}>
            {(entry) => {
              const floatIds = Object.keys(entry.layout.attention).filter(
                (id) =>
                  !isMember(entry.layout.structure, id) && (entry.layout.attention[id] ?? 0) > 0,
              )
              return (
                <li>
                  <button
                    type="button"
                    style={{ 'font-family': 'monospace' }}
                    onClick={() =>
                      applySceneNow({
                        id: 'history',
                        name: 'history entry',
                        layout: entry.layout,
                      })
                    }
                  >
                    [{entry.author}] {formatNotation(entry.layout.structure, floatIds)}
                  </button>
                </li>
              )
            }}
          </For>
        </ol>
      </section>
    </>
  )
}
