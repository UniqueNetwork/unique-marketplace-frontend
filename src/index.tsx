import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { store } from './store'
import { Provider } from 'react-redux'
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client'

const client = new ApolloClient({
  uri: 'https://dev-api-explorer.unique.network/v1/graphql',
  cache: new InMemoryCache(),
})

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
