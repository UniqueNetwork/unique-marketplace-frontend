import React, { FC, useCallback, useState } from 'react';
import { INode } from './types';
import styled from 'styled-components';

export const Node: FC<INode> = ({ data, onTreeNodeClick, nodeView: NodeView, children }) => {
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
      <NodeView
        arrowClicked={arrowClicked}
        isOpened={isOpened}
        data={data}
        textClicked={textClicked}
      >{children}</NodeView>
    </NodeContainer>
  );
};

const NodeContainer = styled.div<{ isOpened: boolean }>`
  & > div > .treenode {
    display: ${({ isOpened }) => (!isOpened ? 'none' : 'block')};
  }
`;
