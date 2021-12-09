import { ApolloClient, InMemoryCache, } from '@apollo/client'

const client = new ApolloClient({
  uri: 'https://dev-api-explorer.unique.network/v1/graphql',
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
        },
      },
    },
  }),
})

export default client;