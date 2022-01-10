import { gql, useApolloClient, useQuery } from '@apollo/client'
import { useCallback, useEffect } from 'react'
import { FetchMoreBlocksOptions } from './block'

const getLastTransfersQuery = gql`
  query getLastTransfers($limit: Int, $offset: Int, $where: view_extrinsic_bool_exp = {}) {
    view_extrinsic(limit: $limit, offset: $offset, order_by: { timestamp: desc }, where: $where) {
      block_number
      block_index
      amount
      fee
      from_owner
      hash
      success
      timestamp
      to_owner
    }
    view_extrinsic_aggregate(where: $where) {
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

interface Transfer {
  block_number: number
  block_index: string
  amount: number
  fee: number
  from_owner: string
  hash: string
  success: boolean
  timestamp: number | null
  to_owner: string
}

interface Data {
  view_extrinsic: Transfer[]
  view_extrinsic_aggregate: {
    aggregate: {
      count: number
    }
  }
}

export type { Variables, Transfer, Data }

export type useGraphQlLastTransfersProps = {
  pageSize: number
  accountId?: string
}

export const useGraphQlLastTransfers = ({ pageSize, accountId }: useGraphQlLastTransfersProps) => {
  const client = useApolloClient()

  const getWhere = useCallback(
    (searchString?: string) => ({
      _and: {
        amount: { _neq: '0' },
        ...(accountId
          ? {
              _or: [{ from_owner: { _eq: accountId } }, { to_owner: { _eq: accountId } }],
            }
          : {}),
        ...(searchString
          ? {
              _or: {
                block_index: { _eq: searchString },
                from_owner: { _eq: searchString },
                to_owner: { _eq: searchString },
              },
            }
          : {}),
      },
    }),
    [accountId]
  )

  const {
    fetchMore,
    loading: isTransfersFetching,
    error: fetchTransfersError,
    data,
  } = useQuery<Data, Variables>(getLastTransfersQuery, {
    variables: {
      limit: pageSize,
      offset: 0,
      where: getWhere(),
    },
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  })

  useEffect(() => {
    fetchMore({})
  }, [client.link, fetchMore])

  const fetchMoreTransfers = useCallback(
    ({ limit = pageSize, offset, searchString }: FetchMoreBlocksOptions) => {
      return fetchMore({
        variables: {
          limit,
          offset,
          where: getWhere(searchString),
        },
      })
    },
    [fetchMore, accountId, pageSize]
  )

  return {
    fetchMoreTransfers,
    transfers: data?.view_extrinsic,
    transfersCount: data?.view_extrinsic_aggregate.aggregate.count || 0,
    isTransfersFetching,
    fetchTransfersError,
  }
}

export { getLastTransfersQuery }
