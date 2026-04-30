# creo-ui-md-view

> SolidJS Markdown renderer for Creo UI. Consumes [`creo-views/md`](https://github.com/chronista-club/creo-views) (WASM-backed mdast parser).

## Install

```sh
bun add creo-ui-md-view solid-js
```

## Usage

```tsx
import { CreoMarkdown } from 'creo-ui-md-view'
import 'creo-ui-md-view/styles.css'

const text = `
# Hello

This is **markdown** with [links](https://example.com).

- list item 1
- list item 2

\`\`\`ts
const greeting = 'world'
\`\`\`
`

export const App = () => <CreoMarkdown text={text} />
```

## Supported nodes

| Node | Element |
|---|---|
| Root | fragment |
| Heading (1-6) | `<h1>`–`<h6>` |
| Paragraph | `<p>` |
| Text | text node |
| Strong | `<strong>` |
| Emphasis | `<em>` |
| Delete | `<del>` |
| InlineCode | `<code>` |
| Code (block) | `<pre><code data-lang>` |
| Link | `<a>` |
| Image | `<img>` |
| List + ListItem | `<ul>` / `<ol>` / `<li>` (incl. GFM checklist) |
| BlockQuote | `<blockquote>` |
| ThematicBreak | `<hr>` |
| Break | `<br>` |
| Table + Row + Cell | `<table>` / `<thead>` / `<tbody>` / `<tr>` / `<th>` / `<td>` (with align) |
| Frontmatter | hidden (consumer reads via `onAst` prop) |
| Admonition | `<div class="creo-md-admonition" data-kind>` |
| WikiLink | `<a class="creo-md-wikilink" data-link-type>` |
| Html | `innerHTML` (consumer-side sanitization required) |

## Mermaid blocks

Code blocks with `lang="mermaid"` are detected. Phase 0.1 renders them as a placeholder; Phase 0.2 will plug in `creo-views/mermaid` for live SVG.

## Props

| prop | type | default |
|---|---|---|
| `text` | `string` | required |
| `class` | `string` | — |
| `loading` | `JSX.Element` | `null` |
| `fallback` | `(err: string) => JSX.Element` | inline error |
| `onAst` | `(ast: MdNode) => void` | — (lifecycle hook for frontmatter etc.) |

## Status

Phase 0.1 — covers all top-level mdast nodes. Mermaid SVG and Html sanitization are placeholders.
