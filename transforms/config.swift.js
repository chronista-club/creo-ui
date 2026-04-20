/**
 * Style Dictionary config for Swift (SPM) platform.
 *
 * Generates SwiftUI Color/CGFloat extensions from W3C DTCG tokens.
 * Consumed by CreoUI SPM package (packages/swift).
 */

export default {
  source: ['tokens/**/*.json'],
  platforms: {
    swift: {
      transformGroup: 'ios-swift',
      buildPath: 'packages/swift/Sources/CreoUI/Generated/',
      files: [
        {
          destination: 'Tokens.swift',
          format: 'ios-swift/class.swift',
          className: 'CreoUITokens',
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
}
