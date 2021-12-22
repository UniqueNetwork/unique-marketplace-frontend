import React, { FC } from 'react'
import { useQuery } from '@apollo/client'
import { Data as AccountData, Variables as AccountVariables, accountQuery } from '../../../api/graphQL/account'
import Avatar from '../../../components/Avatar'
import LoadingComponent from '../../../components/LoadingComponent'

interface AccountProps {
  accountId: string;
}

const AccountDetailComponent: FC<AccountProps> = (props) => {
  const { accountId } = props

  const {
    loading: isAccountFetching,
    error: fetchAccountError,
    data: account,
  } = useQuery<AccountData, AccountVariables>(accountQuery, {
    variables: { accountId },
    notifyOnNetworkStatusChange: true,
  })

  if (isAccountFetching) return <LoadingComponent />

  const {
    timestamp,
    free_balance: freeBalance,
    locked_balance: lockedBalance,
    available_balance: availableBalance,
  } = account?.account_by_pk || {}

  return (
    <div className={'container-with-border'}>
      <div className={'grid-container'}>
        <div className={'grid-item_col1'}>
          <Avatar size='large' />
        </div>
        <div className={'flexbox-container flexbox-container_column flexbox-container_without-gap grid-item_col11'}>
          <div>Account name</div>
          <h2>{accountId}</h2>
        </div>
        <div className={'grid-item_col1 text_grey margin-top'}>Created on</div>
        <div
          className={'grid-item_col11 margin-top '}>{timestamp ? new Date(timestamp).toLocaleString() : 'unavailable'}</div>
        <div className={'grid-item_col1 text_grey margin-top'}>Balance</div>
        <div className={'grid-item_col11 flexbox-container margin-top'}>
          <span>{freeBalance || 'unavailable'} QTZ (total) </span>
          <span className={'text_grey'}>{lockedBalance || 'unavailable'} QTZ (locked) </span>
          <span
            className={'text_grey'}>{availableBalance || 'unavailable'} QTZ (transferable) </span>
        </div>
      </div>
    </div>
  )
}

export default AccountDetailComponent
