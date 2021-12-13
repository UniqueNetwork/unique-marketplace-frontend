import { ApolloClient, InMemoryCache, } from '@apollo/client'
import config from '../config';

const client = new ApolloClient({
  uri: config.API_URL,
  cache: new InMemoryCache({
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
          view_last_transfers: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return [...incoming]
            },
          }
        },
      },
    },
  }),
})

export default client;