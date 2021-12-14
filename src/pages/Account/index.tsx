import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import AccountDetailComponent from './components/AccountDetailComponent'
import LastTransfersComponent from '../Main/components/LastTransfersComponent';

import {
  Data as TransfersData,
  getLastTransfersQuery,
  Variables as TransferVariables,
} from '../../api/graphQL/transfers'

const AccountPage = () => {
 const { accountId } = useParams();

 const pageSize = 10 // default

  const {
    fetchMore: fetchMoreTransfers,
    loading: isTransfersFetching,
    error: fetchTransfersError,
    data: transfers,
  } = useQuery<TransfersData, TransferVariables>(getLastTransfersQuery, {
    variables: { limit: pageSize, offset: 0, order_by: { block_index: 'desc' } },
  })

  const onTransfersPageChange = useCallback(
    (limit: number, offset: number) =>
      fetchMoreTransfers({
        variables: {
          limit,
          offset,
        },
      }),
    [fetchMoreTransfers]
  )

 if (!accountId) return null;



 return <div>
   <AccountDetailComponent accountId={accountId} />
   <h1>Last QTZ transfers</h1>
   <div>Is fetching: {!!isTransfersFetching ? 'yes' : 'finished'}</div>
   <div>
     Total number of transfers: {transfers?.view_last_transfers_aggregate.aggregate.count}
   </div>
   <LastTransfersComponent
     data={transfers}
     onPageChange={onTransfersPageChange}
     pageSize={pageSize}
   />
 </div>;
}

export default AccountPage;