import React from 'react'
import ReactDOM from 'react-dom'
// contains gql and rpc with contexts and providers
import Api from '../src/api/chainApi/ChainApi'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <Api>
      <App />
    </Api>
  </React.StrictMode>,
  document.getElementById('root')
)
