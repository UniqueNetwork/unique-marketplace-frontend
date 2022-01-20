import { Transfer } from '../transfers/types'

export interface EventsForBlockVariables {
  limit: number
  offset: number
  order_by?: { [name: string]: 'asc' | 'desc' }
  where?: { [key: string]: any }
}

export interface EventsForBlockTransfer {
  timestamp: null | number
  method: string
  event_index: number
}

export interface EventsForBlockData {
  event: Transfer[]
  event_aggregate: {
    aggregate: {
      count: number
    }
  }
}
