# @chronista-club/creo-ui-layout

Layout Engine — attention 連続場 + 構造 + scrub の protocol core。

- **設計 SSOT**: [docs/design/layout-engine.md](../../docs/design/layout-engine.md)（LE-1〜LE-20）
- **LE-P0**: protocol types + 純 calculation（resolve / interpolate / gestures / 記法）+ property test。
  core は DOM 依存ゼロ。
- **LE-P1**: `/solid` = SolidJS reference 実装（`PaneStage` + `useEngineResolved`、action 層）。
  host div は reparent しない（LE-10）、motion なし（時間は driver = LE-P3）。
  dogfood: site の `/lab/layout`（secondary）。
- 場（attention ∈ [0,1]）が唯一のサイズ真実源。0 = 非表示。構造は軸交代 + 所属のみ
  （記法 `ec | cv/pp ~ board`、サイズを持たない）。

```bash
bun test packages/layout/src   # property + golden（記法文字列で書かれた読める仕様）
```

primary consumer / dogfood は Vantage Point（VP `docs/design/49-gui-layout-engine.md`）。
