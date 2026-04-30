import { render } from 'solid-js/web'
import 'creo-ui-web/tokens.css'
import 'creo-ui-web/components.css'
import 'creo-ui-md-view/styles.css'
import './styles/docs.css'
import App from './App'

const root = document.getElementById('root')
if (!root) {
  throw new Error('root element not found')
}

render(() => <App />, root)
