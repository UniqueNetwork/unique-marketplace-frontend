import React, { FC, useCallback, useState } from 'react';
import { IData, INode, ITree } from './types';
import { Node } from './Node';

const level = 1;
export const Tree: FC<ITree> = ({ dataSource, nodeView, onNodeClicked }) => {
  return (
    <div>
      {dataSource.map((data, index) => (
        <Node
          key={`T${data.tokenId}C${data.collectionId}`}
          data={data}
          onNodeClicked={onNodeClicked}
          nodeView={nodeView}
          isFirst={index === 0}
          level={level}
        >
          {data.nestingChildTokens?.map((node) => (
            iter({ data: node, onNodeClicked, nodeView, level })
          ))}
        </Node>
      ))}
    </div>
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
