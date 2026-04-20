# Contributing to Creo UI

## Token 追加・変更フロー (Phase 1 以降)

1. **SSOT は `tokens/` 配下の JSON のみ**。platform 別 output には直接触れない。
2. Issue を Linear で起票 (team: Creo Memories, label: `ui-design-system`)。
3. branch を `mako/creo-XX-token-...` 形式で切る。
4. `tokens/<category>/<file>.json` を編集。DTCG 準拠を維持。
5. `bun run build` で全 platform の output を再生成。
6. `bun run typecheck && bun run lint` を通す。
7. PR を作成。description に Linear Issue URL を記載。
8. Breaking change (既存 token の rename / 削除) は必ず changelog に明記。

## Phase 0 時点

まだ token の中身が無いため、このドキュメントは skeleton。Phase 1 で具体的な flow (Style Dictionary の dry-run diff、visual regression 等) を詰める。

## License

コントリビュートされた変更は Apache-2.0 でライセンスされる。
