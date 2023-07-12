import React, { FC, useCallback, useMemo, MouseEvent, useEffect, useState } from 'react';
import { CopyButton, Text, useNotifications } from 'components/UI';
import styled from 'styled-components';
import { toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
import DefaultAvatar from 'static/icons/default-avatar.svg';
import { useApi } from 'hooks/useApi';
import { shortcutText } from 'utils/textUtils';
import { Avatar } from '../Avatar/Avatar';
import { Link } from 'react-router-dom';
import { Address } from '@unique-nft/utils';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { Primary500 } from 'styles/colors';
import { useAccounts } from 'hooks/useAccounts';

interface OwnerCardProps {
  address: string
  to: string
  isShort?: boolean
  canCopy?: boolean
  testid?: string
}

export const OwnerCard: FC<OwnerCardProps> = ({
  address,
  to,
  isShort = false,
  canCopy = true,
  testid
}) => {
  const { chainProperties, api } = useApi();
  const { selectedAccount } = useAccounts();
  const { info } = useNotifications();
  const [parentToken, setParentToken] = useState<TokenByIdResponse>();

  const formatAddress = useCallback((address: string) => {
    if (!address) return '';
    return toChainFormatAddress(address, chainProperties?.SS58Prefix || 0);
  }, [chainProperties?.SS58Prefix]);

  const isParentToken = Address.is.nestingAddress(address);
  const isOwned = !isParentToken && selectedAccount && (Address.is.ethereumAddressInAnyForm(selectedAccount.address)
    ? Address.compare.ethereumAddresses(selectedAccount.address, address)
    : Address.compare.substrateAddresses(selectedAccount.address, address));

  useEffect(() => {
    if (Address.is.nestingAddress(address) && api) {
      void (async () => {
        const { collectionId, tokenId } = Address.nesting.addressToIds(address);
        const token = await api.nft?.getToken(collectionId, tokenId);
        setParentToken(token || undefined);
      })();
    }
  }, [address, api]);

  const onCopyAddress = (account: string) => (event: MouseEvent) => {
    event.stopPropagation();
    void navigator.clipboard.writeText(account).then(() => {
      info(
        'Address copied',
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    });
  };

  return (
    <StyledLink to={to}>
      <Avatar
        size={24}
        src={parentToken?.image.fullUrl || DefaultAvatar}
        address={!isParentToken ? address : undefined}
      />
      <AccountInfoWrapper>
        <Row>
          {isOwned && <Text >You own it</Text>}
          {!isOwned && !isParentToken && <FormattedAddress
            formatAddress={formatAddress}
            accountAddress={address}
            isShort={isShort}
            testid={testid}
            hideName={false}
          />}
          {!isOwned && isParentToken && <Text >Nested into {parentToken?.collection.tokenPrefix} #{parentToken?.tokenId}</Text>}
          {canCopy && !isParentToken && <CopyButton onClick={onCopyAddress(formatAddress(address) || '')} data-testid={`${testid}-copy`} />}
        </Row>
      </AccountInfoWrapper>
    </StyledLink>
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
      : <Text testid={`${testid}-address`}>{address}</Text>
    }
  </>);
};

const StyledLink = styled(Link)`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: calc(var(--gap) / 2);
`;

const AccountInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${Primary500} !important;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Row = styled.div`
  && {
    display: flex;
    padding: 0;
    align-items: center;
    gap: calc(var(--gap) / 2);

  }
`;
