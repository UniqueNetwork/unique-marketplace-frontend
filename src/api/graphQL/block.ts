import { gql } from '@apollo/client';

const getLatestBlocksQuery = gql`
query GetLatestBlocks($limit: Int, $offset: Int, $order_by: [view_last_block_order_by], $where: view_last_block_bool_exp) {
  view_last_block(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
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
  order_by?: { [name: string]: 'asc' | 'desc' }
  where?: { [key: string]: any }
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