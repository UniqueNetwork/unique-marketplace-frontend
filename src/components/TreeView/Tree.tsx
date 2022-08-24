import React, { FC, useCallback, useState } from 'react';
import { IData, INode, ITree } from './types';
import { Node } from './Node';

/**
 * usage example:
 * <Tree dataSource={dataSource} nodeView={NodeView} onNodeClicked={onNodeClicked}/>
 * */
export const Tree: FC<ITree> = ({ dataSource, nodeView, onNodeClicked }) => {
  // const [stateData, setStateData] = useState(dataSource);
  // const onTreeNodeClick = useCallback((nodeId: number, collectionId: number) => {
  //   function helper(node: IData) {
  //     node.nestingChildTokens.forEach((child) => {
  //       helper(child);
  //     });
  //
  //     if (node.tokenId === nodeId) {
  //       node.selected = !node.selected;
  //     }
  //   }
  //
  //   const newData = {
  //     tokenId: -1,
  //     collectionId: -1,
  //     owner: '',
  //     opened: false,
  //     selected: false,
  //     nestingChildTokens: [...dataSource],
  //     attributes: {},
  //     image: { ipfsCid: '', fullUrl: '' }
  //   };
  //
  //   helper(newData);
  //   setStateData(newData.nestingChildTokens);
  //   if (onNodeClicked) onNodeClicked(nodeId, collectionId);
  // }, [dataSource, onNodeClicked]);

  return (
    <div>
      {dataSource.map((data, index) => (
        <Node
          key={`T${data.tokenId}C${data.collectionId}`}
          data={data}
          onNodeClicked={onNodeClicked}
          nodeView={nodeView}
          isFirst={index === 0}
        >
          {data.nestingChildTokens?.map((node) => (
            iter({ data: node, onNodeClicked, nodeView })
          ))}
        </Node>
      ))}
    </div>
  );
};

/**
 * iterate through datasource and return treenode
 */
function iter({ data, onNodeClicked, nodeView }: INode) {
  return (<Node data={data} onNodeClicked={onNodeClicked} nodeView={nodeView}>
    {data.nestingChildTokens?.map((val) => {
      return iter({ data: val, onNodeClicked, nodeView });
    })}
  </Node>);
}
