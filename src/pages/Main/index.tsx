import React, { useCallback } from 'react'
import { useQuery } from '@apollo/client'
import Table from 'rc-table'
import PaginationComponent from '../../components/Pagination'
import { timeDifference } from '../../utils/timestampUtils'
import {
  getLatestBlocksQuery,
  Data as BlocksData,
  Variables as BlocksVariables,
  Block,
} from '../../api/graphQL/Block'

const columns = [
  {
    title: 'Block',
    dataIndex: 'block_number',
    key: 'block_number',
    width: 400,
  },
  { title: 'Block number', dataIndex: 'block_number', key: 'block_number', width: 100 },
  // Age is calculated from timestamp aftter query execution
  { title: 'Age', dataIndex: 'time_difference', key: 'time_difference', width: 201 },
  { title: 'Extrinsic', dataIndex: 'extrinsic_count', key: 'extrinsic_count', width: 100 },
  { title: 'Event', dataIndex: 'event_count', key: 'event_count', width: 50 },
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
  } = useQuery<BlocksData, BlocksVariables>(getLatestBlocksQuery, {
    variables: { limit: pageSize, offset: 0, order_by: { block_number: 'desc' } },
  })

  const onPageChange = useCallback(
    (limit: number, offset: number) => fetchMore({ variables: { limit, offset } }),
    [fetchMore]
  )

  return (
    <div>
      <span>Is fetching: {!!isBlocksFetching ? 'yes' : 'finished'}</span>
      <span>Total number of blocks: {blocks?.view_last_block_aggregate.aggregate.count}</span>
      <br />
      <Table
        columns={columns}
        data={blocksWithTimeDifference(blocks?.view_last_block)}
        rowKey={'block_number'}
      />
      <PaginationComponent
        pageSize={pageSize}
        count={blocks?.view_last_block_aggregate?.aggregate?.count || 0}
        onPageChange={onPageChange}
      />
    </div>
  )
}

export default MainPage
