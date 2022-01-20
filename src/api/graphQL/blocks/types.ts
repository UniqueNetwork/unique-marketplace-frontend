export interface LastBlock {
  timestamp: number
  block_number: number
  event_count: number
  extrinsic_count: number
}

export interface LastBlocksVariables {
  limit: number
  offset: number
  order_by?: { [name: string]: 'asc' | 'desc' }
  where?: { [key: string]: any }
}

export interface LastBlocksData {
  view_last_block: LastBlock[]
  view_last_block_aggregate: {
    aggregate: {
      count: number // total number of blocks, used for pagination
    }
  }
}

export type useGraphQlBlocksProps = {
  pageSize: number
}

export type FetchMoreBlocksOptions = {
  limit?: number
  offset?: number
  searchString?: string
}
