// R02: standard AST rendering must work without the old parser runtime.
import { render } from 'solid-js/web'
import { expect, test } from 'vitest'
import { renderNode } from '../../packages/md-view/src/render'

test('renderNode accepts standard mdast and renders semantic elements', () => {
  const container = document.createElement('div')
  const dispose = render(
    () =>
      renderNode({
        type: 'root',
        children: [{ type: 'heading', depth: 2, children: [{ type: 'text', value: 'Portable' }] }],
      }),
    container,
  )
  try {
    expect(container.querySelector('h2')?.textContent).toBe('Portable')
  } finally {
    dispose()
  }
})
