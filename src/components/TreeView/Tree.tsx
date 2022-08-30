import React, { FC, useCallback, useState } from 'react';
import { IData, INode, ITree } from './types';
import { Node } from './Node';

const level = 1;
export const Tree: FC<ITree> = ({ dataSource, nodeView, onNodeClicked }) => {
  const [dataSourceState, setDataSourceState] = useState(dataSource);

  const nodeClickHandler = useCallback((data: IData) => {
    const selectNode = (node: IData) => {
      if (node.collectionId === data.collectionId && node.tokenId === data.tokenId) {
        node.selected = !node.selected;
      } else node.selected = false;
      node.nestingChildTokens?.forEach((child) => {
        return selectNode(child);
      });
      return node;
    };

    const newDataSourceState = [...dataSourceState];
    setDataSourceState([selectNode(newDataSourceState[0])]);

    if (onNodeClicked) onNodeClicked(data);
  }, [onNodeClicked]);

  return (
    <>
      {dataSourceState.map((data, index) => (
        <Node
          key={`T${data.tokenId}C${data.collectionId}`}
          data={data}
          onNodeClicked={nodeClickHandler}
          nodeView={nodeView}
          isFirst={index === 0}
          level={level}
        >
          {data.nestingChildTokens?.map((node) => (
            iter({ data: node, onNodeClicked: nodeClickHandler, nodeView, level })
          ))}
        </Node>
      ))}
    </>
  );
};

// iterate through datasource and return treenode
function iter({ data, onNodeClicked, nodeView, level }: INode) {
  const nextLevel = level + 1;
  return (<Node
    data={data}
    onNodeClicked={onNodeClicked}
    nodeView={nodeView}
    level={nextLevel}
  >
    {data.nestingChildTokens?.map((val) => {
      return iter({ data: val, onNodeClicked, nodeView, level: nextLevel });
    })}
  </Node>);
}
