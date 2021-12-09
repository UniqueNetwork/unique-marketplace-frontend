import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { store } from './store'
import { Provider } from 'react-redux'
import { ApolloProvider } from '@apollo/client'
import client from './api/graphQL/client'

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
