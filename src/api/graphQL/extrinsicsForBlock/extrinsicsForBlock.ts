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

export { getExtrinsicsQuery }
