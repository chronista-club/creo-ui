// CreoUI — Typography style (CreoTextStyle)
//
// typography token (size / weight / line-height) を「役割」の単位に束ねた style
// 定義。適用は .creoText(_:) (CreoTextModifier.swift)。
// ladyland consumer feedback #6: 「Typography が生 CGFloat のみ。Font ヘルパーが
// 無く consumer が .font(.system(size:weight:)) を手組みしている」への応答。
//
// preset の組 (size × weight × line-height) は web 実装の実勢に揃えている:
//   title hero/page/section = bold + tight (docs.css h1/h2)
//   title subsection/card   = semibold + tight (dialog / drawer / popover title)
//   body 系                 = regular + normal (emphasis のみ semibold)
//
// struct + static preset (enum ではない) なのは、consumer が copy-modify で独自
// style を組めるようにするため (CreoTheme と同じ思想)。

import SwiftUI

public struct CreoTextStyle: Equatable, Sendable {
    /// Font size (pt)。CreoUITokens.typography* の generated 値を指す
    public var size: CGFloat
    public var weight: Font.Weight
    /// Dynamic Type の scaling 基準 (@ScaledMetric relativeTo)。役割の近い
    /// Apple text style に寄せることで、accessibility 設定に自然に追従する
    public var relativeTo: Font.TextStyle
    /// CSS line-height 相当の倍率。CreoTextModifier が lineSpacing に換算する
    public var lineHeight: CGFloat

    public init(
        size: CGFloat,
        weight: Font.Weight = .regular,
        relativeTo: Font.TextStyle = .body,
        lineHeight: CGFloat = CGFloat(CreoUITokens.typographyLineHeightNormal)
    ) {
        self.size = size
        self.weight = weight
        self.relativeTo = relativeTo
        self.lineHeight = lineHeight
    }
}

public extension CreoTextStyle {
    // MARK: - Title (typography.title.*)

    /// Hero title — landing page mega headline (72pt)
    static let titleHero = CreoTextStyle(
        size: CreoUITokens.typographyTitleHero,
        weight: Font.Weight(creoWeight: CreoUITokens.typographyWeightBold),
        relativeTo: .largeTitle,
        lineHeight: CGFloat(CreoUITokens.typographyLineHeightTight)
    )

    /// Page title — h1 (44pt)
    static let titlePage = CreoTextStyle(
        size: CreoUITokens.typographyTitlePage,
        weight: Font.Weight(creoWeight: CreoUITokens.typographyWeightBold),
        relativeTo: .largeTitle,
        lineHeight: CGFloat(CreoUITokens.typographyLineHeightTight)
    )

    /// Section title — h2 (32pt)
    static let titleSection = CreoTextStyle(
        size: CreoUITokens.typographyTitleSection,
        weight: Font.Weight(creoWeight: CreoUITokens.typographyWeightBold),
        relativeTo: .title,
        lineHeight: CGFloat(CreoUITokens.typographyLineHeightTight)
    )

    /// Subsection title — h3 (24pt)
    static let titleSubsection = CreoTextStyle(
        size: CreoUITokens.typographyTitleSubsection,
        weight: Font.Weight(creoWeight: CreoUITokens.typographyWeightSemibold),
        relativeTo: .title2,
        lineHeight: CGFloat(CreoUITokens.typographyLineHeightTight)
    )

    /// Card title — h4 / dialog・drawer・popover title (20pt)
    static let titleCard = CreoTextStyle(
        size: CreoUITokens.typographyTitleCard,
        weight: Font.Weight(creoWeight: CreoUITokens.typographyWeightSemibold),
        relativeTo: .title3,
        lineHeight: CGFloat(CreoUITokens.typographyLineHeightTight)
    )

    // MARK: - Body (typography.body.*)

    /// Lead body — opening paragraph / intro (20pt)
    static let bodyLead = CreoTextStyle(
        size: CreoUITokens.typographyBodyLead,
        relativeTo: .title3
    )

    /// Default body — regular paragraph text (16pt、最もよく使う)
    static let body = CreoTextStyle(size: CreoUITokens.typographyBodyDefault)

    /// Emphasis body — size は body と同じ、weight で意味的に強調 (16pt semibold)
    static let bodyEmphasis = CreoTextStyle(
        size: CreoUITokens.typographyBodyEmphasis,
        weight: Font.Weight(creoWeight: CreoUITokens.typographyWeightSemibold)
    )

    /// Helper text — form helper, status message, secondary info (14pt)
    static let bodyHelper = CreoTextStyle(
        size: CreoUITokens.typographyBodyHelper,
        relativeTo: .subheadline
    )

    /// Caption — image caption, footnote, meta info (12pt)
    static let bodyCaption = CreoTextStyle(
        size: CreoUITokens.typographyBodyCaption,
        relativeTo: .caption
    )
}

public extension Font.Weight {
    /// DTCG fontWeight (数値 100–900、generated token は Double) → Font.Weight。
    /// 中間値は最近傍に丸める
    init(creoWeight value: Double) {
        switch value {
        case ..<150: self = .ultraLight
        case ..<250: self = .thin
        case ..<350: self = .light
        case ..<450: self = .regular
        case ..<550: self = .medium
        case ..<650: self = .semibold
        case ..<750: self = .bold
        case ..<850: self = .heavy
        default: self = .black
        }
    }
}
