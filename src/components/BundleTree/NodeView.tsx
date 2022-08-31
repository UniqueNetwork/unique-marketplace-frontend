import React, { FC, useCallback, useState } from 'react';
import { Dropdown, Icon } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { AdditionalDark, AdditionalLight, Coral500, Grey300, Primary100, Primary200, Primary400, Primary500, Secondary400 } from 'styles/colors';
import Square from 'static/icons/square.svg';
import Pin from 'static/icons/pin.svg';
import { INodeView } from '../TreeView/types';
import { Picture } from '../Picture';

const NodeView: FC<INodeView> = ({ arrowClicked, isOpened, data, textClicked, isFirst, level, isSelected, children }) => {
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
    <>
      <ViewContainer
        isFirst={isFirst}
        onClick={textClicked}
        isSelected={isSelected}
        onMouseEnter={showMenu}
        onMouseLeave={hideMenu}
      >
        <NftInfo>
          <Arrow
            isFirst={isFirst}
            level={level}
            onClick={arrowClicked}
            isOpened={isOpened}
          >
            <Icon size={16} name={data.nestingChildTokens?.length ? 'triangle' : ''} color={Primary500} />
          </Arrow>
          <Picture alt={`T-${data.tokenId} C-${data.collectionId}`} src={data.image.fullUrl || undefined}/>
          <Name>T-{data.tokenId} C-{data.collectionId}</Name>
        </NftInfo>
        <ActionButtons className={'action-buttons'}>
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
              <Icon size={32} name={'more-horiz'} color={Secondary400}/>
            </Dropdown>
          </ActionsMenuWrapper>}
          <Icon size={32} file={Square} color={Secondary400}/>
        </ActionButtons>
        {isSelected && <PinIcon className={'pin-icon'}>
          <Icon size={32} file={Pin}/>
        </PinIcon>}
        <hr/>
      </ViewContainer>
      {isOpened ? children : null}
    </>
  );
};

const ViewContainer = styled.div<{ isFirst: boolean | undefined, isSelected: boolean | undefined }>`
  height: 58px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border: 1px solid transparent;
  hr {
    position: absolute;
    border-top: 1px dashed var(--color-grey-300);
    border-left: none;
    bottom: 0;
    width: 100%;
  }
  .picture {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin-left: var(--gap);
    margin-right: calc(var(--gap) / 2);
    img {
      border-radius: 4px;
      width: 100%;
      height: 100%;
      object-fit: fill;
    }
  }
  &:hover {
    background: ${Primary100};
    border: 1px solid ${Primary400};
    
    .action-buttons { display: flex; }
    .pin-icon { display: none; }
  }
  background-color: ${({ isSelected }) => (isSelected && Primary200)} !important;
`;

const NftInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButtons = styled.div`
  margin-right: 24px;
  gap: 4px;
  display: none;
  align-items: center;
`;

const PinIcon = styled.div`
  margin-right: 24px;
`;

const Arrow = styled.div<{ isOpened: boolean | undefined, isFirst: boolean | undefined, level: number }>`
  cursor: pointer;
  display: inline-block;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  transform: ${({ isOpened }) => (!isOpened && 'rotate(-90deg)')};
  margin-left: ${({ isFirst, level }) => (isFirst ? 24 : 24 + 16 * level)}px;
`;

const Name = styled.p`
  cursor: pointer;
  display: inline-block;
  font-size: 16px;
  line-height: 24px;
  color: ${AdditionalDark};
`;

const ActionsMenuWrapper = styled.div`
  display: flex;

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

export default NodeView;
