import React, { FC } from 'react';
import { Icon } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { INodeView } from './types';

const NodeView: FC<INodeView> = ({ arrowClicked, isOpened, data, textClicked, isFirst, children }) => {
  return (
    <ViewContainer isFirst={isFirst}>
      <Arrow onClick={arrowClicked} isOpened={isOpened}><Icon size={14} name={data.nestingChildTokens?.length ? 'triangle' : ''} /></Arrow>
      <IconStyled size={16} name={data.image.fullUrl || 'badge-nft'}></IconStyled>
      <Name onClick={textClicked} isSelected={!!data.selected}>T-#{data.tokenId} C-#{data.collectionId}</Name>
      {children}
    </ViewContainer>
  );
};

const ViewContainer = styled.div<{ isFirst: boolean | undefined }>`
  padding-left: ${({ isFirst }) => (isFirst ? 'calc(var(--gap) * 1.5)' : 'calc(var(--gap) * 3)')};
  padding-top: 8px;
`;

const Arrow = styled.div<{ isOpened: boolean }>`
  cursor: pointer;
  margin-right: 6px;
  display: inline-block;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  transform: ${({ isOpened }) => (!isOpened && 'rotate(-90deg)')};
`;

const IconStyled = styled(Icon)`
  display: inline-block;
  margin: 0;
  padding-right: 10px;
`;

const Name = styled.p<{ isSelected: boolean }>`
  cursor: pointer;
  display: inline-block;

  background-color: ${({ isSelected }) => (isSelected && '#e8efff')};
  box-shadow: ${({ isSelected }) => (isSelected && '0 0 2px #0a6aa1')};
  
  &:hover {
    background-color: #e8eff7;
    box-shadow: 0 0 2px #0a6aa1;
  }
`;

export default NodeView;

const dataSource = [{
  id: '1',
  text: 'myNode',
  icon: '',
  opened: false,
  selected: false,
  children: [{
    id: '3',
    text: 'myNode3',
    icon: '',
    opened: false,
    selected: false,
    children: [
      {
        id: '5',
        text: 'myNode5',
        icon: '',
        opened: false,
        selected: false,
        children: []
      }
    ]
  },
    {
      id: '4',
      text: 'myNode4',
      icon: '',
      opened: false,
      selected: false,
      children: []
    }
  ]
},
  {
    id: '2',
    text: 'myNode2',
    icon: '',
    opened: false,
    selected: false,
    children: []
  }];
