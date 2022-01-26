import { gql, useQuery } from '@apollo/client';
import { useCallback } from 'react';
import { FetchMoreTokensOptions, TokensData, TokensVariables, useGraphQlTokensProps } from './types';

const tokensQuery = gql`
  query getTokens($limit: Int, $offset: Int, $where: tokens_bool_exp = {}) {
    tokens(where: $where, limit: $limit, offset: $offset) {
      id
      token_id
      collection_id
      data
      owner
      collection {
        name
        token_prefix
      }
    }
    tokens_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export const useGraphQlTokens = ({ filter, pageSize }: useGraphQlTokensProps) => {
  const getWhere = useCallback(
    (searchString?: string) => ({
      _and: {
        ...(filter ? { _or: filter } : {}),
        ...(searchString
          ? {
            collection: {
              _or: {
                description: { _ilike: searchString },
                name: { _ilike: searchString },
                token_prefix: { _ilike: searchString }
              }
            }
          }
          : {})
      }
    }),
    [filter]
  );

  const { data,
    error: fetchTokensError,
    fetchMore,
    loading: isTokensFetching } = useQuery<TokensData, TokensVariables>(tokensQuery, {
      fetchPolicy: 'network-only',
      // Used for first execution
      nextFetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
      variables: {
        limit: pageSize,
        offset: 0,
        where: getWhere()
      }
    });

  const fetchMoreTokens = useCallback(
    ({ limit = pageSize, offset, searchString }: FetchMoreTokensOptions) => {
      return fetchMore({
        variables: {
          limit,
          offset,
          where: getWhere(searchString)
        }
      });
    },
    [fetchMore, getWhere, pageSize]
  );

  return {
    fetchMoreTokens,
    fetchTokensError,
    isTokensFetching,
    tokens: data?.tokens,
    tokensCount: data?.tokens_aggregate.aggregate.count || 0
  };
};

export { tokensQuery };
