# 03. アプリ共通 Editor

> **Status**: Active
> **Related**: `mem_1CfhYLwFUNkDpFgDaxw1z4`、[Editor Mode](editor-mode.md)
> **対象**: `packages/editor-host/src/{app-panel,layer,provider,selection,shortcut}.tsx`（selection / shortcut は .ts）、`apps/site/src/App.tsx`

## 目的

アプリに一つの Provider と EditorLayer を置き、編集対象と反映範囲を読み取れる調整卓にする。
旧 Discovery / Global / Surface の並びでは、consumer が登録した tool 項目が DOM 選択に
紐付かない限り見つからなかった。アプリ全体・画面の各部・変更した項目を共通の入口にする。
本設計は editor-mode.md の旧 panel 情報構造と常時クリック選択を置き換える。

## 構成と契約

- `app-panel.tsx`: アプリ全体 / 画面の各部 / 変更した項目のナビゲーション。
- `layer.tsx`: floating panel、DOM discovery、選択 outline、位置保存。
- `provider.tsx`: アプリの Host と picking state を所有。各画面は bind で項目を登録する。
- `selection.ts`: picking 中だけクリックを捕捉し、一つ選んだら picking を終了。
- `shortcut.ts`: Escape は picking 解除 → 選択解除 → Editor 終了。

Editor を開いても通常のクリックは止めない。「画面から選ぶ」の間だけ選択として扱う。
明示 bind の選択も従来の CSS component 発見も同じ入口を使う。component class の変更は
アプリ内の同種 component すべてへ作用し、その範囲をパネルに表示する。
selectionRoot は選べる範囲であって CSS の書き込み先ではない。

`EditorLayer` に `appName` と `sections` を任意指定できる。section は id / label /
fieldIds / scopeLabel を持ち、field を新規登録しない。登録済み field を表示する。
アプリ固有の範囲は consumer が scopeLabel で説明する。未登録 ID は表示せず、
空の section は隠す。未指定の項目も group 単位で一覧できる。

framework global 項目は ID に基づき「文字・色・余白」へ分類し、その他の global
項目は従来の group を維持。consumer の section 指定を優先する。

変更した項目は登録中 field の initial と現在値の差分、および class override。
field の reset は Host.setValue(initial)、CSS override は remove を通す。
既存の永続値も差分に含む。これは操作履歴の Undo ではなく、登録定義の既定値への復帰。
readonly-text は変更一覧に含めない。解除済み field の履歴管理は行わない。

## consumer の移行

```tsx
<EditorHostProvider>
  <App />
  <EditorLayer
    appName="Vantage Point"
    sections={[
      { id: 'sidebar', label: 'Sidebar', fieldIds: ['sidebar.size'],
        scopeLabel: 'Sidebar のすべての repo 名' },
    ]}
  />
</EditorHostProvider>
```

fieldIds は実際の bind の Target ID に合わせる。props 無しでも既存の登録を表示できる。
アプリの root に一組を配置し、route / lane / pane ごとに Provider を増やさない。
このライブラリはプロセス全体の singleton を強制せず、別アプリの独立 Host は維持する。
VP の依存更新と appName / sections の指定は consumer 側の作業。

## 検証

`tests/components/app-editor.test.tsx` でアプリ名、非 global 項目、consumer section、
通常クリックと picking、Escape、変更と reset を確認。既存 runtime suite、型・lint、
package build と tarball 導入検査を維持する。表示は site の実ブラウザでも検証する。

## やってはいけない

- scopeLabel を DOM root の制限と読み替え、global CSS の影響を局所と表示しない。
- 変更一覧を「全操作の履歴」と呼ばない。
- R03 登録所有権・R05 Target 同期・R07 DOM scope の未完改善を完了扱いしない。

## Status log

- 2026-10-05: Chrome desktop / mobile で操作と表示を確認。旧 site の34ページに残った Provider / Layer 二重化を解消。runtime 406件・component 18件、35 exports の fresh / locked install を検証。
- 2026-10-05: アプリ共通パネル、明示 picking、差分確認を追加。R03 の WIP テストは別ブランチに保持。

- 2026-10-05: PR #173 / #174 を通して main に統合。editor-host-v0.9.0（6aa36a2）として release cut。
