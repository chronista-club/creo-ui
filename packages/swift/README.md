# CreoUI (Swift)

Creo UI Design System tokens for Apple platforms (iOS / macOS / watchOS / tvOS).

単一の W3C Design Tokens (DTCG) から生成された SwiftUI `Color` extension と `CreoUITokens` 定数を Swift Package Manager 経由で提供する。

## 対応 Platform

- iOS 17+
- macOS 14+
- watchOS 10+
- tvOS 17+

Swift tools-version: 5.9

## インストール

`Package.swift` の `dependencies` に追加:

```swift
// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "MyApp",
    platforms: [.iOS(.v17), .macOS(.v14)],
    dependencies: [
        .package(
            url: "https://github.com/chronista-club/creo-ui.git",
            from: "0.0.1"
        ),
    ],
    targets: [
        .target(
            name: "MyApp",
            dependencies: [
                .product(name: "CreoUI", package: "creo-ui"),
            ]
        ),
    ]
)
```

Xcode からは: `File > Add Package Dependencies...` で `https://github.com/chronista-club/creo-ui.git` を入力、Target に `CreoUI` を追加。

## 使い方

```swift
import CreoUI
import SwiftUI

struct HeroView: View {
    var body: some View {
        Text("Creo")
            .foregroundColor(.colorBrandPrimary)      // SwiftUI Color extension
            .padding(CreoUITokens.spacingMd)          // CGFloat
            .font(.system(
                size: CreoUITokens.typographySizeLg,  // CGFloat
                weight: .semibold
            ))
            .background(Color.colorSurfaceSubtle)
            .cornerRadius(CreoUITokens.radiusMd)
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
| `typography.size.*` | `CreoUITokens.typographySizeMd` 等 (body, 5 step) | `CGFloat` |
| `typography.display.*` | `CreoUITokens.typographyDisplayMd` 等 (heading, 5 step) | `CGFloat` |
| `typography.weight.*` | `CreoUITokens.typographyWeightRegular` 等 | `Double` |
| `typography.family.*` / `shadow.*` | `CreoUITokens.typographyFamilySans` 等 | `String` |

全定数は [packages/swift/Sources/CreoUI/Generated/Tokens.swift](./Sources/CreoUI/Generated/Tokens.swift) で確認できる (Style Dictionary が `bun run build:swift` で自動生成)。

## 設計メモ

- Color は UIKit の `UIColor` ではなく SwiftUI の `Color` で出力している。これは iOS / macOS / watchOS / tvOS 共通で使える唯一の色型のため (UIKit は iOS / tvOS のみ)。
- Typography の size / weight は `CGFloat` / `Double` 等の値として露出し、`.font()` modifier の作成は consumer 側に任せている (`Font` を返す helper は Phase 2 で検討)。
- 将来 theme 切替 (light / dark / high-contrast) が入る際は `Color(dynamicProvider:)` に寄せる予定。

## License

Apache-2.0 — [LICENSE](https://github.com/chronista-club/creo-ui/blob/main/LICENSE)
