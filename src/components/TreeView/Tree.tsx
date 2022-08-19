import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import { IData, ITree, TTreeNodeClickHandler } from './types';
import { Node } from './Node';

export const Tree: FC<ITree> = ({ dataSource }) => {
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
  }, [dataSource]);

  // console.log('stateData', stateData);

  return (
    <div>
      {stateData.map((data) => (
        <Node key={data.id} data={data} onTreeNodeClick={onTreeNodeClick}>
          {data.children.map((node) => (
            iter(node, onTreeNodeClick)
          ))}
        </Node>
      ))}
    </div>
  );
};

/**
 * iterate through datasource and return treenode
 */
function iter(node: IData, treeNodeClick: TTreeNodeClickHandler) {
  return (<Node data={node} onTreeNodeClick={treeNodeClick}>
    {node.children.map((val) => {
      return iter(val, treeNodeClick);
    })}
  </Node>);
}
