import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/client'
import App from './App'
import client from './api/client'
import Api from './Api'

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <Api>
        <App />
      </Api>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
