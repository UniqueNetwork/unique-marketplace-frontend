import Table from 'rc-table'
import { Data as TransfersData } from '../../../api/graphQL/transfers'
import PaginationComponent from '../../../components/Pagination'
import { BlockComponentProps } from '../types'
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
