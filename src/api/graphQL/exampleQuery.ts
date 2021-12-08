import { gql } from '@apollo/client';
const exampleBlocks = gql`
query ExampleGetBlocks {
  block(limit: 50) {
    block_author
    block_author_name
    is_epoch
    state_root
    block_hash
    block_number
    num_transfers
  }
}
`
interface Block {
  block_author: string,
  block_author_name: string,
  is_epoch: boolean,
  state_root: string,
  block_hash: string,
  block_number: number,
  num_trasfers: number
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