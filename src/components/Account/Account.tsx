import React, { FC, useCallback, useMemo } from 'react';
import { Text, useNotifications } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { Icon } from 'components/UI/Icon/Icon';
import { toChainFormatAddress } from 'api/uniqueSdk/utils/addressUtils';
import DefaultAvatar from 'static/icons/default-avatar.svg';
import { useApi } from 'hooks/useApi';
import { shortcutText } from 'utils/textUtils';
import { Avatar } from '../Avatar/Avatar';

interface AccountProps {
  accountName: string
  accountAddress: string
  isShort?: boolean
  canCopy?: boolean
  hideAddress?: boolean
  hideName?: boolean
  testid?: string
}

const AccountCard: FC<AccountProps> = ({
  accountName,
  accountAddress,
  isShort = false,
  canCopy = true,
  hideAddress = false,
  hideName = false,
  testid
}) => {
  const { chainData } = useApi();
  const { info } = useNotifications();

  const formatAddress = useCallback((address: string) => {
    if (!address) return '';
    return toChainFormatAddress(address, chainData?.SS58Prefix || 0);
  }, [chainData?.SS58Prefix]);

  const onCopyAddress = (account: string) => () => {
    navigator.clipboard.writeText(account).then(() => {
      info(
        'Address copied',
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    });
  };

  return (
    <>
      <Avatar size={24} src={DefaultAvatar} address={accountAddress} />
      <AccountInfoWrapper>
        {!hideName && <Text testid={`${testid}-account-name`}>{accountName}</Text>}
        {!hideAddress && <AddressRow>
          <FormattedAddress
            formatAddress={formatAddress}
            accountAddress={accountAddress}
            isShort={isShort}
            hideName={hideName}
            testid={testid}
          />
          {canCopy && <a onClick={onCopyAddress(formatAddress(accountAddress) || '')} data-testid={`${testid}-copy`}>
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
  testid?: string
}

const FormattedAddress: FC<IAddressProps> = ({ isShort = false, formatAddress, accountAddress, hideName, testid }) => {
  const address = useMemo(() => {
    return isShort ? shortcutText(formatAddress(accountAddress) || '') : formatAddress(accountAddress) || '';
  }, [isShort, formatAddress, accountAddress]);

  return (<>
    {hideName
      ? <Text testid={`${testid}-address`}>{address}</Text>
      : <Text testid={`${testid}-address`} size={'s'} color={'grey-500'}>{address}</Text>
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
