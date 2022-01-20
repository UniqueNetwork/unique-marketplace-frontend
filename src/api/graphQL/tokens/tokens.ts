import { gql, useQuery } from '@apollo/client'
import { useCallback } from 'react'
import { FetchMoreTokensOptions, TokensData, TokensVariables, useGraphQlTokensProps } from './types'

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
`
export const useGraphQlTokens = ({ pageSize, filter }: useGraphQlTokensProps) => {
  const getWhere = useCallback(
    (searchString?: string) => ({
      _and: {
        ...(filter ? { _or: filter } : {}),
        ...(searchString
          ? {
              collection: {
                _or: {
                  name: { _ilike: searchString },
                  description: { _ilike: searchString },
                  token_prefix: { _ilike: searchString },
                },
              },
            }
          : {}),
      },
    }),
    [filter]
  )

  const {
    fetchMore,
    loading: isTokensFetching,
    error: fetchTokensError,
    data,
  } = useQuery<TokensData, TokensVariables>(tokensQuery, {
    variables: {
      limit: pageSize,
      offset: 0,
      where: getWhere(),
    },
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  })

  const fetchMoreTokens = useCallback(
    ({ limit = pageSize, offset, searchString }: FetchMoreTokensOptions) => {
      return fetchMore({
        variables: {
          limit,
          offset,
          where: getWhere(searchString),
        },
      })
    },
    [fetchMore, filter, pageSize]
  )

  return {
    fetchMoreTokens,
    tokens: data?.tokens,
    tokensCount: data?.tokens_aggregate.aggregate.count || 0,
    isTokensFetching,
    fetchTokensError,
  }
}

export { tokensQuery }
