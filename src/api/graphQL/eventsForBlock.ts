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

interface Variables {
  limit: number
  offset: number
  order_by?: { [name: string]: 'asc' | 'desc' }
  where?: { [key: string]: any }
}

interface Transfer {
  timestamp: null | number
  method: string
  event_index: number
}

interface Data {
  event: Transfer[]
  event_aggregate: {
    aggregate: {
      count: number
    }
  }
}

export type { Variables, Transfer, Data }
export { getEventsQuery }
