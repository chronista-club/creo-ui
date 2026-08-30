import { render } from 'solid-js/web'
import '@chronista-club/creo-ui/tokens.css'
import '@chronista-club/creo-ui/components.css'
import '@chronista-club/creo-ui/utilities.css'
import 'creo-ui-md-view/styles.css'
import './styles/docs.css'
import App from './App'

if (import.meta.env.DEV) {
  // dev 専用: 手元 Claude → editor パネルへ op を流す agent bridge を読み込む
  import('./dev/agent-bridge')
}

const root = document.getElementById('root')
if (!root) {
  throw new Error('root element not found')
}

render(() => <App />, root)
