import Table from 'rc-table'
import { Data as BlocksData, Block } from '../../../api/graphQL/block'
import PaginationComponent from '../../../components/Pagination'
import { timeDifference } from '../../../utils/timestampUtils'
import { BlockComponentProps } from '../types'
import LoadingComponent from '../../../components/LoadingComponent'
import React from 'react'

const blockColumns = [
  {
    title: 'Block',
    dataIndex: 'block_number',
    key: 'block_number',
    width: 400,
  },
  // Age is calculated from timestamp aftter query execution
  { title: 'Age', dataIndex: 'time_difference', key: 'time_difference', width: 200 },
  { title: 'Extrinsic', dataIndex: 'extrinsic_count', key: 'extrinsic_count', width: 100 },
  { title: 'Event', dataIndex: 'event_count', key: 'event_count', width: 50 },
]

const blocksWithTimeDifference = (blocks: Block[] | undefined): Block[] => {
  if (!blocks) return []
  return blocks.map(
    (block: Block) => ({ ...block, time_difference: timeDifference(block.timestamp) } as Block),
  )
}

const LastBlocksComponent = ({ data, pageSize, loading, onPageChange }: BlockComponentProps<BlocksData>) => {
  return (
    <div>
      <Table
        columns={blockColumns}
        data={!loading && data?.view_last_block.length ? blocksWithTimeDifference(data?.view_last_block) : []}
        emptyText={() => !loading ? 'No data' : <LoadingComponent />}
        rowKey={'block_number'}
      />
      <PaginationComponent
        pageSize={pageSize}
        count={data?.view_last_block_aggregate?.aggregate?.count || 0}
        onPageChange={onPageChange}
      />
    </div>
  )
}

export { blockColumns }
export default LastBlocksComponent
