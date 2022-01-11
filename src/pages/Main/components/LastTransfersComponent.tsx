import React from 'react'
import Table from 'rc-table'
import { Link } from 'react-router-dom'
import { Text } from '@unique-nft/ui-kit'
import PaginationComponent from '../../../components/Pagination'
import AccountLinkComponent from '../../Account/components/AccountLinkComponent'
import { Transfer } from '../../../api/graphQL/transfers'
import { BlockComponentProps } from '../types'
import { timeDifference } from '../../../utils/timestampUtils'
import LoadingComponent from '../../../components/LoadingComponent'
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize'
import { useApi } from '../../../hooks/useApi'

const getTransferColumns = (tokenSymbol: string, chainId?: string) => [
  {
    title: 'Extrinsic',
    dataIndex: 'block_index',
    key: 'block_index',
    width: 100,

    render: (value: string) => <Link to={`/${chainId}/extrinsic/${value}`}>{value}</Link>,
  },
  { title: 'Age', dataIndex: 'time_difference', key: 'age', width: 100 },
  {
    title: 'From',
    dataIndex: 'from_owner',
    key: 'from_owner',
    width: 100,
    render: (value: string) => <AccountLinkComponent value={value} />,
  },
  {
    title: 'To',
    dataIndex: 'to_owner',
    key: 'to_owner',
    width: 100,
    render: (value: string) => <AccountLinkComponent value={value} />,
  },
  /* TODO: due to API issues - amount of some transactions is object which is, for now, should be translated as zero */
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    width: 100,
    render: (value: number | object) => (
      <Text size={'s'}>{`${(Number(value) && value) || 0} ${tokenSymbol}`}</Text>
    ),
  },
]

const transfersWithTimeDifference = (
  transfers: Transfer[] | undefined
): (Transfer & { time_difference: string })[] => {
  if (!transfers) return []
  return transfers.map((transfer: Transfer) => ({
    ...transfer,
    time_difference: transfer.timestamp ? timeDifference(transfer.timestamp) : '',
  }))
}

const LastTransfersComponent = ({
  data,
  count,
  pageSize,
  loading,
  onPageChange,
}: BlockComponentProps<Transfer[]>) => {
  const deviceSize = useDeviceSize()

  const { currentChain, chainData } = useApi()

  return (
    <div>
      {deviceSize !== DeviceSize.sm && (
        <Table
          columns={getTransferColumns(chainData?.properties.tokenSymbol || '', currentChain?.id)}
          data={!loading && data?.length ? transfersWithTimeDifference(data) : []}
          emptyText={!loading ? 'No data' : <LoadingComponent />}
          rowKey={'block_index'}
        />
      )}

      {deviceSize === DeviceSize.sm && (
        <div className={'table-sm'}>
          {loading && <LoadingComponent />}
          {!loading && data?.length === 0 && (
            <Text color={'grey'} className={'text_grey'}>
              No data
            </Text>
          )}
          {!loading &&
            transfersWithTimeDifference(data).map((item) => (
              <div key={item.block_index} className={'row'}>
                <div>
                  <Text className={'title'}>Extrinsic</Text>
                  <Link to={`/${currentChain?.id}/extrinsic/${item.block_index}`}>
                    <Text color={'primary-600'}>{item.block_index}</Text>
                  </Link>
                </div>
                <div>
                  <Text className={'title'}>Age</Text>
                  <Text>{item.time_difference}</Text>
                </div>
                <div>
                  <Text className={'title'}>From</Text>
                  <AccountLinkComponent value={item.from_owner} />
                </div>
                <div>
                  <Text className={'title'}>To</Text>
                  <AccountLinkComponent value={item.to_owner} />
                </div>
                <div>
                  <Text className={'title'}>Amount</Text>
                  <Text>{`${Number(item.amount) || 0} ${chainData?.properties.tokenSymbol}`}</Text>
                </div>
              </div>
            ))}
        </div>
      )}
      <PaginationComponent
        pageSize={pageSize}
        count={count}
        onPageChange={onPageChange}
        siblingCount={deviceSize === DeviceSize.sm ? 1 : 2}
      />
    </div>
  )
}

export default LastTransfersComponent
