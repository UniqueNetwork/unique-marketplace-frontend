import React, { FC, useCallback } from 'react'
import Table from 'rc-table'
import { useQuery } from '@apollo/client'
import { lastTransfersQuery, Data as LastTransfersData, Transfer, Variables as LastTransfersVariables } from '../../../api/graphQL/transfers'
import PaginationComponent from '../../../components/Pagination'
import { Link } from 'react-router-dom'
import AccountLink from './AccountLink'

const columns = [
  {
    title: 'Extrinsic',
    dataIndex: 'block_index',
    key: 'block_index',
    width: 400,
    render: (value: string) => <Link to={`/extrinsic/${value}`}>{value}</Link>
  },
  { title: 'Age', dataIndex: 'age', key: 'age', width: 10 },
  {
    title: 'From',
    dataIndex: 'from_owner',
    key: 'from_owner',
    width: 400,
    render: (value: string) => <AccountLink value={value} />
  },
  {
    title: 'To',
    dataIndex: 'to_owner',
    key: 'to_owner',
    width: 400,
    render: (value: string) => <AccountLink value={value} />
  },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 10 },
];

const pageSize = 20;

const LastTransfers: FC = () => {

  const {
    fetchMore,
    loading: isTransfersFetching,
    data: lastTransfers,
  } = useQuery<LastTransfersData, LastTransfersVariables>(lastTransfersQuery, {
    variables: { limit: pageSize, offset: 0 },
  });

  const onPageChange = useCallback(
    (limit: number, offset: number) => fetchMore({variables: {limit, offset}}),
    [fetchMore]
  );

  return (
    <>
      <h1>Last  QTZ transfers</h1>
      <div>Is fetching: {!!isTransfersFetching ? 'yes' : 'finished'}</div>
      <div>Total number of transfers: {lastTransfers?.view_last_transfers_aggregate.aggregate.count}</div>
      <Table
        columns={columns}
        data={lastTransfers?.view_last_transfers}
        rowKey={(record: Transfer, index?: number) => `transfer_row_${index}_${record.block_index}`}
      />
      <PaginationComponent
        pageSize={pageSize}
        count={lastTransfers?.view_last_transfers_aggregate?.aggregate?.count || 0}
        onPageChange={onPageChange}
      />
    </>
  )
}

export default LastTransfers;
