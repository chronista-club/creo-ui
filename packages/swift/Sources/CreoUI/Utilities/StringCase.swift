import Foundation

// MARK: - Case conversion utilities
//
// Design system を使う consumer app が slug (kebab-case / snake_case) の
// identifier を人間可読な title に変換する場面は頻出。本 util で統一。
//
// Web 側 (Lodash `_.startCase`, Rails `titleize`) と揃えた naming + 挙動。

public extension String {
    /// kebab-case / snake_case を Title Case (空白区切り) に変換
    ///
    /// Rails `String#titleize`、Lodash `_.startCase` 相当。
    ///
    /// - `"vantage-point"` → `"Vantage Point"`
    /// - `"creo-memories"` → `"Creo Memories"`
    /// - `"go_fast_packing"` → `"Go Fast Packing"`
    /// - `"CREO-MEMORIES"` → `"CREO MEMORIES"` (略語を崩さない — 先頭のみ保証)
    ///
    /// Foundation の `String.capitalized` は rest を lowercased にするので、
    /// 略語 (`API`, `URL`) が壊れる。本 util は各 word の先頭のみ upper、
    /// rest は保持する。
    var titleCased: String {
        components(separatedBy: CharacterSet(charactersIn: "-_"))
            .map { $0.isEmpty ? $0 : $0.prefix(1).uppercased() + $0.dropFirst() }
            .joined(separator: " ")
    }

    /// 先頭 n 文字 + ellipsis で省略 (n 文字以内ならそのまま)
    ///
    /// - `"mako/vp-83-phase1-sidebar".head(6)` → `"mako/v..."`
    /// - `"short".head(6)` → `"short"` (閾値以内はそのまま)
    ///
    /// 中央省略 (`.truncationMode(.middle)`) と違い、**先頭固定幅 + 末尾省略**
    /// で視覚的に列揃えしやすい。
    func head(_ n: Int, ellipsis: String = "…") -> String {
        if count <= n { return self }
        return String(prefix(n)) + ellipsis
    }
}
