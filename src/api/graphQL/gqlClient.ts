import { ApolloClient, HttpLink, NormalizedCacheObject } from '@apollo/client'
import { getApolloClient } from './apolloClient'
import config from '../../config'

export interface IGqlClient {
  client: ApolloClient<NormalizedCacheObject>
  changeRpcChain(gqlEndpoint: string): void
}

export class GqlClient implements IGqlClient {
  public client: ApolloClient<NormalizedCacheObject>

  constructor(gqlEndpoint: string) {
    this.client = getApolloClient(gqlEndpoint)
  }

  public changeRpcChain(gqlEndpoint: string) {
    this.client.stop() // terminate all active query processes
    this.client.clearStore().then(() => {
      // resets the entire store by clearing out the cache
      this.client.setLink(new HttpLink({ uri: gqlEndpoint }))
    })
  }
}

const gqlClient = new GqlClient(config.defaultChain.gqlEndpoint)

export default gqlClient
