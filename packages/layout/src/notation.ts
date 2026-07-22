/**
 * 記法 — トポロジーの直列化（LE-4）。
 *
 *   "ec | cv/pp ~ board"
 *      |  = 列の区切り（軸の交代）
 *      /  = 列内の縦の並び
 *      ~  = floating（構造非所属で場に居る pane の明示）
 *
 * サイズ（数字）は書かない — サイズは場の領分。二重 SSOT を構造的に排除する。
 * parse / format は往復テストで固定（対の写像の規律）。
 */

import type { Structure } from './types'

/** id に使える文字: 区切り記号（| / ~）と空白以外 */
const ID_RE = /^[^\s|/~]+$/

export interface ParsedNotation {
  readonly structure: Structure
  /** 構造非所属で場に居る pane（floating）。場の値そのものは記法の外（attention record が持つ） */
  readonly floats: readonly string[]
}

function validateId(id: string): string {
  if (!ID_RE.test(id)) {
    throw new Error(`layout notation: 不正な pane id "${id}"（空白と | / ~ は使えない）`)
  }
  return id
}

/** 記法文字列 → 構造 + float 集合。不正入力は throw */
export function parseNotation(text: string): ParsedNotation {
  const parts = text.split('~')
  if (parts.length > 2) {
    throw new Error('layout notation: float 区切り ~ は 1 つまで')
  }
  const left = (parts[0] ?? '').trim()
  const right = (parts[1] ?? '').trim()

  const columns =
    left === ''
      ? []
      : left.split('|').map((segment) => {
          const trimmed = segment.trim()
          if (trimmed === '') {
            throw new Error('layout notation: 空の列（| の間に pane が無い）')
          }
          const panes = trimmed.split('/').map((s) => {
            const id = s.trim()
            if (id === '') {
              throw new Error('layout notation: 空の pane（/ の間に id が無い）')
            }
            return validateId(id)
          })
          return { panes }
        })

  const floats = right === '' ? [] : right.split(/\s+/).map(validateId)

  const seen = new Set<string>()
  for (const id of [...columns.flatMap((c) => c.panes), ...floats]) {
    if (seen.has(id)) {
      throw new Error(`layout notation: pane id 重複 "${id}"`)
    }
    seen.add(id)
  }

  return { structure: { columns }, floats }
}

/** 構造 + float 集合 → 正準形の記法文字列。parse(format(x)) が deep-equal になる */
export function formatNotation(structure: Structure, floats: readonly string[] = []): string {
  const seen = new Set<string>()
  for (const id of [...structure.columns.flatMap((c) => [...c.panes]), ...floats]) {
    validateId(id)
    if (seen.has(id)) {
      throw new Error(`layout notation: pane id 重複 "${id}"`)
    }
    seen.add(id)
  }
  for (const col of structure.columns) {
    if (col.panes.length === 0) {
      throw new Error('layout notation: 空の列は直列化できない')
    }
  }
  const cols = structure.columns.map((col) => col.panes.join('/')).join(' | ')
  if (floats.length === 0) return cols
  const floatPart = `~ ${floats.join(' ')}`
  return cols === '' ? floatPart : `${cols} ${floatPart}`
}
