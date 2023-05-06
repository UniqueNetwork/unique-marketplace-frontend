import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import config from 'config';

export interface IGqlClient {
  changeEndpoint(endpoint: string): void;
}

export class GqlClient implements IGqlClient {
  public client: ApolloClient<NormalizedCacheObject>;

  constructor(chainId: string) {
    this.client = this.getApolloClient(chainId);
  }

  private getApolloClient(chainId: string) {
    const { scanApi } = config.blockchains[chainId.toUpperCase()] || {};
    console.log(chainId, scanApi);

    return new ApolloClient({
      cache: new InMemoryCache({
        typePolicies: {
          view_collections: {
            keyFields: ['collection_id']
          }
        }
      }),
      link: new HttpLink({ uri: scanApi })
    });
  }

  public async changeEndpoint(gqlEndpoint: string) {
    await this.clearCache();
    this.client?.setLink(new HttpLink({ uri: gqlEndpoint }));
  }

  public async clearCache() {
    this.client?.stop(); // terminate all active query processes
    await this.client?.clearStore();
  }
}
