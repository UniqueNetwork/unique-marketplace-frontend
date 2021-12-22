import { gql } from '@apollo/client'

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
export { getLastTransfersQuery }
