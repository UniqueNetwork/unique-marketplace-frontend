import { gql } from '@apollo/client';
const getLatestBlocksQuery = gql`
query GetLatestBlocks($limit: Int, $offset: Int) {
  view_last_block(limit: $limit, offset: $offset, order_by: { block_number: desc }) {
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
  order_by: string;
  order: 'asc' | 'desc';
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