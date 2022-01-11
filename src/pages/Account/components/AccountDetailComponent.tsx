import React, { FC } from 'react'
import { Text } from '@unique-nft/ui-kit'
import { useGraphQlAccount } from '../../../api/graphQL/account'
import Avatar from '../../../components/Avatar'
import LoadingComponent from '../../../components/LoadingComponent'
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize'
import { shortcutText } from '../../../utils/textUtils'
import { useApi } from '../../../hooks/useApi'

interface AccountProps {
  accountId: string
}

const AccountDetailComponent: FC<AccountProps> = (props) => {
  const { accountId } = props

  const { account, isAccountFetching } = useGraphQlAccount(accountId)

  const deviceSize = useDeviceSize()

  const { rpc } = useApi()
  const { chainData } = rpc

  if (isAccountFetching) return <LoadingComponent />

  const {
    timestamp,
    free_balance: freeBalance,
    locked_balance: lockedBalance,
    available_balance: availableBalance,
  } = account || {}

  return (
    <div className={'container-with-border'}>
      <div className={'grid-container grid-container_account-container'}>
        <div className={'grid-item_col1'}>
          <Avatar size="large" />
        </div>
        <div
          className={
            'flexbox-container flexbox-container_column flexbox-container_without-gap grid-item_col11'
          }
        >
          <Text size={'l'}>Account name</Text>
          <h2>
            {deviceSize === DeviceSize.sm || deviceSize === DeviceSize.md
              ? shortcutText(accountId)
              : accountId}
          </h2>
        </div>
        <Text className={'grid-item_col1'} color={'grey-500'}>
          Created on
        </Text>
        <Text className={'grid-item_col11'}>
          {timestamp ? new Date(timestamp).toLocaleString() : 'unavailable'}
        </Text>
        <Text className={'grid-item_col1'} color={'grey-500'}>
          Balance
        </Text>
        <div className={'grid-item_col11 flexbox-container flexbox-container_wrap'}>
          <Text>{`${freeBalance || 'unavailable'} ${
            chainData?.properties.tokenSymbol
          } (total) `}</Text>
          <Text color={'grey-500'}>{`${lockedBalance || 'unavailable'} ${
            chainData?.properties.tokenSymbol
          } (locked) `}</Text>
          <Text color={'grey-500'}>{`${availableBalance || 'unavailable'} ${
            chainData?.properties.tokenSymbol
          } (transferable)`}</Text>
        </div>
      </div>
    </div>
  )
}

export default AccountDetailComponent
