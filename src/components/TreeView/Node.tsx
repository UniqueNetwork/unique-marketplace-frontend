import React, { useCallback, useState } from 'react';
import { INode, INodeContainer } from './types';
import styled from 'styled-components';
import { classNames } from 'utils/classNames';
import { Primary100 } from 'styles/colors';

export function Node<T extends INode>({ data, onNodeClicked, nodeView: NodeView, isFirst, level, children, onViewNodeDetails, onTransferClick, onUnnestClick }: INodeContainer<T>) {
  const [isOpened, setIsOpened] = useState(data.opened);

  const arrowClicked = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpened(!isOpened);
  }, [isOpened]);

  const textClicked = useCallback(() => {
    if (onNodeClicked) onNodeClicked(data);
  }, [data, onNodeClicked]);

  return (
    <NodeContainer isOpened={!!isOpened} className={classNames({ className: 'treenode', selected: !!data.selected })}>
      <NodeView
        arrowClicked={arrowClicked}
        isOpened={!!isOpened}
        data={data}
        textClicked={textClicked}
        isFirst={isFirst}
        level={level}
        isSelected={!!data.selected}
        onViewNodeDetails={onViewNodeDetails}
        onUnnestClick={onUnnestClick}
        onTransferClick={onTransferClick}
      >{children}</NodeView>
    </NodeContainer>
  );
}

const NodeContainer = styled.div<{ isOpened: boolean }>`
  & > div + .treenode {
    display: ${({ isOpened }) => (!isOpened ? 'none' : 'block')};
    &.selected {
      background-color: ${Primary100};
    }
  }
`;
