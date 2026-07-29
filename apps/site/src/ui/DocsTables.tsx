/**
 * Component docs 共通の Props / Token reference 表 — `.creo-table` の dogfood。
 *
 * 以前は div + grid の独自 CSS (docs-props-table / docs-tokens-table) で組んでいたが、
 * 「site は素の creo-ui = standard を見せる」方針に合わせ、site 自身が `.creo-table`
 * (data-size="s" の dense 文書表) を使って見せる。全 Components page で同一構造
 * (34 page で fingerprint 一致) だったため、共有 component 化と dogfood 化を同時に行った。
 */

export interface PropsRow {
  attr: string
  values: string
  def: string
  meaning: string
}

export interface TokensRow {
  slot: string
  token: string
}

export function PropsTable(props: { rows: readonly PropsRow[] }) {
  return (
    <table class="creo-table" data-size="s">
      <thead class="creo-table-head">
        <tr class="creo-table-row">
          <th class="creo-table-cell" scope="col">
            Attribute
          </th>
          <th class="creo-table-cell" scope="col">
            Values
          </th>
          <th class="creo-table-cell" scope="col">
            Default
          </th>
          <th class="creo-table-cell" scope="col">
            Meaning
          </th>
        </tr>
      </thead>
      <tbody class="creo-table-body">
        {props.rows.map((p) => (
          <tr class="creo-table-row">
            <td class="creo-table-cell">
              <code>{p.attr}</code>
            </td>
            <td class="creo-table-cell">
              <code>{p.values}</code>
            </td>
            <td class="creo-table-cell">
              <code>{p.def}</code>
            </td>
            <td class="creo-table-cell">{p.meaning}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function TokensTable(props: { rows: readonly TokensRow[] }) {
  return (
    <table class="creo-table" data-size="s">
      <thead class="creo-table-head">
        <tr class="creo-table-row">
          <th class="creo-table-cell" scope="col">
            Slot
          </th>
          <th class="creo-table-cell" scope="col">
            Token
          </th>
        </tr>
      </thead>
      <tbody class="creo-table-body">
        {props.rows.map((t) => (
          <tr class="creo-table-row">
            <td class="creo-table-cell">{t.slot}</td>
            <td class="creo-table-cell">
              <code>{t.token}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
