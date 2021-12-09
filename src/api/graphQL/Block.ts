import { gql } from '@apollo/client';
type OrderBy = {
  [name: string]: 'asc' | 'desc'
}
const getLatestBlocksQuery = gql`
query GetLatestBlocks($limit: Int, $offset: Int, $order_by: [view_last_block_order_by!]) {
  view_last_block(limit: $limit, offset: $offset, order_by: $order_by) {
    block_number
    event_count
    extrinsic_count
    timestamp
  }
  view_last_block_aggregate {
    aggregate {
      count
    }
  }
}
`

interface Variables {
  limit: number;
  offset: number;
  order_by: OrderBy
}
interface Block {
  timestamp: number;
  block_number: number;
  event_count: number;
  extrinsic_count: number;
}
interface Data {
  view_last_block: Block[];
  view_last_block_aggregate: {
    aggregate: {
      count: number; // total number of blocks, used for pagination
    }
  }
}
export type {
  Variables,
  Data,
  Block
}
export {
  getLatestBlocksQuery
}