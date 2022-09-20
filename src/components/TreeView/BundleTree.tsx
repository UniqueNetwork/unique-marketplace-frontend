import React, { useCallback, useState } from 'react';
import { Tree } from './Tree';
import { IBundleTree, INode } from './types';

function BundleTree<T extends INode>({
  dataSource,
  nodeView: NodeView,
  onNodeClicked: onNodeClickedProps,
  nestedSectionView: NestedSectionView,
  className,
  compareNodes,
  childrenProperty,
  getKey,
  onViewNodeDetails,
  onUnnestClick,
  onTransferClick
}: IBundleTree<T>) {
  const [selectedToken, setSelectedToken] = useState<T | null>(null);
  const onNodeClicked = useCallback((data: T) => {
    if (!data.selected) setSelectedToken(null);
    else setSelectedToken(data);
    onNodeClickedProps(data);
  }, []);

  return (
    <>
      <Tree<T>
        dataSource={dataSource}
        nodeView={NodeView}
        onNodeClicked={onNodeClicked}
        className={className}
        compareNodes={compareNodes}
        childrenProperty={childrenProperty}
        getKey={getKey}
        onViewNodeDetails={onViewNodeDetails}
        onUnnestClick={onUnnestClick}
        onTransferClick={onTransferClick}
      />
      {NestedSectionView && <NestedSectionView
        selectedToken={selectedToken}
        onViewNodeDetails={onViewNodeDetails}
        onUnnestClick={onUnnestClick}
        onTransferClick={onTransferClick}
      />}
    </>
  );
}

export default BundleTree;
