import { gql } from '@apollo/client';
const exampleBlocksQuery = gql`
query ExampleGetBlocks($limit: Int, $offset: Int) {
  block(limit: $limit, offset: $offset) {
    timestamp
    block_number
    block_hash
    extrinsics_root
    total_events
  }
  block_aggregate {
    aggregate {
      count
    }
  }
}
`

interface Variables {
  limit: number;
  offset: number;
}
interface Block {
  timestamp: number,
  extrinsics_root: number,
  block_hash: string,
  block_number: number,
  total_events: number
}
interface Data {
  block: Block[],
  block_aggregate: {
    aggregate: {
      count: number; // total number of enteties in block, can be used to calculate pagination
    }
  }
}
export type {
  Variables,
  Data,
  Block
}
export {
  exampleBlocksQuery
}