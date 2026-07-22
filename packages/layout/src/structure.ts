/**
 * 構造の純操作（LE-4/5）。
 *
 * 構造が持つのは「軸の交代」と「所属」だけ — サイズ情報は一切持たない。
 * 全関数は新しい Structure を返す（無変更なら同一参照を返し、呼び手が no-op を検知できる）。
 */

import type { Structure } from './types'

/** 所属 pane id を構造順（列順 → 列内順）で返す */
export function memberIds(structure: Structure): string[] {
  return structure.columns.flatMap((col) => [...col.panes])
}

export function isMember(structure: Structure, id: string): boolean {
  return structure.columns.some((col) => col.panes.includes(id))
}

/** pane を構造から抜く（空になった列は落とす）。非所属なら同一参照 */
export function removePane(structure: Structure, id: string): Structure {
  if (!isMember(structure, id)) return structure
  const columns = structure.columns
    .map((col) => ({ panes: col.panes.filter((p) => p !== id) }))
    .filter((col) => col.panes.length > 0)
  return { columns }
}

/** 末尾に新規列として pane を足す */
export function appendColumn(structure: Structure, id: string): Structure {
  return { columns: [...structure.columns, { panes: [id] }] }
}

/** 指定列の末尾に pane を足す。列 index が範囲外なら新規列（appendColumn）に落ちる */
export function insertIntoColumn(structure: Structure, id: string, columnIndex: number): Structure {
  if (columnIndex < 0 || columnIndex >= structure.columns.length) {
    return appendColumn(structure, id)
  }
  const columns = structure.columns.map((col, i) =>
    i === columnIndex ? { panes: [...col.panes, id] } : col,
  )
  return { columns }
}
