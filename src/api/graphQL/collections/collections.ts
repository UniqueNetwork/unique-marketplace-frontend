import { gql, useApolloClient, useQuery } from '@apollo/client'
import { useCallback } from 'react'
import {
  CollectionsData,
  CollectionsVariables,
  FetchMoreCollectionsOptions,
  useGraphQlCollectionsProps,
} from './types'

const collectionsQuery = gql`
  query getCollections($limit: Int, $offset: Int, $where: collections_bool_exp = {}) {
    collections(where: $where, limit: $limit, offset: $offset) {
      collection_id
      description
      name
      owner
      token_prefix
      offchain_schema
      schema_version
      tokens_aggregate {
        aggregate {
          count
        }
      }
    }
    collections_aggregate {
      aggregate {
        count
      }
    }
  }
`
export const useGraphQlCollections = ({ pageSize, filter }: useGraphQlCollectionsProps) => {
  const client = useApolloClient()

  const getWhere = useCallback(
    (searchString?: string) => ({
      _and: {
        ...(filter ? { _or: filter } : {}),
        ...(searchString
          ? {
              _or: {
                name: { _ilike: searchString },
                description: { _ilike: searchString },
                token_prefix: { _ilike: searchString },
              },
            }
          : {}),
      },
    }),
    [filter]
  )

  const {
    fetchMore,
    loading: isCollectionsFetching,
    error: fetchCollectionsError,
    data,
  } = useQuery<CollectionsData, CollectionsVariables>(collectionsQuery, {
    variables: {
      limit: pageSize,
      offset: 0,
      where: getWhere(),
    },
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  })

  const fetchMoreCollections = useCallback(
    ({ limit = pageSize, offset, searchString }: FetchMoreCollectionsOptions) => {
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
    fetchMoreCollections,
    collections: data?.collections || [],
    collectionsCount: data?.collections_aggregate.aggregate.count || 0,
    isCollectionsFetching,
    fetchCollectionsError,
  }
}

export { collectionsQuery }
