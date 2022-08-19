import React, { FC, useCallback, useMemo, useState } from 'react';
import { INode } from './types';
import styled from 'styled-components';
import { Icon } from '@unique-nft/ui-kit';

export const Node: FC<INode> = ({ data, onTreeNodeClick, children }) => {
  const [isOpened, setIsOpened] = useState(data.opened);

  const arrowClicked = useCallback(() => {
    setIsOpened(!isOpened);
  }, [isOpened]);

  const textClicked = useCallback((event: React.MouseEvent) => {
    if (onTreeNodeClick) onTreeNodeClick(data.id, event);
    else arrowClicked();
  }, [onTreeNodeClick, arrowClicked, data]);

  return (
    <NodeContainer isOpened={isOpened} className={'treenode'}>
      <Arrow onClick={arrowClicked} isOpened={isOpened}><Icon size={14} name={data.children.length ? 'triangle' : ''} /></Arrow>
      <IconStyled size={16} name={data.icon || 'badge-nft'}></IconStyled>
      <Name onClick={textClicked} isSelected={data.selected}>{data.text}</Name>
      {children}
    </NodeContainer>
  );
};

const NodeContainer = styled.div<{ isOpened: boolean }>`
  margin-left: 24px;
  margin-top: 8px;
  & > .treenode {
    display: ${({ isOpened }) => (!isOpened ? 'none' : 'block')};
  }
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
