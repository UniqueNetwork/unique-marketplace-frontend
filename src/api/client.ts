import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        view_last_block: {
          // Don't cache separate results based on
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
})


const client = new ApolloClient({
  //uri: config.API_URL,
  //link,
  cache
})

export { cache }

export default client
