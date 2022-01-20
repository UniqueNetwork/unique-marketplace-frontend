import { gql } from '@apollo/client'

const getEventsQuery = gql`
  query getLastTransfers($limit: Int, $offset: Int, $where: event_bool_exp = {}) {
    event(limit: $limit, offset: $offset, order_by: { timestamp: desc }, where: $where) {
      timestamp
      event_index
      method
    }
    event_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`
export { getEventsQuery }
