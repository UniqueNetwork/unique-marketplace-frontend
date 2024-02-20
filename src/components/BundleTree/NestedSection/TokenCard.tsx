import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Text, Tooltip } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { AdditionalLight, Coral100, Coral500, Grey300, Primary500, Primary600, Secondary400, Secondary500 } from 'styles/colors';
import { Picture } from '../../TokenMedia/Picture';
import { INestingToken, ITokenCard } from '../types';
import { useCollection } from '../useCollection';
import Skeleton from '../../Skeleton/Skeleton';
import { Dropdown } from 'components/UI/Dropdown/Dropdown';
import { Icon } from 'components/UI/Icon/Icon';
import { useApi } from 'hooks/useApi';
import { TokenByIdResponse } from '@unique-nft/sdk';

function TokenCard({ tokenId, collectionId, fixedWidth, token: initialToken, onViewNodeDetails, onUnnestClick, onTransferClick, isCurrentAccountOwner }: ITokenCard) {
  const [token, setToken] = useState<INestingToken | TokenByIdResponse | null>(initialToken || null);
  const [menuVisible, setMenuVisible] = useState(false);
  const { isCollectionLoading, collection } = useCollection(collectionId);
  const meatballIconMenu = useRef(null);
  const { api } = useApi();

  useEffect(() => {
    if (!api?.nft || initialToken) return;
    (async () => {
      setToken(await api.nft!.getToken(collectionId, tokenId));
    })();
  }, [initialToken, api]);

  const onTransfer = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    onTransferClick?.(token as INestingToken);
    event.stopPropagation();
  }, [token, onTransferClick]);

  const onUnnest = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    onUnnestClick?.(token as INestingToken);
    event.stopPropagation();
  }, [token, onUnnestClick]);

  const showMenu = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const hideMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const viewTokenDetails = useCallback(() => {
    if (onViewNodeDetails) onViewNodeDetails(token as INestingToken, collection?.mode || 'NFT');
  }, [onViewNodeDetails, token, collection]);

  if (!token) return <Skeleton />;

  return (
    <TokenCardWrapper fixedWidth={fixedWidth}
      onMouseEnter={showMenu}
      onMouseLeave={hideMenu}
      onClick={viewTokenDetails}
    >
      <Picture alt={`T-${token.tokenId} C-${token.collectionId}`} src={(typeof token.image === 'string' ? token.image : token.image?.fullUrl) || undefined}/>
      <TokenTitle
        token={token}
        prefix={collection?.tokenPrefix || ''}
        collectionName={`${collection?.name}`}
        isCollectionLoading={isCollectionLoading}
      />
      {(menuVisible && isCurrentAccountOwner) && <ActionsMenuWrapper className={'menu'}>
        <Tooltip
          align={{ vertical: 'top', horizontal: 'middle', appearance: 'vertical' }}
          targetRef={meatballIconMenu}
        >
          Open additional menu
        </Tooltip>
        <Dropdown
          placement={'left'}
          dropdownRender={() => (
            <DropdownMenu>
              <TransferMenuItem onClick={onTransfer}>Transfer
                <IconWrapper>
                  <Icon name={'sorting-initial'} size={16} color={'var(--color-primary-500)'} />
                </IconWrapper>
              </TransferMenuItem>
              <UnnestMenuItem onClick={onUnnest}>Unnest token
                <IconWrapper>
                  <Icon name={'logout'} size={16} color={'var(--color-coral-500)'} />
                </IconWrapper>
              </UnnestMenuItem>
            </DropdownMenu>
          )}
        >
          <DropdownWrapper>
            <Icon
              size={32}
              name={'meatball-menu-dark'}
              color={'transparent'}
              ref={meatballIconMenu}
            />
          </DropdownWrapper>
        </Dropdown>
      </ActionsMenuWrapper>}
    </TokenCardWrapper>
  );
}

const TokenCardWrapper = styled.div<{ fixedWidth?: boolean }>`
  max-width: ${({ fixedWidth }) => fixedWidth ? '250px' : 'undefined'};
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border-radius: 8px;
  background-color: ${AdditionalLight};
  .picture {
    overflow: hidden;
    border-radius: var(--prop-border-radius) var(--prop-border-radius) 0 0;
    position: relative;
    transform: translateZ(0px);
    flex: 1;
    img {
      border-radius: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  /* span:first-of-type,
  span:last-of-type {
    margin-top: calc(var(--gap) / 2);
  } */
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
    .menu { display: flex; }
  }
`;

const ActionsMenuWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 8px;
  right: 8px;
  div[class*=DropdownMenuDropdown] {
    width: max-content;
    & > div {
      padding: calc(var(--gap) / 2) var(--gap);
      display: flex;
    }
  }

`;

const DropdownMenu = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  min-width: 138px;
`;

const DropdownMenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 16px;
  line-height: 24px;
  &:hover {
    background: var(--color-primary-100);
  }
`;

const TransferMenuItem = styled(DropdownMenuItem)`
  border-bottom: 1px dashed ${Grey300};
  color: ${Primary500};
  &:hover {
    color: ${Primary600};
  }
`;

const UnnestMenuItem = styled(DropdownMenuItem)`
  color: ${Coral500};
  &:hover {
    background-color: ${Coral100};
  }
`;

const DropdownWrapper = styled.div`
  & svg {
    fill: ${Secondary500};
    &:hover {
      fill: ${Secondary400};
    }
  }
`;

const IconWrapper = styled.div`
  && {
    width: 16px;
    height: 16px;
    margin-left: 4px;
    transform: rotate(-90deg);

    path {
      stroke: currentColor;
    }
  }
`;

export default TokenCard;

const TokenTitle: FC<{isCollectionLoading: boolean, prefix: string, token: INestingToken | TokenByIdResponse, collectionName: string }> = ({ isCollectionLoading, prefix, token, collectionName }) => {
  if (isCollectionLoading) return <Skeleton height={52} width={62} />;
  return (
    <TokenTitleWrapper>
      <Text color='additional-dark' size='m'>{prefix} #{token.tokenId}</Text>
      <Text color='primary-500' size='s'>{collectionName}</Text>
    </TokenTitleWrapper>
  );
};

const TokenTitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-top: 1px solid var(--color-blue-grey-300);
`;
