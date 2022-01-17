import { gql, useApolloClient, useQuery } from '@apollo/client'
import { useCallback } from 'react'

const collectionsQuery = gql`
  query getCollections($limit: Int, $offset: Int, $where: collections_bool_exp = {}) {
    collections(where: $where, limit: $limit, offset: $offset) {
      collection_id
      description
      name
      owner
      token_prefix
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

interface Variables {
  limit: number
  offset: number
  where?: Record<string, any>
}

interface Collection {
  collection_id: number
  description: string
  name: string
  owner: string
  token_prefix: string
  tokens_aggregate: {
    aggregate: {
      count: number
    }
  }
}

interface Data {
  collections: Collection[]
  collections_aggregate: {
    aggregate: {
      count: number
    }
  }
}

export type { Variables, Collection, Data }

export type useGraphQlCollectionsProps = {
  pageSize: number
  filter?: Record<string, any>
}

export type FetchMoreCollectionsOptions = {
  limit?: number
  offset?: number
  searchString?: string
}

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
  } = useQuery<Data, Variables>(collectionsQuery, {
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
