import React, { useCallback } from 'react'
import { useQuery } from '@apollo/client'
import Table from 'rc-table'
import PaginationComponent from '../../components/Pagination'
import { timeDifference } from '../../utils/timestampUtils'
import {
  exampleBlocksQuery,
  Data as BlocksData,
  Variables as BlocksVariables,
  Block,
} from '../../api/graphQL/exampleQuery'

const columns = [
  {
    title: 'Block hash',
    dataIndex: 'block_hash',
    key: 'block_hash',
    width: 400,
  },
  { title: 'Block number', dataIndex: 'block_number', key: 'block_number', width: 10 },
  { title: 'Timestamp', dataIndex: 'time_difference', key: 'time_difference', width: 10 },
  { title: 'Extrinsic', dataIndex: 'extrinsics_root', key: 'extrinsics_root', width: 400 },
  { title: 'Event', dataIndex: 'total_events', key: 'total_events', width: 10 },
]

const blocksWithTimeDifference = (blocks: Block[] | undefined): Block[] => {
  if (!blocks) return []
  return blocks.map(
    (block: Block) => ({ ...block, time_difference: timeDifference(block.timestamp) } as Block)
  )
}

const MainPage = () => {
  const pageSize = 10 // default
  const {
    fetchMore,
    loading: isBlocksFetching,
    error: fetchBlocksError,
    data: blocks,
  } = useQuery<BlocksData, BlocksVariables>(exampleBlocksQuery, {
    variables: { limit: pageSize, offset: 0 },
  })

  const onPageChange = useCallback(
    (limit: number, offset: number) => fetchMore({ variables: { limit, offset } }),
    [fetchMore]
  )

  return (
    <div>
      <span>Is fetching: {!!isBlocksFetching ? 'yes' : 'finished'}</span>
      <span>Total number of blocks: {blocks?.block_aggregate.aggregate.count}</span>
      <br />
      <Table
        columns={columns}
        data={blocksWithTimeDifference(blocks?.block)}
        rowKey={'block_hash'}
      />
      <PaginationComponent
        pageSize={pageSize}
        count={blocks?.block_aggregate?.aggregate?.count || 0}
        onPageChange={onPageChange}
      />
    </div>
  )
}

export default MainPage
