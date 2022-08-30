import React, { FC, useCallback, useState } from 'react';
import { Dropdown, Icon, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { AdditionalDark, AdditionalLight, Coral500, Grey100, Grey300, Primary500 } from 'styles/colors';
import { IData } from '../TreeView/types';
import { Picture } from '../Picture';

interface IProps {
  selectedToken: IData | null
}

export const NestedSection: FC<IProps> = ({ selectedToken }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const onTransfer = useCallback(() => {
    console.log('onTransfer');
  }, []);

  const onUnnest = useCallback(() => {
    console.log('onUnnest');
  }, []);

  const showMenu = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const hideMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  return (
    <NestedDetails>
      {selectedToken && <Text color='additional-dark' size='l'>Nested in T-{selectedToken.tokenId} C-{selectedToken.collectionId}</Text>}
      <NestedTokens>
        {selectedToken?.nestingChildTokens?.map((token) => (
          <TokenCard key={`T-${token.tokenId} C-${token.collectionId}`} onMouseEnter={showMenu} onMouseLeave={hideMenu}>
            <Picture alt={`T-${token.tokenId} C-${token.collectionId}`} src={token.image.fullUrl || undefined}/>
            <Text color='additional-dark' size='m'>{`T-${token.tokenId} C-${token.collectionId}`}</Text>
            <Text color='grey-500' size='s'>NFT</Text>
            {token.nestingChildTokens && <Text color='grey-500' size='xs'>{token.nestingChildTokens.length} item{token.nestingChildTokens.length > 1 && 's'}</Text>}
            {menuVisible && <ActionsMenuWrapper className={'menu'}>
              <Dropdown
                placement={'left'}
                dropdownRender={() => (<DropdownMenu>
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
                </DropdownMenu>)}
              >
                <DropdownWrapper>
                  <Icon size={24} name={'more-horiz'} color={AdditionalLight}/>
                </DropdownWrapper>
              </Dropdown>
            </ActionsMenuWrapper>}
          </TokenCard>
        ))}
      </NestedTokens>
    </NestedDetails>
  );
};

const NestedDetails = styled.div`
  padding: 16px 32px;
  background-color: ${Grey100};
  width: calc(100vw - 780px);
`;

const NestedTokens = styled.div`
  margin-top: var(--gap);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const TokenCard = styled.div`
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
      width: 100%;
      height: 100%;
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
`;

const UnnestMenuItem = styled(DropdownMenuItem)`
  color: ${Coral500};
`;

const DropdownWrapper = styled.div`
  background: var(--color-additional-dark);
  border-radius: 4px;
  padding: calc(var(--gap) / 4) calc(var(--gap) / 4) 0 calc(var(--gap) / 4);
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
