/**
 * Ambient declaration stub for `creo-ui-md-view` (sibling-repo `creo-views` 経由
 * の WASM mdast parser に依存)。
 *
 * 設計判断: `examples/docs` の typecheck は **editor-host API drift catch** が
 * 主目的。 md-view の type drift は `packages/md-view/` 自身の typecheck で
 * catch するべきで、 ここでは public API surface のみ stub 化することで CI 上の
 * sibling-repo WASM 取得問題 (creo-views の `src/{md,mermaid}/wasm/` が
 * gitignored、 sibling checkout で取得不能) を回避する。
 *
 * もし `CreoMarkdown` の真の signature が変更された場合は packages/md-view 側で
 * catch される (root tsconfig は packages/* を include)、 ここの stub と
 * divergence しても drift detector としての主目的は維持される。
 */
declare module 'creo-ui-md-view' {
  import type { JSX } from 'solid-js'

  export const CreoMarkdown: (props: {
    text: string
    class?: string
    /** Element shown while parsing (default: nothing). */
    loading?: JSX.Element
    /** Render override on parse error. Error is passed as a string. */
    fallback?: (err: string) => JSX.Element
    /** Lifecycle hook — receives the parsed AST. */
    onAst?: (ast: unknown) => void
  }) => JSX.Element
}

declare module 'creo-ui-md-view/styles.css'
