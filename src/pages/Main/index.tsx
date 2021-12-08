import React from 'react'
import { useQuery } from '@apollo/client'
import Table from 'rc-table'
import { exampleBlocks, Data as BlocksData } from '../../api/graphQL/exampleQuery'

const columns = [
  {
    title: 'Block hash',
    dataIndex: 'block_hash',
    key: 'block_hash',
    width: 400,
  },
  { title: 'Block number', dataIndex: 'block_number', key: 'block_number', width: 10 },
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', width: 10 },
  { title: 'Extrinsic', dataIndex: 'extrinsics_root', key: 'extrinsics_root', width: 400 },
  { title: 'Event', dataIndex: 'total_events', key: 'total_events', width: 10 },
]

const MainPage = () => {
  const {
    loading: isBlocksFetching,
    error: fetchBlocksError,
    data: blocks,
  } = useQuery<BlocksData>(exampleBlocks)

  return (
    <div>
      <span>Is fetching: {!!isBlocksFetching ? 'yes' : 'finished'}</span>
      <br />
      <Table columns={columns} data={blocks?.block} />
    </div>
  )
}

export default MainPage
