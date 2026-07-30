# CreoUI (Swift)

creo-ui Design System tokens for Apple platforms (iOS / macOS / watchOS / tvOS).

単一の W3C Design Tokens (DTCG) から生成された SwiftUI `Color` extension / `CreoUITokens` 定数に加え、8 theme の `CreoTheme` 注入と `.creoText()` typography modifier を Swift Package Manager 経由で提供する。

## 対応 Platform

- iOS 17+
- macOS 14+
- watchOS 10+
- tvOS 17+

Swift tools-version: 5.9

## インストール

現状は **path 依存 (sibling checkout)** で導入します。creo-ui を隣に checkout し、
`Package.swift` の `dependencies` に追加:

```swift
// 例: ~/repos/my-app と ~/repos/creo-ui が並んでいる場合
dependencies: [
    .package(path: "../creo-ui/packages/swift"),
],
targets: [
    .target(
        name: "MyApp",
        dependencies: [
            .product(name: "CreoUI", package: "swift"),
        ]
    ),
]
```

実例: ladyland (bikeboy-ladyland) が `.package(path: "../../creo-ui/packages/swift")` で
導入済み (2026-07-30)。

> **URL + version 指定 (`.package(url:from:)`) は現状使えません** — SPM は repo root の
> Package.swift しか解決できず (subdirectory 参照不可)、かつ SPM が要求する素の
> semver tag は repo-global namespace のため creo-ui の多 package 独立 version
> (`web-v*` / `rust-v*` …) と衝突します。正式配布は Phase 2c (`creo-ui-swift` の
> 別 repo 切り出し) で対応予定です。

## 使い方

```swift
import CreoUI
import SwiftUI

struct HeroView: View {
    @Environment(\.creoTheme) private var theme

    var body: some View {
        Text("Creo")
            .creoText(.titleCard)                 // typography role (Dynamic Type 対応)
            .foregroundColor(theme.brandPrimary)  // theme 経由の色
            .padding(CreoUITokens.spacingM)       // CGFloat token
            .background(theme.surfaceBgSubtle)
            .cornerRadius(CreoUITokens.radiusM)
    }
}
```

### Theme 注入 (`@Environment(\.creoTheme)`)

8 theme (4 family × light/dark、creo-memories preset 由来) を `CreoTheme` struct として同梱。
app root で 1 回注入すれば、CreoUI component と `theme.*` 参照の全 view に行き渡る:

```swift
// 固定 theme
ContentView().creoTheme(.soraDark)

// 外観モード追従 — colorScheme を見て light/dark を自動選択
ContentView().creoTheme(.mint)

// 独自 theme (copy-modify) — AV semantic 等の実験にも
var live = CreoTheme.mintDark
live.brandPrimary = Color(red: 1.0, green: 0.2, blue: 0.2)
ContentView().creoTheme(live)
```

- 何も注入しない場合の default は `.mintDark` (= flat 定数と同じ値。既存 consumer の見た目は不変)
- flat 定数 (`Color.colorBrandPrimary` 等) は mint-dark 焼き込みの後方互換 API として残る
- gradient token は CSS 文字列のため `CreoTheme` に含まない (LinearGradient 対応は Phase 3)

### Typography (`.creoText()`)

typography token を「役割」で適用する。`@ScaledMetric` による Dynamic Type scaling と
line-height 換算 (CSS 倍率 → `lineSpacing`) を一元化:

```swift
Text("ページ見出し").creoText(.titlePage)      // 44pt bold tight
Text("本文テキスト").creoText(.body)           // 16pt regular normal
Text("強調テキスト").creoText(.bodyEmphasis)   // 16pt semibold
Text("補足").creoText(.bodyHelper)             // 14pt
```

role は `titleHero / titlePage / titleSection / titleSubsection / titleCard /
bodyLead / body / bodyEmphasis / bodyHelper / bodyCaption` の 10 種
(web 実装の size × weight × line-height の実勢と同じ組)。`CreoTextStyle` は struct
なので copy-modify で独自 style も組める。

## 提供するトークン

| Category | 命名 | 型 |
|----------|------|----|
| `color.*` | `Color.colorBrandPrimary`, `Color.colorSemanticError` 等 | `SwiftUI.Color` |
| `spacing.*` | `CreoUITokens.spacingXs` ... `spacingXl` (5 step) | `CGFloat` |
| `margin.*` | `CreoUITokens.marginXs` ... `marginXl` (5 step) | `CGFloat` |
| `radius.*` | `CreoUITokens.radiusNone`, `radiusXs` ... `radiusFull` (5 step + special) | `CGFloat` |
| `typography.size.*` | `CreoUITokens.typographySizeM` 等 (body, 5 step) | `CGFloat` |
| `typography.display.*` | `CreoUITokens.typographyDisplayM` 等 (heading, 5 step) | `CGFloat` |
| `layout.gap.*` | `CreoUITokens.layoutGapSibling` 等 (semantic between-ness) | `CGFloat` |
| `layout.target.*` | `CreoUITokens.layoutTargetTap` (=44) / `Focus` / `Hit` (Apple HIG accessibility) | `CGFloat` |
| `typography.title.*` | `CreoUITokens.typographyTitlePage` 等 (role-based headings) | `CGFloat` |
| `typography.body.*` | `CreoUITokens.typographyBodyDefault` 等 (role-based body) | `CGFloat` |
| `typography.weight.*` | `CreoUITokens.typographyWeightRegular` 等 | `Double` |
| `typography.family.*` / `shadow.*` | `CreoUITokens.typographyFamilySans` 等 | `String` |

全定数は [packages/swift/Sources/CreoUI/Generated/Tokens.swift](./Sources/CreoUI/Generated/Tokens.swift) で確認できる (Style Dictionary が `bun run build:swift` で自動生成)。

## 設計メモ

- Color は UIKit の `UIColor` ではなく SwiftUI の `Color` で出力している。これは iOS / macOS / watchOS / tvOS 共通で使える唯一の色型のため (UIKit は iOS / tvOS のみ)。
- Typography は生値 (`CGFloat` / `Double`) と `.creoText()` modifier の両方を提供する。role が合う場面では modifier を推奨 (Dynamic Type / line-height が自動で正しくなる)。
- theme 切替は `Color(dynamicProvider:)` ではなく **`@Environment(\.creoTheme)` の値注入**で実現した (2026-07-30、ladyland consumer feedback #4)。dynamicProvider は light/dark の 2 値しか表現できないが、Environment 注入なら 8 theme + 独自 theme を同じ経路で扱える。外観モード追従は `.creoTheme(_ family:)` が担う。

## License

Apache-2.0 — [LICENSE](https://github.com/chronista-club/creo-ui/blob/main/LICENSE)
