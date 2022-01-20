import { gql } from '@apollo/client'

const getBlockQuery = gql`
  query getBlockDetails($block_number: bigint!) {
    block(where: { block_number: { _eq: $block_number } }) {
      timestamp
      total_events
      spec_version
      block_hash
      parent_hash
      extrinsics_root
      state_root
    }
  }
`

export { getBlockQuery }
