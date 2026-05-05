/**
 * mdast → SolidJS JSX renderer.
 *
 * Walks the MdNode tree and emits Solid VDOM. Each node type maps to a
 * semantic HTML element with creo-md class hooks for styling.
 *
 * - Frontmatter is hidden (consumer reads via CreoMarkdownProps.onAst).
 * - Html is rendered with innerHTML — consumer is responsible for sanitization.
 * - Mermaid code blocks (lang="mermaid") render as <pre> placeholder until
 *   creo-views/mermaid Phase 0.2 lands.
 */

import type { MdNode } from 'creo-views/md'
import { For, type JSX } from 'solid-js'

export function renderNode(node: MdNode): JSX.Element {
  switch (node.type) {
    case 'Root':
      return <For each={node.children}>{(child) => renderNode(child)}</For>

    case 'Heading': {
      const children = <For each={node.children}>{(c) => renderNode(c)}</For>
      switch (node.depth) {
        case 1:
          return <h1>{children}</h1>
        case 2:
          return <h2>{children}</h2>
        case 3:
          return <h3>{children}</h3>
        case 4:
          return <h4>{children}</h4>
        case 5:
          return <h5>{children}</h5>
        default:
          return <h6>{children}</h6>
      }
    }

    case 'Paragraph':
      return (
        <p>
          <For each={node.children}>{(c) => renderNode(c)}</For>
        </p>
      )

    case 'Text':
      return node.value

    case 'Strong':
      return (
        <strong>
          <For each={node.children}>{(c) => renderNode(c)}</For>
        </strong>
      )

    case 'Emphasis':
      return (
        <em>
          <For each={node.children}>{(c) => renderNode(c)}</For>
        </em>
      )

    case 'Delete':
      return (
        <del>
          <For each={node.children}>{(c) => renderNode(c)}</For>
        </del>
      )

    case 'InlineCode':
      return <code class="creo-md-inline-code">{node.value}</code>

    case 'Code': {
      // Mermaid block → placeholder (Phase 0.1)
      if (node.lang === 'mermaid') {
        return (
          <div class="creo-md-mermaid-placeholder" data-lang="mermaid">
            <div class="creo-md-mermaid-placeholder-label">
              Mermaid diagram (renderer coming in 0.2)
            </div>
            <pre>
              <code>{node.value}</code>
            </pre>
          </div>
        )
      }
      return (
        <pre class="creo-md-code">
          <code data-lang={node.lang ?? undefined}>{node.value}</code>
        </pre>
      )
    }

    case 'Link':
      return (
        <a href={node.url} title={node.title ?? undefined}>
          <For each={node.children}>{(c) => renderNode(c)}</For>
        </a>
      )

    case 'Image':
      return (
        <img src={node.url} alt={node.alt ?? ''} title={node.title ?? undefined} loading="lazy" />
      )

    case 'BlockQuote':
      return (
        <blockquote>
          <For each={node.children}>{(c) => renderNode(c)}</For>
        </blockquote>
      )

    case 'List': {
      const children = <For each={node.children}>{(c) => renderNode(c)}</For>
      return node.ordered ? (
        <ol start={node.start ?? undefined}>{children}</ol>
      ) : (
        <ul>{children}</ul>
      )
    }

    case 'ListItem': {
      const inner = <For each={node.children}>{(c) => renderNode(c)}</For>
      // GFM task list — checked is null for non-task items
      if (node.checked !== null) {
        return (
          <li class={`creo-md-task ${node.checked ? 'checked' : ''}`}>
            <input type="checkbox" checked={node.checked} disabled />
            {inner}
          </li>
        )
      }
      return <li>{inner}</li>
    }

    case 'ThematicBreak':
      return <hr />

    case 'Break':
      return <br />

    case 'Table': {
      const align = node.align
      const rows = node.children
      const headRow = rows[0]
      const bodyRows = rows.slice(1)
      const alignStyle = (i: number): string | undefined => {
        const a = align[i]
        return a && a !== 'None' ? `text-align: ${a.toLowerCase()}` : undefined
      }
      return (
        <table class="creo-md-table">
          {headRow?.type === 'TableRow' && (
            <thead>
              <tr>
                <For each={headRow.children}>
                  {(cell, i) =>
                    cell.type === 'TableCell' ? (
                      <th style={alignStyle(i())}>
                        <For each={cell.children}>{(c) => renderNode(c)}</For>
                      </th>
                    ) : null
                  }
                </For>
              </tr>
            </thead>
          )}
          <tbody>
            <For each={bodyRows}>
              {(row) =>
                row.type === 'TableRow' ? (
                  <tr>
                    <For each={row.children}>
                      {(cell, i) =>
                        cell.type === 'TableCell' ? (
                          <td style={alignStyle(i())}>
                            <For each={cell.children}>{(c) => renderNode(c)}</For>
                          </td>
                        ) : null
                      }
                    </For>
                  </tr>
                ) : null
              }
            </For>
          </tbody>
        </table>
      )
    }

    case 'TableRow':
    case 'TableCell':
      // Handled inside the Table case — should not be rendered standalone.
      return null

    case 'Html':
      // Raw HTML — consumer must sanitize before passing to <CreoMarkdown>.
      return <span class="creo-md-html-raw" innerHTML={node.value} />

    case 'Frontmatter':
      // Hidden in render output; consumer reads via onAst hook.
      return null

    case 'Admonition':
      return (
        <div class="creo-md-admonition" data-kind={node.kind}>
          {node.title && <div class="creo-md-admonition-title">{node.title}</div>}
          <div class="creo-md-admonition-body">
            <For each={node.children}>{(c) => renderNode(c)}</For>
          </div>
        </div>
      )

    case 'WikiLink':
      return (
        <a class="creo-md-wikilink" data-link-type={node.link_type} href={`#${node.target}`}>
          {node.label ?? node.target}
        </a>
      )

    default: {
      // Exhaustive check — TypeScript flags this if a new node variant is added
      // upstream and not handled here.
      const _exhaustive: never = node
      void _exhaustive
      return null
    }
  }
}
