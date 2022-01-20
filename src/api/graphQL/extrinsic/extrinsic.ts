import { gql, useQuery } from '@apollo/client'
import { ExtrinsicData, ExtrinsicVariables } from './types'

const extrinsicQuery = gql`
  query getExtrinsic($limit: Int, $offset: Int, $block_index: String!) {
    view_extrinsic(
      limit: $limit
      offset: $offset
      where: { block_index: { _eq: $block_index } }
      order_by: { block_number: "desc" }
    ) {
      amount
      block_index
      block_number
      fee
      hash
      success
      timestamp
      from_owner
      to_owner
    }
    view_extrinsic_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`

export { extrinsicQuery }

export const useGraphQlExtrinsic = (blockIndex?: string) => {
  const { loading: isExtrinsicFetching, data } = useQuery<ExtrinsicData, ExtrinsicVariables>(
    extrinsicQuery,
    {
      variables: { block_index: blockIndex || '', limit: 1, offset: 0 },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    }
  )
  return { extrinsic: data?.view_extrinsic[0], isExtrinsicFetching }
}
