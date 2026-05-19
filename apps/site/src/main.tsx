import { render } from 'solid-js/web'
import 'creoui/tokens.css'
import 'creoui/components.css'
import 'creoui-md-view/styles.css'
import './styles/docs.css'
import App from './App'

const root = document.getElementById('root')
if (!root) {
  throw new Error('root element not found')
}

render(() => <App />, root)
