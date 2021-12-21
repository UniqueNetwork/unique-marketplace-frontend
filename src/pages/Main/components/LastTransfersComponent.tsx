import React from 'react'
import Table from 'rc-table'
import { Link } from 'react-router-dom'
import PaginationComponent from '../../../components/Pagination'
import AccountLinkComponent from '../../Account/components/AccountLinkComponent'
import { Data as TransfersData, Transfer } from '../../../api/graphQL/transfers'
import { BlockComponentProps } from '../types'
import { timeDifference } from '../../../utils/timestampUtils'

const transferColumns = [
  {
    title: 'Extrinsic',
    dataIndex: 'block_index',
    key: 'block_index',
    width: 100,

    render: (value: string) => <Link to={`/extrinsic/${value}`}>{value}</Link>,
  },
  { title: 'Age', dataIndex: 'time_difference', key: 'age', width: 50 },
  {
    title: 'From',
    dataIndex: 'from_owner',
    key: 'from_owner',
    width: 200,
    render: (value: string) => <AccountLinkComponent value={value} />,
  },
  {
    title: 'To',
    dataIndex: 'to_owner',
    key: 'to_owner',
    width: 200,
    render: (value: string) => <AccountLinkComponent value={value} />,
  },
  /* TODO: due to API issues - amount of some transactions is object which is, for now, should be translated as zero */
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    width: 10,
    render: (value: number | object) => <span className={'text_right'}>{Number(value) || 0} QTZ</span>,
  },
]

const transfersWithTimeDifference = (transfers: Transfer[] | undefined): Transfer[] => {
  if (!transfers) return []
  return transfers.map(
    (transfer: Transfer) =>
      ({
        ...transfer,
        time_difference: transfer.timestamp ? timeDifference(transfer.timestamp) : '',
      } as Transfer)
  )
}

const LastTransfersComponent = ({
  data,
  pageSize,
  onPageChange,
}: BlockComponentProps<TransfersData>) => {
  if (!data?.view_extrinsic.length) return null

  return (
    <div>
      <Table
        columns={transferColumns}
        data={transfersWithTimeDifference(data?.view_extrinsic)}
        rowKey={'block_index'}
      />
      <PaginationComponent
        pageSize={pageSize}
        count={data?.view_extrinsic_aggregate.aggregate?.count || 0}
        onPageChange={onPageChange}
      />
    </div>
  )
}
export { transferColumns }
export default LastTransfersComponent
