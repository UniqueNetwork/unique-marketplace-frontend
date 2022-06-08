import React, { FC, useCallback } from 'react';
import { Text, Icon } from '@unique-nft/ui-kit';

import DefaultAvatar from '../../static/icons/default-avatar.svg';
import styled from 'styled-components';
import { useApi } from '../../hooks/useApi';
import { toChainFormatAddress } from '../../api/chainApi/utils/addressUtils';
import { shortcutText } from '../../utils/textUtils';
import { NotificationSeverity } from '../../notification/NotificationContext';
import { useNotification } from '../../hooks/useNotification';
import { Avatar } from '../Avatar/Avatar';

interface AccountProps {
  accountName: string
  accountAddress: string
  isShort?: boolean
  canCopy?: boolean
  hideAddress?: boolean
}

const AccountCard: FC<AccountProps> = ({ accountName, accountAddress, isShort = false, canCopy = true, hideAddress = false }) => {
  const { chainData } = useApi();
  const { push } = useNotification();

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainData?.properties.ss58Format || 0);
  }, [chainData?.properties.ss58Format]);

  const onCopyAddress = (account: string) => () => {
    navigator.clipboard.writeText(account).then(() => {
      push({ severity: NotificationSeverity.success, message: 'Address copied' });
    });
  };

  return (
    <>
      <Avatar size={24} src={DefaultAvatar} address={accountAddress} />
      <AccountInfoWrapper>
        <Text>{accountName}</Text>
        {!hideAddress && <AddressRow>
          <Text size={'s'} color={'grey-500'}>
            {isShort ? shortcutText(formatAddress(accountAddress) || '') : formatAddress(accountAddress) || ''}
          </Text>
          {canCopy && <a onClick={onCopyAddress(formatAddress(accountAddress) || '')}>
            <CopyIconWrapper>
              <Icon name={'copy'} size={24} />
            </CopyIconWrapper>
          </a>}
        </AddressRow>}
      </AccountInfoWrapper>
    </>
  );
};

const AccountInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const CopyIconWrapper = styled.div`
  && {
    width: 24px;
    height: 24px;
    color: var(--color-grey-400);
    padding: 0;
    cursor: copy;
    svg {
      transform: translateY(-2px);
    }
  }
`;

const AddressRow = styled.div`
  && {
    display: flex;
    padding: 0;
  }
`;

export default AccountCard;
