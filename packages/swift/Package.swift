// swift-tools-version:5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "Creoui",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
        .watchOS(.v10),
        .tvOS(.v17),
    ],
    products: [
        .library(
            name: "Creoui",
            targets: ["Creoui"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "Creoui",
            dependencies: [],
            path: "Sources/Creoui"
        ),
        .testTarget(
            name: "CreouiTests",
            dependencies: ["Creoui"],
            path: "Tests/CreouiTests"
        ),
    ]
)
