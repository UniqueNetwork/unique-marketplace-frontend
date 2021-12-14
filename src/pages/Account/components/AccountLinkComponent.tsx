import React, { FC, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

interface AccountLinkProps {
  value: string;
}

const AccountLinkComponent: FC<AccountLinkProps> = ({value}) => {

  const { accountId } = useParams();

  const shortcut = useMemo(() => {
    //Cut it to the first and last 5 symbols
    const [_, start, end] = /^(.{5}).*(.{5})$/.exec(value) || [];
    return (start && end) ? `${start}...${end}` : value;
  }, [value])

  if (value === accountId) return <>{shortcut}</>;

  return (
    <Link to={`/account/${value}`} >{shortcut}</Link>
  )
}

export default AccountLinkComponent;
