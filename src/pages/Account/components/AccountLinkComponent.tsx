import React, { FC, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Text } from '@unique-nft/ui-kit'
import { shortcutText } from '../../../utils/textUtils'

interface AccountLinkProps {
  value: string;
  size?: 'xs' | 's' | 'm' | 'l'
  noShort?: boolean;
}

const AccountLinkComponent: FC<AccountLinkProps> = ({ value, size = 'm', noShort }) => {

  const { accountId } = useParams()

  const shortcut = useMemo(
    () => noShort ? value : shortcutText(value),
    [value, noShort],
  )

  if (value === accountId) return <>{shortcut}</>

  return (
    <Link to={`/account/${value}`}><Text color={'primary-600'} size={size}>{shortcut}</Text></Link>
  )
}

export default AccountLinkComponent
