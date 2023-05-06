import { gql, useQuery } from '@apollo/client';

import { Token } from './types';

const TOKENS_QUERY = gql`
  query tokens_query(
    $collectionId: Int
    $tokenId: Int
  ) {
    tokens(where: { collection_id: { _eq: $collectionId }, token_id: { _eq: $tokenId } }, offset: 0, limit: 1) {
      token {
        token_id
        token_name
        collection_name
        collection_id
        image
        type
        children_count
        parent_id
        nested
        total_pieces
        owner
        tokens_owner
        tokens_amount
      }
    }
  }
`;

export const useGqlGetToken = (collectionId: number | undefined, tokenId: number | undefined) => {
  const { data } = useQuery<{ token: Token[] }>(TOKENS_QUERY, {
    skip: !collectionId || !tokenId,
    variables: {
      collectionId,
      tokenId
    },
    returnPartialData: true,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true
  });
  return data?.token[0];
};
