/**
 * policy — AI 提案の適用規則 = DAW automation modes（LE-16）。
 *
 * 誰が引き金を引くかは consumer 側の per-scope 設定。ここはその語彙と、
 * 提案 1 件を mode に従って遷移に落とす入口だけを持つ:
 *
 *   | mode  | 挙動 |
 *   |-------|------|
 *   | off   | 受けない（accepted = false） |
 *   | write | 遷移を開くだけ（hitl、既定）— 適用は人の手（t fader / commit） |
 *   | read  | driver が t を 1 へ運び、到達で commit（author = 'ai' が監査証跡） |
 *   | touch | read と同じ駆動 + human 入力での奪取は consumer 配線 |
 *
 * touch の奪取は 2 段構え（engine 側に実装済）:
 *   - whole-scope: engine.update 等の直接操作が遷移を seize（1 規則）
 *   - per-pane 継続: handle.updateTarget で morph を続けたまま目標を上書き
 * consumer は human 入力イベントで drive.cancel() → hand driver / settleRelease に
 * 引き継ぐ。復帰（release 後に AI へ滑らかに戻る）も同じ部品の合成で書ける。
 */

import type { DriverRun, TransitionDriver } from './drivers'
import { createTimeDriver } from './drivers'
import type { LayoutEngine, SettleAuthor, TransitionHandle } from './engine'
import type { Layout } from './types'

export type ApplyPolicy = 'off' | 'write' | 'read' | 'touch'

export interface ProposeOptions {
  policy: ApplyPolicy
  /** read / touch の適用駆動（既定 = createTimeDriver()）。reduced-motion なら jumpDriver を渡す */
  driver?: TransitionDriver
  /** 到達時の settle author（既定 'ai' — 監査証跡） */
  author?: SettleAuthor
}

export interface ProposeResult {
  accepted: boolean
  /** off 以外で返る。write = これを人が scrub / commit する */
  handle?: TransitionHandle
  /** read / touch で返る。touch の奪取 = consumer が human 入力でこれを cancel する */
  drive?: DriverRun
}

/** AI 提案 1 件を policy に従って遷移へ落とす（LE-15 の適用側の入口） */
export function proposeLayout(
  engine: LayoutEngine,
  scope: string,
  target: Layout,
  options: ProposeOptions,
): ProposeResult {
  if (options.policy === 'off') return { accepted: false }

  const handle = engine.beginTransition(scope, target)
  if (options.policy === 'write') return { accepted: true, handle }

  const driver = options.driver ?? createTimeDriver()
  const drive = driver.start((t) => handle.scrub(t))
  drive.finished.then((ok) => {
    if (ok && !handle.done) handle.commit(options.author ?? 'ai')
  })
  return { accepted: true, handle, drive }
}
