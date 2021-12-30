import { gql, useApolloClient, useQuery } from '@apollo/client'
import { useCallback, useEffect } from 'react'

const getLatestBlocksQuery = gql`
  query GetLatestBlocks(
    $limit: Int
    $offset: Int
    $order_by: [view_last_block_order_by]
    $where: view_last_block_bool_exp
  ) {
    view_last_block(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
      block_number
      event_count
      extrinsic_count
      timestamp
    }
    view_last_block_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`

interface Variables {
  limit: number
  offset: number
  order_by?: { [name: string]: 'asc' | 'desc' }
  where?: { [key: string]: any }
}

interface Block {
  timestamp: number
  block_number: number
  event_count: number
  extrinsic_count: number
}
interface Data {
  view_last_block: Block[]
  view_last_block_aggregate: {
    aggregate: {
      count: number // total number of blocks, used for pagination
    }
  }
}
export type { Variables, Data, Block }

export type useGraphQlBlocksProps = {
  pageSize: number
}

export type FetchMoreBlocksOptions = {
  limit?: number
  offset?: number
  searchString?: string
}

export const useGraphQlBlocks = ({ pageSize }: useGraphQlBlocksProps) => {
  const client = useApolloClient()

  const {
    fetchMore,
    data,
    loading: isBlocksFetching,
    error: fetchBlocksError,
  } = useQuery<Data, Variables>(getLatestBlocksQuery, {
    variables: { limit: pageSize, offset: 0, order_by: { block_number: 'desc' } },
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  })

  useEffect(() => {
    fetchMore({})
  }, [client.link, fetchMore])

  const fetchMoreBlocks = useCallback(
    ({ limit = pageSize, offset, searchString }: FetchMoreBlocksOptions) => {
      return fetchMore({
        variables: {
          limit,
          offset,
          where:
            (searchString &&
              searchString.length > 0 && {
                _or: [
                  {
                    block_number: { _eq: searchString },
                  },
                ],
              }) ||
            undefined,
        },
      })
    },
    [fetchMore, pageSize]
  )

  return {
    fetchMoreBlocks,
    blocks: data?.view_last_block,
    blockCount: data?.view_last_block_aggregate.aggregate.count || 0,
    isBlocksFetching,
    fetchBlocksError,
  }
}

export { getLatestBlocksQuery }
