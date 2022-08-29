import React, { FC, useCallback, useState } from 'react';
import { INode } from './types';
import styled from 'styled-components';

export const Node: FC<INode> = ({ data, onNodeClicked, nodeView: NodeView, isFirst, level, children }) => {
  const [isOpened, setIsOpened] = useState(data.opened);
  const [isSelected, setIsSelected] = useState(!!data.selected);

  const arrowClicked = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpened(!isOpened);
  }, [isOpened]);

  const textClicked = useCallback(() => {
    setIsSelected(!isSelected);
    if (onNodeClicked) onNodeClicked(data);
  }, [isSelected, data, onNodeClicked]);

  return (
    <NodeContainer isOpened={!!isOpened} className={'treenode'}>
      <NodeView
        arrowClicked={arrowClicked}
        isOpened={!!isOpened}
        data={data}
        textClicked={textClicked}
        isFirst={isFirst}
        level={level}
        isSelected={isSelected}
      >{children}</NodeView>
    </NodeContainer>
  );
};

const NodeContainer = styled.div<{ isOpened: boolean }>`
  & > div + .treenode {
    display: ${({ isOpened }) => (!isOpened ? 'none' : 'block')};
  }
`;
