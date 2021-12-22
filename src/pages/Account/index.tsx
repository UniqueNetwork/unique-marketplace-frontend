import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Tabs } from '@unique-nft/ui-kit'
import { useQuery } from '@apollo/client'
import AccountDetailComponent from './components/AccountDetailComponent'
import LastTransfersComponent from '../Main/components/LastTransfersComponent'
import {
  Data as TransfersData,
  getLastTransfersQuery,
  Variables as TransferVariables,
} from '../../api/graphQL/transfers'
import CollectionsComponent from './components/CollectionsComponent'
import TokensComponent from './components/TokensComponent'

const assetsTabs = ['Collections', 'Tokens']

const AccountPage = () => {
  const { accountId } = useParams()

  const pageSize = 10 // default

  const [activeAssetsTabIndex, setActiveAssetsTabIndex] = useState<number>(0)

  const {
    fetchMore: fetchMoreTransfers,
    loading: isTransfersFetching,
    error: fetchTransfersError,
    data: transfers,
  } = useQuery<TransfersData, TransferVariables>(getLastTransfersQuery, {
    variables: {
      limit: pageSize,
      offset: 0,
      where: { _or: [{ from_owner: { _eq: accountId } }, { to_owner: { _eq: accountId } }] },
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  })

  const onTransfersPageChange = useCallback(
    (limit: number, offset: number) => {
      return fetchMoreTransfers({
        variables: {
          limit,
          offset,
        },
      })
    },
    [fetchMoreTransfers],
  )

  if (!accountId) return null

  return <div>
    <AccountDetailComponent accountId={accountId} />
    {/*<h2 className={'margin-top'}>Assets</h2>*/}
    {/*<Tabs*/}
    {/*  activeIndex={activeAssetsTabIndex}*/}
    {/*  labels={assetsTabs}*/}
    {/*  onClick={setActiveAssetsTabIndex}*/}
    {/*/>*/}
    {/*<Tabs*/}
    {/*  activeIndex={activeAssetsTabIndex}*/}
    {/*  contents={[*/}
    {/*    <CollectionsComponent accountId={accountId} />,*/}
    {/*    <TokensComponent accountId={accountId} />]}*/}
    {/*/>*/}
    <h2 className={'margin-top margin-bottom'}>Last QTZ transfers</h2>
    <LastTransfersComponent
      data={transfers}
      onPageChange={onTransfersPageChange}
      pageSize={pageSize}
      loading={isTransfersFetching}
    />
  </div>
}

export default AccountPage