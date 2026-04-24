// CreoUI — Progress bar + Spinner (SwiftUI)
//
// Web `.creo-progress` / `.creo-spinner` の SwiftUI 版。VP fetch / compute 中の
// busy / progress 表示。
//
// Usage:
//   CreoProgress(value: 0.6)                           // determinate 60%
//   CreoProgress(variant: .success, value: 1.0)
//   CreoProgress()                                      // indeterminate
//   CreoSpinner()                                       // default md brand
//   CreoSpinner(size: .lg, variant: .neutral)

import SwiftUI

public enum CreoProgressVariant: String, CaseIterable, Sendable {
    case brand
    case success
    case warning
    case error
}

public enum CreoProgressSize: String, CaseIterable, Sendable {
    case sm
    case md
    case lg
}

public struct CreoProgress: View {
    let value: Double?  // nil → indeterminate
    let variant: CreoProgressVariant
    let size: CreoProgressSize

    public init(
        value: Double? = nil,
        variant: CreoProgressVariant = .brand,
        size: CreoProgressSize = .md
    ) {
        self.value = value.map { max(0, min(1, $0)) }
        self.variant = variant
        self.size = size
    }

    public var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                // Track
                RoundedRectangle(cornerRadius: CreoUITokens.radiusFull)
                    .fill(Color.colorSurfaceBgSubtle)

                // Fill
                if let value {
                    RoundedRectangle(cornerRadius: CreoUITokens.radiusFull)
                        .fill(fillColor)
                        .frame(width: geo.size.width * value)
                        .animation(.easeInOut(duration: 0.24), value: value)
                } else {
                    // Indeterminate: SwiftUI の ProgressView に委ねる (native animation)
                    ProgressView()
                        .progressViewStyle(.linear)
                        .tint(fillColor)
                }
            }
        }
        .frame(height: trackHeight)
    }

    private var trackHeight: CGFloat {
        switch size {
        case .sm: return 4
        case .md: return 8
        case .lg: return 12
        }
    }

    private var fillColor: Color {
        switch variant {
        case .brand: return Color.colorBrandPrimary
        case .success: return Color.colorSemanticSuccess
        case .warning: return Color.colorSemanticWarning
        case .error: return Color.colorSemanticError
        }
    }
}

// MARK: - Spinner

public enum CreoSpinnerVariant: String, CaseIterable, Sendable {
    case brand
    case neutral
}

public struct CreoSpinner: View {
    let size: CreoProgressSize
    let variant: CreoSpinnerVariant
    @State private var rotation: Double = 0

    public init(
        size: CreoProgressSize = .md,
        variant: CreoSpinnerVariant = .brand
    ) {
        self.size = size
        self.variant = variant
    }

    public var body: some View {
        Circle()
            .trim(from: 0, to: 0.75)
            .stroke(
                arcColor,
                style: StrokeStyle(
                    lineWidth: thickness,
                    lineCap: .round
                )
            )
            .frame(width: diameter, height: diameter)
            .rotationEffect(.degrees(rotation))
            .onAppear {
                withAnimation(.linear(duration: 0.9).repeatForever(autoreverses: false)) {
                    rotation = 360
                }
            }
            .accessibilityLabel("Loading")
    }

    private var diameter: CGFloat {
        switch size {
        case .sm: return 16
        case .md: return 24
        case .lg: return 40
        }
    }

    private var thickness: CGFloat {
        switch size {
        case .sm, .md: return 2
        case .lg: return 3
        }
    }

    private var arcColor: Color {
        switch variant {
        case .brand: return Color.colorBrandPrimary
        case .neutral: return Color.colorTextSecondary
        }
    }
}
