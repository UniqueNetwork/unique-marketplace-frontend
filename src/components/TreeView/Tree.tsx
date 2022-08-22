import React, { FC, useCallback, useState } from 'react';
import { IData, INode, ITree } from './types';
import { Node } from './Node';

/**
 * usage example:
 * <Tree dataSource={dataSource} nodeView={NodeView} onNodeClicked={onNodeClicked}/>
 * */
export const Tree: FC<ITree> = ({ dataSource, nodeView, onNodeClicked }) => {
  const [stateData, setStateData] = useState(dataSource);
  const onTreeNodeClick = useCallback((nodeId: string, event: React.MouseEvent) => {
    function helper(node: IData) {
      node.children.forEach((child) => {
        helper(child);
      });

      if (node.id === nodeId) {
        node.selected = !node.selected;
      } else if (!event.ctrlKey) {
        node.selected = false;
      }
    }

    const newData = {
      id: '#',
      text: '',
      opened: false,
      selected: false,
      children: [...dataSource]
    };

    helper(newData);
    setStateData(newData.children);
    if (onNodeClicked) onNodeClicked(nodeId);
  }, [dataSource, onNodeClicked]);

  return (
    <div>
      {stateData.map((data) => (
        <Node
          key={data.id}
          data={data}
          onTreeNodeClick={onTreeNodeClick}
          nodeView={nodeView}
        >
          {data.children.map((node) => (
            iter({ data: node, onTreeNodeClick, nodeView })
          ))}
        </Node>
      ))}
    </div>
  );
};

/**
 * iterate through datasource and return treenode
 */
function iter({ data, onTreeNodeClick, nodeView }: INode) {
  return (<Node data={data} onTreeNodeClick={onTreeNodeClick} nodeView={nodeView}>
    {data.children.map((val) => {
      return iter({ data: val, onTreeNodeClick, nodeView });
    })}
  </Node>);
}
