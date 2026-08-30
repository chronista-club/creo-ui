import type { JSX } from 'solid-js'
import Footer from './Footer'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout(props: { children?: JSX.Element }) {
  return (
    <div class="cu-col docs-shell">
      <Header />
      <div class="cu-row docs-body">
        <Sidebar />
        <main class="cu-col docs-main">
          <article class="docs-article">{props.children}</article>
          <Footer />
        </main>
      </div>
    </div>
  )
}
