import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import gqlApi from './gqlApi'
import { getChainList, getDefaultChain } from '../../utils/configParser'
import config from '../../config'
import { Chain } from '../chainApi/types'

export interface IGqlClient {
  client: ApolloClient<NormalizedCacheObject>
  api: any
  changeRpcChain(chain: Chain): void
}
// since we are not using infinity load - we want to wipe all the previouse results and get only the new one
const dontCache = () => {
  return {
    // Don't client separate results based on
    // any of this field's arguments.
    keyArgs: false,
    merge(existing = [], incoming: any[]) {
      // aggregations bypass
      if (!incoming?.length) return incoming
      return [...incoming]
    },
  }
}

const getApolloClient = (chain: Chain) =>
  new ApolloClient({
    link: new HttpLink({ uri: chain.clientEndpoint }),
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

export class GqlClient implements IGqlClient {
  public client: ApolloClient<NormalizedCacheObject>
  public api = gqlApi

  constructor(chain: Chain) {
    this.client = getApolloClient(chain)
  }

  public changeRpcChain(chain: Chain) {
    this.client.stop() // terminate all active query processes
    this.client.clearStore().then(() => {
      // resets the entire store by clearing out the cache
      this.client.setLink(new HttpLink({ uri: chain.clientEndpoint }))
    })
  }
}

const chains = getChainList(config)
const defaultChainId = getDefaultChain(config)

const gqlClient = new GqlClient(chains[defaultChainId])

export default gqlClient
