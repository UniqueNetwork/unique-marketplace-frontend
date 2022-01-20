export interface TransfersVariables {
  limit: number
  offset: number
  order_by?: { [name: string]: 'asc' | 'desc' }
  where?: { [key: string]: any }
}

export interface Transfer {
  block_number: number
  block_index: string
  amount: string
  fee: number
  from_owner: string
  hash: string
  success: boolean
  timestamp: number | null
  to_owner: string
}

export interface TransfersData {
  view_extrinsic: Transfer[]
  view_extrinsic_aggregate: {
    aggregate: {
      count: number
    }
  }
}

export type useGraphQlLastTransfersProps = {
  pageSize: number
  accountId?: string
}
