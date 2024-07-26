import React, { FC, useCallback, useMemo, MouseEvent, useEffect, useState } from 'react';
import { CopyButton, Text, useNotifications, Link as UILink } from 'components/UI';
import styled from 'styled-components';
import { toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
import DefaultAvatar from 'static/icons/default-avatar.svg';
import { useApi } from 'hooks/useApi';
import { shortcutText } from 'utils/textUtils';
import { Avatar } from '../Avatar/Avatar';
import { Link, generatePath } from 'react-router-dom';
import { Address } from '@unique-nft/utils';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { Grey500, Primary500 } from 'styles/colors';
import { useAccounts } from 'hooks/useAccounts';
import config from 'config';

interface OwnerCardProps {
  address: string
  to?: string
  isShort?: boolean
  canCopy?: boolean
  prefixOwned?: string
  prefixNested?: string
  testid?: string
  notOwned?: boolean
}

export const OwnerCard: FC<OwnerCardProps> = ({
  address,
  to,
  isShort = false,
  canCopy = true,
  prefixOwned,
  prefixNested,
  testid,
  notOwned,
}) => {
  const { chainProperties, api, currentChainId } = useApi();
  const { selectedAccount } = useAccounts();
  const { info } = useNotifications();
  const [parentToken, setParentToken] = useState<TokenByIdResponse>();

  const formatAddress = useCallback((address: string) => {
    if (!address) return '';
    return toChainFormatAddress(address, chainProperties?.SS58Prefix || 0);
  }, [chainProperties?.SS58Prefix]);

  const isParentToken = Address.is.nestingAddress(address);
  const isOwned = !notOwned && !isParentToken && selectedAccount && (Address.is.ethereumAddressInAnyForm(selectedAccount.address)
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
  const linkTo = useMemo(() => to || (isParentToken
    ? generatePath('/:currentChainId/token/:collectionId/:tokenId', {
      currentChainId: currentChainId || null,
      collectionId: parentToken?.collectionId.toString() || '',
      tokenId: parentToken?.tokenId.toString() || ''
    })
    : `${config.blockchains[currentChainId || '']?.scanUrl}account/${address || '404'}`),
  [currentChainId, parentToken, address]);

  return (
    <LinkComponent linkTo={linkTo} isOwned={!to && !!isOwned}>
      {!isOwned && !isParentToken && !!prefixOwned && <Text color='grey-500'>{prefixOwned}</Text>}
      {!isOwned && isParentToken && !!prefixNested && <Text color='grey-500'>{prefixNested}</Text>}
      {!isOwned && <Avatar
        size={24}
        src={parentToken?.image.fullUrl || DefaultAvatar}
        address={!isParentToken ? address : undefined}
      />}
      <AccountInfoWrapper>
        <Row>
          {isOwned && <Text color='grey-500' >You own it</Text>}
          {!isOwned && !isParentToken && <FormattedAddress
            formatAddress={formatAddress}
            accountAddress={address}
            isShort={isShort}
            testid={testid}
            hideName={false}
          />}
          {!isOwned && isParentToken && <Text >{parentToken?.collection.tokenPrefix} #{parentToken?.tokenId}</Text>}
          {canCopy && !isParentToken && <CopyButton onClick={onCopyAddress(formatAddress(address) || '')} data-testid={`${testid}-copy`} />}
        </Row>
      </AccountInfoWrapper>
    </LinkComponent>
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
  gap: calc(var(--prop-gap) / 2);
  &>div>div>span {
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${Primary500} !important;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyledExternalLink = styled(UILink)`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: calc(var(--prop-gap) / 2);
  &>span:hover {
    text-decoration: none;
  }
  &>div>div>span {
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${Primary500} !important;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: calc(var(--prop-gap) / 2);
  &>span:hover {
    text-decoration: none;
  }
  &>div>div>span {
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${Grey500} !important;
    &:hover {
      text-decoration: none  !important;
    }
  }
`;

const AccountInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Row = styled.div`
  && {
    display: flex;
    padding: 0;
    align-items: center;
    gap: calc(var(--prop-gap) / 2);

  }
`;

const LinkComponent: FC<{ linkTo: string, isOwned: boolean }> = ({ children, linkTo, isOwned }) => {
  if (isOwned) return <StyledContainer>{children}</StyledContainer>;
  return linkTo.startsWith('https://')
    ? <StyledExternalLink target='_blank' href={linkTo}>{children}</StyledExternalLink>
    : <StyledLink to={linkTo}>{children}</StyledLink>;
};
