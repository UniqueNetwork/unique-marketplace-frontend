import React, { useCallback, useEffect, useState } from 'react';
import { INode, INodeContainer, ITree } from './types';
import { Node } from './Node';

const level = 1;
export function Tree<T extends INode>({ dataSource, nodeView, onNodeClicked, className, compareNodes, childrenProperty, getKey, onViewNodeDetails }: ITree<T>) {
  const [dataSourceState, setDataSourceState] = useState(dataSource);

  useEffect(() => {
    setDataSourceState(dataSource);
  }, [dataSource]);

  const nodeClickHandler = useCallback((data: T) => {
    const selectNode = (node: any) => {
      if (compareNodes(node, data)) {
        node.selected = !node.selected;
      } else node.selected = false;
      node[childrenProperty]?.forEach((child: T) => {
        return selectNode(child);
      });
      return node;
    };

    const newDataSourceState = [...dataSourceState];
    setDataSourceState([selectNode(newDataSourceState[0])]);

    if (onNodeClicked) onNodeClicked(data);
  }, [onNodeClicked, dataSourceState]);

  return (
    <div className={className || ''}>
      {dataSourceState.map((data: any, index) => (
        <Node<T>
          key={getKey(data)}
          data={data}
          onNodeClicked={nodeClickHandler}
          nodeView={nodeView}
          isFirst={index === 0}
          level={level}
          getKey={getKey}
          childrenProperty={childrenProperty}
          onViewNodeDetails={onViewNodeDetails}
        >
          {data[childrenProperty]?.map((node: T) => (
            iter<T>({ data: node, onNodeClicked: nodeClickHandler, nodeView, level, getKey, childrenProperty, onViewNodeDetails })
          ))}
        </Node>
      ))}
    </div>
  );
}

// iterate through datasource and return treenode
function iter<T extends INode>({ data, onNodeClicked, nodeView, level, getKey, childrenProperty, onViewNodeDetails }: INodeContainer<T>) {
  const nextLevel = Number(level) + 1;
  return (<Node
    key={getKey(data)}
    data={data}
    onNodeClicked={onNodeClicked}
    nodeView={nodeView}
    level={nextLevel}
    getKey={getKey}
    childrenProperty={childrenProperty}
    onViewNodeDetails={onViewNodeDetails}
  >
    {(data as any)[childrenProperty]?.map((val: T) => {
      return iter({ data: val, onNodeClicked, nodeView, level: nextLevel, childrenProperty, getKey, onViewNodeDetails });
    })}
  </Node>);
}
