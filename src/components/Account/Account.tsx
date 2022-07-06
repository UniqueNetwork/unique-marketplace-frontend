import React, { FC, useCallback, useMemo } from 'react';
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
  hideName?: boolean
}

const AccountCard: FC<AccountProps> = ({
  accountName,
  accountAddress,
  isShort = false,
  canCopy = true,
  hideAddress = false,
  hideName = false
}) => {
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
        {!hideName && <Text>{accountName}</Text>}
        {!hideAddress && <AddressRow>
          <FormattedAddress
            formatAddress={formatAddress}
            accountAddress={accountAddress}
            isShort={isShort}
            hideName={hideName}
          />
          {canCopy && <a onClick={onCopyAddress(formatAddress(accountAddress) || '')}>
            <CopyIconWrapper>
              <Icon name={'copy'} size={16} />
            </CopyIconWrapper>
          </a>}
        </AddressRow>}
      </AccountInfoWrapper>
    </>
  );
};

interface IAddressProps {
  isShort: boolean,
  hideName: boolean,
  formatAddress: (accountAddress: string) => string,
  accountAddress: string
}

const FormattedAddress: FC<IAddressProps> = ({ isShort = false, formatAddress, accountAddress, hideName }) => {
  const address = useMemo(() => {
    return isShort ? shortcutText(formatAddress(accountAddress) || '') : formatAddress(accountAddress) || '';
  }, [isShort, formatAddress, accountAddress]);

  return (<>
    {hideName
      ? <Text>{address}</Text>
      : <Text size={'s'} color={'grey-500'}>{address}</Text>
    }
  </>);
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
      transform: translateX(3px);
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
