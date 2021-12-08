import { gql } from '@apollo/client';
const exampleBlocks = gql`
query ExampleGetBlocks {
  block(limit: 10) {
    timestamp
    block_number
    block_hash
    extrinsics_root
    total_events
  }
}
`
interface Block {
  timestamp: number,
  extrinsics_root: number,
  block_hash: string,
  block_number: number,
  total_events: number
}
interface Data {
  block: Block[]
}
export type {
  Data,
  Block
}
export {
  exampleBlocks
}