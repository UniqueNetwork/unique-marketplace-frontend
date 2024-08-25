import React, { FCC, useCallback, useMemo, MouseEvent } from 'react';
import { CopyButton, Text, useNotifications } from 'components/UI';
import styled from 'styled-components';
import { toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
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

const AccountCard: FCC<AccountProps> = ({
  accountName,
  accountAddress,
  isShort = false,
  canCopy = true,
  hideAddress = false,
  hideName = false,
  testid
}) => {
  const { chainProperties } = useApi();
  const { info } = useNotifications();

  const formatAddress = useCallback((address: string) => {
    if (!address) return '';
    return toChainFormatAddress(address, chainProperties?.SS58Prefix || 0);
  }, [chainProperties?.SS58Prefix]);

  const onCopyAddress = (account: string) => (event: MouseEvent) => {
    event.stopPropagation();
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
        {!hideAddress && <Row>
          <FormattedAddress
            formatAddress={formatAddress}
            accountAddress={accountAddress}
            isShort={isShort}
            hideName={hideName}
            testid={testid}
          />
          {canCopy && <CopyButton onClick={onCopyAddress(formatAddress(accountAddress) || '')} data-testid={`${testid}-copy`} />}
        </Row>}
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

const FormattedAddress: FCC<IAddressProps> = ({ isShort = false, formatAddress, accountAddress, hideName, testid }) => {
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

const Row = styled.div`
  && {
    display: flex;
    padding: 0;
    align-items: center;
    gap: calc(var(--prop-gap) / 2);
  }
`;

export default AccountCard;
