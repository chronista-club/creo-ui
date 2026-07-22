# creo-ui-layout（仮称）

Layout Engine — attention 連続場 + 構造 + scrub の protocol core。

- **設計 SSOT**: [docs/design/layout-engine.md](../../docs/design/layout-engine.md)（LE-1〜LE-20）
- **LE-P0**: protocol types + 純 calculation（resolve / interpolate / gestures / 記法）+ property test。
  DOM 依存ゼロ — SolidJS reference 実装（apply）は LE-P1。
- 場（attention ∈ [0,1]）が唯一のサイズ真実源。0 = 非表示。構造は軸交代 + 所属のみ
  （記法 `ec | cv/pp ~ board`、サイズを持たない）。

```bash
bun test packages/layout/src   # property + golden（記法文字列で書かれた読める仕様）
```

primary consumer / dogfood は Vantage Point（VP `docs/design/49-gui-layout-engine.md`）。
