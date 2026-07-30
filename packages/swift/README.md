# CreoUI (Swift)

creo-ui Design System tokens for Apple platforms (iOS / macOS / watchOS / tvOS).

単一の W3C Design Tokens (DTCG) から生成された SwiftUI `Color` extension と `CreoUITokens` 定数を Swift Package Manager 経由で提供する。

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
    var body: some View {
        Text("Creo")
            .foregroundColor(.colorBrandPrimary)      // SwiftUI Color extension
            .padding(CreoUITokens.spacingM)          // CGFloat
            .font(.system(
                size: CreoUITokens.typographySizeL,  // CGFloat
                weight: .semibold
            ))
            .background(Color.colorSurfaceSubtle)
            .cornerRadius(CreoUITokens.radiusM)
    }
}
```

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
- Typography の size / weight は `CGFloat` / `Double` 等の値として露出し、`.font()` modifier の作成は consumer 側に任せている (`Font` を返す helper は Phase 2 で検討)。
- 将来 theme 切替 (light / dark / high-contrast) が入る際は `Color(dynamicProvider:)` に寄せる予定。

## License

Apache-2.0 — [LICENSE](https://github.com/chronista-club/creo-ui/blob/main/LICENSE)
