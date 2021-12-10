import React, { useCallback, useState } from 'react'
import { useQuery } from '@apollo/client'
import Table from 'rc-table'
import PaginationComponent from '../../components/Pagination'
import { timeDifference } from '../../utils/timestampUtils'
import {
  getLatestBlocksQuery,
  Data as BlocksData,
  Variables as BlocksVariables,
  Block,
} from '../../api/graphQL/block'
import {
  getLastTransfersQuery,
  Data as TransfersData,
  Variables as TransferVariables,
  Transfer,
} from '../../api/graphQL/transfers'

const blockColumns = [
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

const transferColumns = [
  {
    title: 'Extrinsic',
    dataIndex: 'block_index',
    key: 'block_index',
    width: 400,
  },
  { title: 'Age', dataIndex: 'age', key: 'age', width: 10 },
  { title: 'From', dataIndex: 'from_owner', key: 'from_owner', width: 10 },
  { title: 'To', dataIndex: 'to_owner', key: 'to_owner', width: 400 },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 10 },
]

const blocksWithTimeDifference = (blocks: Block[] | undefined): Block[] => {
  if (!blocks) return []
  return blocks.map(
    (block: Block) => ({ ...block, time_difference: timeDifference(block.timestamp) } as Block)
  )
}

const LastTransfersComponent = () => {}
const LastBlocksComponent = () => {}

const MainPage = () => {
  const pageSize = 10 // default
  const [searchString, setSearchString] = useState('')
  const {
    fetchMore: fetchMoreBlocks,
    loading: isBlocksFetching,
    error: fetchBlocksError,
    data: blocks,
  } = useQuery<BlocksData, BlocksVariables>(getLatestBlocksQuery, {
    variables: { limit: pageSize, offset: 0, order_by: { block_number: 'desc' } },
  })

  const {
    fetchMore: fetchMoreTransfers,
    loading: isTransfersFetching,
    error: fetchTransfersError,
    data: transfers,
  } = useQuery<TransfersData, TransferVariables>(getLastTransfersQuery, {
    variables: { limit: pageSize, offset: 0, order_by: { block_index: 'desc' } },
  })

  const onBlocksPageChange = useCallback(
    (limit: number, offset: number) =>
      fetchMoreBlocks({
        variables: {
          limit,
          offset,
        },
      }),
    [fetchMoreBlocks, searchString]
  )
  const onTransfersPageChange = useCallback(
    (limit: number, offset: number) =>
      fetchMoreTransfers({
        variables: {
          limit,
          offset,
        },
      }),
    [fetchMoreTransfers, searchString]
  )

  const onSearchClick = () => {
    fetchMoreBlocks({
      variables: {
        where:
          (searchString && searchString.length > 0 && { block_number: { _eq: searchString } }) ||
          undefined,
      },
    })
    fetchMoreTransfers({
      variables: {
        where:
          (searchString &&
            searchString.length > 0 && {
              block_index: { _eq: searchString },
              _or: {
                from_owner: { _eq: searchString },
                _or: { to_owner: { _eq: searchString } },
              },
            }) ||
          undefined,
      },
    })
  }
  return (
    <div>
      <span>Is fetching: {!!isBlocksFetching ? 'yes' : 'finished'}</span>
      <span>Total number of blocks: {blocks?.view_last_block_aggregate.aggregate.count}</span>
      <br />
      <input onChange={({ target }) => setSearchString(target.value)} />
      <button type="button" onClick={onSearchClick}>
        SEARCH
      </button>
      {/* TODO: keep in mind - QTZ should be changed to different name based on config */}
      <br />
      <span>Last QTZ transfers</span>
      <Table
        columns={transferColumns}
        data={transfers?.view_last_transfers}
        rowKey={'block_index'}
      />
      <PaginationComponent
        pageSize={pageSize}
        count={transfers?.view_last_transfers_aggregate.aggregate?.count || 0}
        onPageChange={onTransfersPageChange}
      />
      <br />
      <span>Last blocks</span>
      <Table
        columns={blockColumns}
        data={blocksWithTimeDifference(blocks?.view_last_block)}
        rowKey={'block_number'}
      />
      <PaginationComponent
        pageSize={pageSize}
        count={blocks?.view_last_block_aggregate?.aggregate?.count || 0}
        onPageChange={onBlocksPageChange}
      />
    </div>
  )
}

export default MainPage
