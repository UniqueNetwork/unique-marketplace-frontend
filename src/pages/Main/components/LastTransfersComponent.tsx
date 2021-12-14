import Table from 'rc-table'
import { Data as TransfersData } from '../../../api/graphQL/transfers'
import PaginationComponent from '../../../components/Pagination'
import { BlockComponentProps } from '../types'
import { Link } from 'react-router-dom'
import React from 'react'
import AccountLinkComponent from '../../Account/components/AccountLinkComponent'
const transferColumns = [
  {
    title: 'Extrinsic',
    dataIndex: 'block_index',
    key: 'block_index',
    width: 100,

    render: (value: string) => <Link to={`/extrinsic/${value}`}>{value}</Link>
  },
  { title: 'Age', dataIndex: 'age', key: 'age', width: 50 },
  {
    title: 'From',
    dataIndex: 'from_owner',
    key: 'from_owner',
    width: 200,
    render: (value: string) => <AccountLinkComponent value={value} />
  },
  {
    title: 'To',
    dataIndex: 'to_owner',
    key: 'to_owner',
    width: 200,
    render: (value: string) => <AccountLinkComponent value={value} />
  },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 10 },
]

const LastTransfersComponent = ({
  data,
  pageSize,
  onPageChange,
}: BlockComponentProps<TransfersData>) => {
  if (!data?.view_last_transfers.length) return null
  return (
    <div>
      <Table columns={transferColumns} data={data?.view_last_transfers} rowKey={'block_index'} />
      <PaginationComponent
        pageSize={pageSize}
        count={data?.view_last_transfers_aggregate.aggregate?.count || 0}
        onPageChange={onPageChange}
      />
    </div>
  )
}
export { transferColumns }
export default LastTransfersComponent
