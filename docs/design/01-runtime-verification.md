# 01. Runtime の検証

> **Status**: Active
> **Related**: `mem_1Cf1aYeoBAH5i4surBDEsT`（R01）
> **対象**: `package.json`, `vitest.config.ts`, `tsconfig.test.json`, `tests/components/`, `.github/workflows/ci.yml`

## 目的と構成

内部のリファクタリングで、consumer が使う状態・DOM・cleanup の契約を守る。
PR CI とローカルは同じ root script を実行し、どの検査でも失敗が終了コードに伝わる。

| コマンド | 対象 | 環境 |
|---|---|---|
| `bun run test:runtime` | Editor Host / Layout / Web / Vision の既存 unit test、Frame の DOM 介在 test | Bun。Frame は package 内の `bunfig.toml` で happy-dom を preload |
| `bun run test:components` | 公開 barrel から読み込んだ Solid component の反応性・DOM identity・unmount | Vitest + vite-plugin-solid + happy-dom。Node 24 を CI で使用 |
| `bun run typecheck` | package source、md-view、component test と Vitest config | 各対象の tsconfig を明示して実行 |
| `bun run test:transforms` | token pipeline | Bun。成果物の build 後に実行 |

component test は `tests/components/**/*.test.tsx` に置く。既存 Bun suite と実行対象を
分けるため、package の `src` に Vitest test を混在させない。Solid plugin が JSX を
DOM 更新コードへ変換し、`resolve.dedupe` で workspace 内の Solid runtime を一つに揃える。
テストを package の配布物や declaration build に含めない。

## Markdown 型検査

R02 で Markdown は公開済みの remark 系パッケージへ移行した。root の型検査に
md-view も含め、sibling repo・WASM 生成物・site の型スタブは不要。
配布物の検査は [02-package-install.md](02-package-install.md) を参照。

## 最初の contract fixture

- Button: consumer の signal で loading を変更し、同一 DOM の disabled / aria-busy / click が追従する。
- Outliner: 入力を controlled な木へ返し、consumer からの値の変更も表示する。
- Editor: Provider 内の `bind()` が Target / Host / DOM を更新し、consumer component の unmount で field を解除する。
- PaneStage: 安定した PaneRef を渡した場合、非表示・再表示で入力 DOM と値を維持する。

いずれも production code を mock しない。テストの render owner はケースごとに破棄する。
Editor の global style 復元は R07 の対象なので、テスト間の隔離で style を戻すことを
製品の cleanup 保証と取り違えない。

## 追加するとき

1. consumer が観測する一つの動作を `tests/components/` に記述する。
2. `bun run test:components -- tests/components/<name>.test.tsx` で対象を実行する。
3. `bun run typecheck` と `bun run test:runtime` で型と既存の計算経路も確認する。

新しい不具合の回帰 fixture は R03 / R05 / R08 / R09 / R10 等の修正と一緒に追加する。
この基盤の完了は、それらの未修正の不具合が解消したことを意味しない。

## 保証範囲と実行時の注意

- happy-dom は DOM の模擬環境。実際のレイアウト、CSS の視覚結果、native keyboard
  activation、IME、screen reader、カメラは browser / 実機で確認する。
- 配布 tarball の検査は R02。source barrel を使うテストは install / exports / dist の保証ではない。
- Frame のテストを root から直接 `bun test packages/frame` で呼ばない。固有の DOM preload が読まれない。
- Solid plugin を外すと JSX が React 向けに解釈され、描画テストの import が失敗する。
- Vitest の対象に `packages/**/*.test.ts` を足さない。既存テストは `bun:test` を使用する。
- md-view は Markdown と HTML の扱い、描画差し替え、複数ビューの脚注を component test で検査する。

## Status log

- 2026-09-13: R01-a で既存 runtime テストを PR CI に接続。R01-b で Solid 描画テストと md-view の型検査を追加。

- 2026-09-14: R01 を nightly にマージ。R02 で Markdown の標準 parser 移行に合わせて実行前提を更新。

## 参照

- [Solid のテストガイド](https://docs.solidjs.com/guides/testing)
