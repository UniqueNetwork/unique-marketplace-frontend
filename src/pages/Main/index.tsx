import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { InputText } from '@unique-nft/ui-kit'
import Button from '../../components/Button'
import {
  getLatestBlocksQuery,
  Data as BlocksData,
  Variables as BlocksVariables,
} from '../../api/graphQL/block'
import {
  getLastTransfersQuery,
  Data as TransfersData,
  Variables as TransferVariables,
} from '../../api/graphQL/transfers'
import LastTransfersComponent from './components/LastTransfersComponent'
import LastBlocksComponent from './components/LastBlocksComponent'

const MainPage = () => {
  const pageSize = 10 // default
  const [searchString, setSearchString] = useState('')
  const {
    fetchMore: fetchMoreBlocks,
    loading: isBlocksFetching,
    error: fetchBlocksError,
    data: blocks,
  } = useQuery<BlocksData, BlocksVariables>(getLatestBlocksQuery, {
    variables: { limit: pageSize, offset: 0, order_by: { block_number: 'desc' } },
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  })

  const {
    fetchMore: fetchMoreTransfers,
    loading: isTransfersFetching,
    error: fetchTransfersError,
    data: transfers,
  } = useQuery<TransfersData, TransferVariables>(getLastTransfersQuery, {
    variables: { limit: pageSize, offset: 0 },
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  })

  const navigate = useNavigate()

  const onBlocksPageChange = useCallback(
    (limit: number, offset: number) =>
      fetchMoreBlocks({
        variables: {
          limit,
          offset,
        },
      }),
    [fetchMoreBlocks, searchString],
  )
  const onTransfersPageChange = useCallback(
    (limit: number, offset: number) =>
      fetchMoreTransfers({
        variables: {
          limit,
          offset,
        },
      }),
    [fetchMoreTransfers, searchString],
  )

  const onSearchClick = useCallback(() => {

    if (/^\w{48}$/.test(searchString)) {
      navigate(`/account/${searchString}`)
    }

    if (/^\d+-\d+$/.test(searchString)) {
      navigate(`/extrinsic/${searchString}`)
    }

    const prettifiedBlockSearchString = searchString.match(/[^$,.\d]/) ? -1 : searchString

    fetchMoreBlocks({
      variables: {
        where:
          (searchString &&
            searchString.length > 0 && { block_number: { _eq: prettifiedBlockSearchString } }) ||
          undefined,
      },
    })
    fetchMoreTransfers({
      variables: {
        where:
          (searchString &&
            searchString.length > 0 && {
              _or: [
                {
                  block_index: { _eq: searchString },
                },
                {
                  from_owner: { _eq: searchString },
                },
                { to_owner: { _eq: searchString } },
              ],
            }) ||
          undefined,
      },
    })
  }, [fetchMoreTransfers, fetchMoreBlocks, searchString])

  const onSearchKeyDown = useCallback(
    ({ key }) => {
      if (key === 'Enter') onSearchClick()
    },
    [onSearchClick],
  )

  return (
    <div>
      <div className={'flexbox-container'}>
        <div className={'search-wrap'}>
          <InputText
            placeholder={'Extrinsic / account'}
            className={'input-width-612'}
            iconLeft={{name: 'magnify', size: 18}}
            onChange={(value) => setSearchString(value?.toString() || '')}
            onKeyDown={onSearchKeyDown}
          />
          <Button onClick={onSearchClick} text='Search' />
        </div>
      </div>
      {/* TODO: keep in mind - QTZ should be changed to different name based on data from rpc */}
      <div className={'margin-top'}>
        <h2>Last QTZ transfers</h2>
        <LastTransfersComponent
          data={transfers}
          loading={isTransfersFetching}
          pageSize={pageSize}
          onPageChange={onTransfersPageChange}
        />
      </div>
      <div className={'margin-top'}>
        <h2>Last blocks</h2>
        <LastBlocksComponent
          data={blocks}
          loading={isBlocksFetching}
          onPageChange={onBlocksPageChange}
          pageSize={pageSize}
        />
      </div>
    </div>
  )
}

export default MainPage
