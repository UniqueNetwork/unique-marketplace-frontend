import React, { FC, useCallback, useState } from 'react';
import { Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { AdditionalDark, AdditionalLight, Coral100, Coral500, Grey300, Primary500, Primary600 } from 'styles/colors';
import { Picture } from '../../Picture';
import { INestingToken, ITokenCard } from '../types';
import { useCollection } from '../useCollection';
import Skeleton from '../../Skeleton/Skeleton';
import { Dropdown } from 'components/UI/Dropdown/Dropdown';
import { Icon } from 'components/IconTest/IconTest';

function TokenCard({ token, onViewNodeDetails, onUnnestClick, onTransferClick }: ITokenCard) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { isCollectionLoading, collection } = useCollection(token.collectionId);

  const onTransfer = useCallback(() => {
    onTransferClick?.(token);
  }, [token, onTransferClick]);

  const onUnnest = useCallback(() => {
    onUnnestClick?.(token);
  }, [token, onUnnestClick]);

  const showMenu = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const hideMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const viewTokenDetails = useCallback(() => {
    if (onViewNodeDetails) onViewNodeDetails(token);
  }, [onViewNodeDetails, token]);

  return (
    <TokenCardWrapper onMouseEnter={showMenu} onMouseLeave={hideMenu} onClick={viewTokenDetails}>
      <Picture alt={`T-${token.tokenId} C-${token.collectionId}`} src={(typeof token.image === 'string' ? token.image : token.image?.fullUrl) || undefined}/>
      <TokenTitle
        token={token}
        mode={collection?.mode || ''}
        prefix={collection?.tokenPrefix || ''}
        isCollectionLoading={isCollectionLoading}
      />
      {token.nestingChildTokens && <Text color='grey-500' size='xs'>{token.nestingChildTokens.length} item{token.nestingChildTokens.length > 1 && 's'}</Text>}
      {(menuVisible && token.isCurrentAccountOwner) && <ActionsMenuWrapper className={'menu'}>
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
            <Icon size={32} name={'meatball-menu-dark'} color={'transparent'}/>
          </DropdownWrapper>
        </Dropdown>
      </ActionsMenuWrapper>}
    </TokenCardWrapper>
  );
}

const TokenCardWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  background-color: ${AdditionalLight};
  .picture {
    width: 128px;
    height: 128px;
    img {
      border-radius: 4px;
      max-width: 100%;
      max-height: 100%;
      object-fit: fill;
    }
  }
  span:first-of-type,
  span:last-of-type {
    margin-top: calc(var(--gap) / 2);
  }
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
    .menu { display: flex; }
  }
`;

const ActionsMenuWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  right: 0;

  div[class*=DropdownMenuButtonWrapper] {
    & > button {
      padding: 4px;
      background-color: ${AdditionalDark};
      border: 2px solid #FFFFFF;
      border-radius: 4px;
      color: ${AdditionalLight};
      height: 32px;
      &:hover {
        background-color: ${AdditionalDark};
      }
    }
    & > img {
      display: none;
    }
  }
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

const TokenTitle: FC<{isCollectionLoading: boolean, prefix: string, token: INestingToken, mode: string }> = ({ isCollectionLoading, prefix, token, mode }) => {
  if (isCollectionLoading) return <Skeleton height={52} width={62} />;
  return (
    <>
      <Text color='additional-dark' size='m'>{prefix} #{token.tokenId}</Text>
      <Text color='grey-500' size='s'>{mode}</Text>
    </>
  );
};
