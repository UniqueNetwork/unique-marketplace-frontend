import React, { FC, useCallback, useMemo, useState } from 'react';
import { Icon } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { AdditionalDark, AdditionalLight, BlueGrey500, Coral100, Coral500, Grey300, Primary200, Primary400, Primary500, Primary600, Secondary400 } from 'styles/colors';
import Square from 'static/icons/square.svg';
import Pin from 'static/icons/pin.svg';
import { INodeView } from '../../TreeView/types';
import { Picture } from '../../Picture';
import { INestingToken } from '../types';
import { useParams } from 'react-router-dom';
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize';
import MobileModalActions from './MobileModalActions';
import Skeleton from '../../Skeleton/Skeleton';
import { useCollection } from '../useCollection';
import Triangle from 'static/icons/triangle.svg';
import MeatballMenu from 'static/icons/meatball-menu.svg';
import { Dropdown } from 'components/UI/Dropdown/Dropdown';

const NodeView: FC<INodeView<INestingToken>> = ({
  arrowClicked,
  isOpened,
  data,
  textClicked,
  isFirst,
  level,
  isSelected,
  children,
  onViewNodeDetails,
  onTransferClick,
  onUnnestClick
}) => {
  const { id, collectionId } = useParams<{ id: string, collectionId: string}>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const deviceSize = useDeviceSize();
  const { isCollectionLoading, collection } = useCollection(data.collectionId);

  const onClick = useCallback((event: React.MouseEvent) => {
    if (deviceSize === DeviceSize.sm) setModalVisible(true);
    else textClicked(event);
  }, [deviceSize, textClicked]);

  const onTransfer = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    onTransferClick?.(data);
    event.stopPropagation();
  }, [onTransferClick, data]);

  const onUnnest = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    onUnnestClick?.(data);
    event.stopPropagation();
  }, [onUnnestClick, data]);

  const showMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    setMenuVisible(true);
    event.stopPropagation();
  }, []);

  const hideMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const tokenMenuActions = useMemo(() => {
    return (
      <>
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
      </>
    );
  }, [onTransfer, onUnnest]);

  const viewTokenDetails = useCallback(() => {
    if (onViewNodeDetails) onViewNodeDetails(data);
    setModalVisible(false);
  }, [onViewNodeDetails, data]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const isCurrent = id === data.tokenId.toString() && collectionId === data.collectionId.toString();

  return (
    <>
      <ViewContainer
        isFirst={isFirst}
        onClick={onClick}
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
            {!!children && <Icon size={16} file={Triangle} color={Primary500} />}
          </Arrow>
          <Picture alt={`T-${data.tokenId} C-${data.collectionId}`} src={(typeof data.image === 'string' ? data.image : data.image?.fullUrl) || undefined}/>
          <TokenTitle token={data} isCollectionLoading={isCollectionLoading} prefix={collection?.tokenPrefix || ''}/>
        </NftInfo>
        <Actions>
          {deviceSize !== DeviceSize.sm && <ActionButtons className={'action-buttons'}>
            {menuVisible && <ActionsMenuWrapper className={'menu'}>
              <Dropdown
                placement={'left'}
                dropdownRender={() => (<DropdownMenu>
                  {tokenMenuActions}
                </DropdownMenu>)}
              >
                <Icon size={32} file={MeatballMenu} color={Secondary400}/>
              </Dropdown>
            </ActionsMenuWrapper>}
            {!isCurrent && <div onClick={viewTokenDetails}>
              <Icon size={32} file={Square} color={Secondary400}/>
            </div>}
          </ActionButtons>}
          {isCurrent && <PinIcon className={'pin-icon'}>
            <Icon size={32} file={Pin}/>
          </PinIcon>}
        </Actions>
        <hr/>
      </ViewContainer>
      <MobileModalActions isVisible={modalVisible} onClose={closeModal}>
        <ViewTokenAction onClick={viewTokenDetails}>Go to the token page
          <IconWrapper>
            <Icon name={'arrow-up-right'} size={16} color={'var(--color-primary-500)'} />
          </IconWrapper>
        </ViewTokenAction>
        {tokenMenuActions}
      </MobileModalActions>
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
  min-width: 524px;
  border: 1px solid ${({ isSelected }) => isSelected ? Primary200 : 'transparent'};
  hr {
    position: absolute;
    border-top: 1px dashed ${Grey300};
    border-left: none;
    bottom: -3px;
    width: 100%;
    z-index: 0;
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
    border: 1px solid ${Primary400};
    hr {
      display: none;
    }
    .action-buttons { display: flex; }
  }
  background-color: ${({ isSelected }) => (isSelected && Primary200)} !important;
`;

const NftInfo = styled.div`
  display: flex;
  align-items: center;
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
  margin-right: 24px;
`;

const ActionButtons = styled.div`
  gap: 4px;
  display: none;
  align-items: center;
  svg:hover {
    fill: ${Primary500};
  }
`;

const PinIcon = styled.div`
`;

const Arrow = styled.div<{ isOpened: boolean | undefined, isFirst: boolean | undefined, level: number }>`
  cursor: pointer;
  display: inline-block;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  transition: 0.2s;
  transform: ${({ isOpened }) => (!isOpened && 'rotate(180deg)')};
  margin-left: ${({ isFirst, level }) => (isFirst ? 24 : 24 + 16 * level)}px;
  width: 16px;
`;

const ActionsMenuWrapper = styled.div`
  display: flex;
  position: relative;

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
    position: absolute;
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

const ViewTokenAction = styled(TransferMenuItem)`
  border-top: 1px dashed ${Grey300};
  svg {
    transform: rotateX(180deg);
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

export default NodeView;

const TokenTitle: FC<{isCollectionLoading: boolean, prefix: string, token: INestingToken}> = ({ isCollectionLoading, prefix, token }) => {
  if (isCollectionLoading) return <Skeleton height={24} width={60} />;
  return (
    <TitleContainer>
      <Name>{prefix} #{token.tokenId}</Name>
      {token.nestingChildTokens?.length > 0 && <NestedCount>{token.nestingChildTokens.length} item{token.nestingChildTokens.length > 1 && 's'}</NestedCount>}
    </TitleContainer>
  );
};

const TitleContainer = styled.div`
  cursor: pointer;
  display: inline-block;
`;

const Name = styled.p`
  font-size: 16px;
  line-height: 24px;
  color: ${AdditionalDark};
`;

const NestedCount = styled.p`
  font-size: 12px;
  line-height: 18px;
  color: ${BlueGrey500};
`;
