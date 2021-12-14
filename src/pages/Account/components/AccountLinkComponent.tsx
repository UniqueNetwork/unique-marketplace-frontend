import React, { FC, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { shortcutAccountId } from '../../../utils/textUtils';

interface AccountLinkProps {
  value: string;
}

const AccountLinkComponent: FC<AccountLinkProps> = ({value}) => {

  const { accountId } = useParams();

  const shortcut = useMemo(
    () => shortcutAccountId(value),
    [value]
  );

  if (value === accountId) return <>{shortcut}</>;

  return (
    <Link to={`/account/${value}`} >{shortcut}</Link>
  )
}

export default AccountLinkComponent;
