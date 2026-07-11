import { render } from 'solid-js/web'
import '@chronista-club/creo-ui/tokens.css'
import '@chronista-club/creo-ui/components.css'
import 'creo-ui-md-view/styles.css'
import './styles/docs.css'
import App from './App'

const root = document.getElementById('root')
if (!root) {
  throw new Error('root element not found')
}

render(() => <App />, root)
