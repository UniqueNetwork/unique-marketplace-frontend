import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import Table from 'rc-table'
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
// timestamps only
const timeDifference = (target: number, now = new Date().getTime()) => {
  // https://stackoverflow.com/questions/9873197/how-to-convert-date-to-timestamp
  let difference = target - now

  const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24)
  difference -= daysDifference * 1000 * 60 * 60 * 24

  const hoursDifference = Math.floor(difference / 1000 / 60 / 60)
  difference -= hoursDifference * 1000 * 60 * 60

  const minutesDifference = Math.floor(difference / 1000 / 60)
  difference -= minutesDifference * 1000 * 60

  const secondsDifference = Math.floor(difference / 1000)

  // just an example, later on oculd be extended to calculate time difference (trying to avoid any external libs for this matter)
  let amount = secondsDifference
  let timeType = 'second'
  if (minutesDifference > 0) {
    timeType = 'minute'
    amount = minutesDifference
  }
  if (hoursDifference > 0) {
    timeType = 'hour'
    amount = hoursDifference
  }
  if (daysDifference > 0) {
    timeType = 'day'
    amount = daysDifference
  }
  if (daysDifference > 7) {
    timeType = 'week'
    amount = Math.abs(daysDifference / 7)
  }

  return `${amount} ${timeType}${amount > 1 ? 's' : ''} ago`
}

const blocksWithTimeDifference = (blocks: Block[] | undefined): Block[] => {
  if (!blocks) return []
  return blocks.map(
    (block: Block) => ({ ...block, time_difference: timeDifference(block.timestamp) } as Block)
  )
}

const MainPage = () => {
  const [currPage, setCurrPage] = useState(0)
  const {
    loading: isBlocksFetching,
    error: fetchBlocksError,
    data: blocks,
  } = useQuery<BlocksData, BlocksVariables>(exampleBlocksQuery, {
    variables: { limit: 17, offset: 0 },
  })

  return (
    <div>
      <span>Is fetching: {!!isBlocksFetching ? 'yes' : 'finished'}</span>
      <span>Total number of blocks: {blocks?.block_aggregate.aggregate.count}</span>
      <br />
      <Table columns={columns} data={blocksWithTimeDifference(blocks?.block)} />
    </div>
  )
}

export default MainPage
