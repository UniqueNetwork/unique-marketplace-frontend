import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export const getApolloClient = (clientEndpoint: string) =>
  new ApolloClient({
    // Hands off! Don't touch the caching policy unless you know exactly why you want it.
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: clientEndpoint })
  });
