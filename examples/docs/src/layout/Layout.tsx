import type { JSX } from 'solid-js'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function Layout(props: { children?: JSX.Element }) {
  return (
    <div class="docs-shell">
      <Header />
      <div class="docs-body">
        <Sidebar />
        <main class="docs-main">
          <article class="docs-article">{props.children}</article>
          <Footer />
        </main>
      </div>
    </div>
  )
}
