import { gql } from '@apollo/client'

const getExtrinsicsQuery = gql`
  query getLastTransfers($limit: Int, $offset: Int, $where: view_extrinsic_bool_exp = {}) {
    view_extrinsic(limit: $limit, offset: $offset, order_by: { timestamp: desc }, where: $where) {
       timestamp
       hash
       method
       block_index
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
  timestamp: null | number
  hash: string
  method: string
  block_index: string
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
export { getExtrinsicsQuery }
