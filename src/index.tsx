import React from 'react'
import ReactDOM from 'react-dom'
// contains gql and rpc with contexts and providers
import ApiWrapper from './api/ApiWrapper'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <ApiWrapper>
      <App />
    </ApiWrapper>
  </React.StrictMode>,
  document.getElementById('root')
)
