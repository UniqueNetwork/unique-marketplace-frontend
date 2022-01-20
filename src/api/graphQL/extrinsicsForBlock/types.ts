export interface ExtrinsicForBlockVariables {
  limit: number
  offset: number
  order_by?: { [name: string]: 'asc' | 'desc' }
  where?: { [key: string]: any }
}

export interface ExtrinsicForBlockTransfer {
  timestamp: null | number
  hash: string
  method: string
  block_index: string
}

export interface ExtrinsicForBlockData {
  view_extrinsic: ExtrinsicForBlockTransfer[]
  view_extrinsic_aggregate: {
    aggregate: {
      count: number
    }
  }
}
