import { gql } from '@apollo/client'

const getBlockQuery = gql`
  query getBlockDetails($block_number: bigint!) {
    block(where: {block_number: {_eq: $block_number}}) {
      timestamp
      total_events
      spec_version
      block_hash,
      parent_hash,
      extrinsics_root,
      state_root
    }
  }
`


interface Variables {
  block_number: string
}

interface Block {
  timestamp: number
  total_events: number
  spec_version: number
  block_hash: string,
  parent_hash: string
  extrinsics_root: string,
  state_root: string
}

interface Data {
  block: Block[]
}

export type { Variables, Data }
export { getBlockQuery }


// view_last_block: Block[]
