// swift-tools-version:5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "CreoUI",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
        .watchOS(.v10),
        .tvOS(.v17),
    ],
    products: [
        .library(
            name: "CreoUI",
            targets: ["CreoUI"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "CreoUI",
            dependencies: [],
            path: "Sources/CreoUI"
        ),
        .testTarget(
            name: "CreoUITests",
            dependencies: ["CreoUI"],
            path: "Tests/CreoUITests"
        ),
    ]
)
