import React from 'react'
import Table from 'rc-table'
import { Text } from '@unique-nft/ui-kit'
import { Block } from '../../../api/graphQL/block'
import PaginationComponent from '../../../components/Pagination'
import { timeDifference } from '../../../utils/timestampUtils'
import { BlockComponentProps } from '../types'
import LoadingComponent from '../../../components/LoadingComponent'
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize'
import { Link } from 'react-router-dom'

const blockColumns = [
  {
    title: 'Block',
    dataIndex: 'block_number',
    key: 'block_number',
    width: 100,
    render: (value: string) => <Link to={`/block/${value}`}>{value}</Link>,
  },
  // Age is calculated from timestamp aftter query execution
  { title: 'Age', dataIndex: 'time_difference', key: 'time_difference', width: 100 },
  { title: 'Extrinsic', dataIndex: 'extrinsic_count', key: 'extrinsic_count', width: 100 },
  { title: 'Event', dataIndex: 'event_count', key: 'event_count', width: 100 },
]

const blocksWithTimeDifference = (
  blocks: Block[] | undefined
): (Block & { time_difference: string })[] => {
  if (!blocks) return []
  return blocks.map((block: Block) => ({
    ...block,
    time_difference: timeDifference(block.timestamp),
  }))
}

const LastBlocksComponent = ({
  data,
  count,
  pageSize,
  loading,
  onPageChange,
}: BlockComponentProps<Block[]>) => {
  const deviceSize = useDeviceSize()

  return (
    <div>
      {deviceSize !== DeviceSize.sm && (
        <Table
          columns={blockColumns}
          data={!loading && data?.length ? blocksWithTimeDifference(data) : []}
          emptyText={!loading ? 'No data' : <LoadingComponent />}
          rowKey={'block_number'}
        />
      )}
      {deviceSize === DeviceSize.sm && (
        <div className={'table-sm'}>
          {loading && <LoadingComponent />}
          {!loading && data?.length === 0 && <Text className={'text_grey'}>No data</Text>}
          {!loading &&
            blocksWithTimeDifference(data).map((item) => (
              <div key={item.block_number} className={'row'}>
                <div>
                  <Text color={'grey-500'}>Block</Text>
                  <Text>{item.block_number.toString()}</Text>
                </div>
                <div>
                  <Text color={'grey-500'}>Age</Text>
                  <Text>{item.time_difference}</Text>
                </div>
                <div>
                  <Text color={'grey-500'}>Extrinsic</Text>
                  <Text>{item.extrinsic_count?.toString() || '0'}</Text>
                </div>
                <div>
                  <Text color={'grey-500'}>Event</Text>
                  <Text>{item.event_count?.toString() || '0'}</Text>
                </div>
              </div>
            ))}
        </div>
      )}
      <PaginationComponent
        pageSize={pageSize}
        count={count || 0}
        onPageChange={onPageChange}
        siblingCount={deviceSize === DeviceSize.sm ? 1 : 2}
      />
    </div>
  )
}

export default LastBlocksComponent
