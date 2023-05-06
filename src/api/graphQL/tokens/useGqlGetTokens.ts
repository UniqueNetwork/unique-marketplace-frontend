import { gql, useQuery } from '@apollo/client';

import { QueryResponse } from '../types';
import { Token, useGqlGetTokensProps } from './types';

const TOKENS_QUERY = gql`
  query tokens_query(
    $where: TokenWhereParams
    $offset: Int
    $limit: Int
    $order_by: TokenOrderByParams
  ) {
    tokens(where: $where, offset: $offset, limit: $limit, order_by: $order_by) {
      count
      tokens {
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

export const useGqlGetTokens = ({ skip, variables }: useGqlGetTokensProps) => {
  return useQuery<QueryResponse<Token, 'tokens'>>(TOKENS_QUERY, {
    skip,
    variables,
    returnPartialData: true,
    context: { tokens: [], count: 0 },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true
  });
};
