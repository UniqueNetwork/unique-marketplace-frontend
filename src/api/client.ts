import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import chains, { defaultChain } from '../chains'

const client = new ApolloClient({
  link: new HttpLink({ uri: chains[defaultChain].clientEndpoint }),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          view_last_block: {
            // Don't client separate results based on
            // any of this field's arguments.
            keyArgs: false,
            merge(existing = [], incoming) {
              return [...incoming]
            },
          },
          view_last_block_aggregate: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return incoming
            },
          },
          view_last_transfers: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return [...incoming]
            },
          },
          collections: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return [...incoming]
            },
          },
          view_extrinsic: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return [...incoming]
            },
          },
          view_extrinsic_aggregate: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
})

export default client
