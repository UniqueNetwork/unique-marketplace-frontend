import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import chains, { Chain, defaultChain } from '../../chains'
import gqlApi from './gqlApi';

  // since we are not using infinity load - we want to wipe all the previouse results and get only the new one
const dontCache = () => {
  return {
    // Don't client separate results based on
    // any of this field's arguments.
    keyArgs: false,
    merge(existing = [], incoming: any[]) {
      // aggregations bypass
      console.log(incoming);
      if (!incoming?.length) return incoming;
      return [...incoming]
    },
  }
}

const defaultClient = new ApolloClient({
  link: new HttpLink({ uri: chains[defaultChain].clientEndpoint }),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          view_last_block: dontCache,
          view_last_block_aggregate: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return incoming
            },
          },
          view_last_transfers: dontCache,
          collections: dontCache,
          view_extrinsic: dontCache,
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

export class GqlClient {
  public client: ApolloClient<NormalizedCacheObject>
  public api = gqlApi

  constructor(client: ApolloClient<NormalizedCacheObject> | undefined = undefined) {
    if (client) {
      this.client = client;
      return;
    }
    this.client = defaultClient;
  }

  public changeRpcChain(chain: Chain) {
    this.client.stop() // terminate all active query processes
    this.client.clearStore().then(() => {
      // resets the entire store by clearing out the cache
      this.client.setLink(new HttpLink({ uri: chain.clientEndpoint }))
    })
  }
}

const gqlClient = new GqlClient();

export default gqlClient;
