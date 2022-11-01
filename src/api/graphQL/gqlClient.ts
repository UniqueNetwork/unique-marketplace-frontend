import { ApolloClient, HttpLink, NormalizedCacheObject } from '@apollo/client';

import { getApolloClient } from './apolloClient';

export interface IGqlClient {
  client: ApolloClient<NormalizedCacheObject>;
  changeEndpoint(endpoint: string): void;
}

export class GqlClient implements IGqlClient {
  public client: ApolloClient<NormalizedCacheObject>;

  constructor(gqlEndpoint: string) {
    this.client = getApolloClient(gqlEndpoint);
  }

  public changeEndpoint(gqlEndpoint: string) {
    this.client.setLink(new HttpLink({ uri: gqlEndpoint }));
    void this.client.refetchQueries({ include: 'all' });
  }
}
