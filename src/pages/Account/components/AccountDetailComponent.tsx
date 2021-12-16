import React, { FC } from 'react'
import { useQuery } from '@apollo/client'
import { Data as AccountData, Variables as AccountVariables, accountQuery } from '../../../api/graphQL/account'
import Avatar from '../../../components/Avatar';

interface AccountProps {
  accountId: string;
}

const AccountDetailComponent: FC<AccountProps> = (props) => {
  const { accountId } = props;

  const {
    loading: isAccountFetching,
    error: fetchAccountError,
    data: account,
  } = useQuery<AccountData, AccountVariables>(accountQuery, {
    variables: { accountId },
  });

  if (!account) return null;

  return (
    <div className={'container-with-border'}>
      <div className={'grid-container'}>
        <div className={'grid-item_col1'}>
          <Avatar size="large" />
        </div>
        <div className={'flexbox-container flexbox-container_column flexbox-container_without-gap grid-item_col11'}>
          <div>Account name</div>
          <h2>{account.account_by_pk?.account_id}</h2>
        </div>
        <div className={'grid-item_col1 text_grey'}>Created on</div>
        <div className={'grid-item_col11'}>{new Date(account.account_by_pk?.timestamp).toLocaleString()}</div>
        <div className={'grid-item_col1 text_grey'}>Balance</div>
        <div className={'grid-item_col11 flexbox-container'}>
          <span>{account.account_by_pk?.free_balance || "unavailable"} (total) </span>
          <span className={'text_grey'}>{account.account_by_pk?.locked_balance || 'unavailable'} (locked) </span>
          <span className={'text_grey'}>{account.account_by_pk?.available_balance || 'unavailable'} (transferable) </span>
        </div>
      </div>
    </div>
  )
}

export default AccountDetailComponent
