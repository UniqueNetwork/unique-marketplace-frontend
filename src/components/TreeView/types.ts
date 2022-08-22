import React from 'react';

export interface IData {
  id: string
  text: string
  icon?: string
  opened: boolean
  disabled?: boolean
  selected: boolean
  children: IData[]
}

export type TTreeNodeClickHandler = (id: string, event: React.MouseEvent) => void

export interface INode {
  data: IData
  onTreeNodeClick?: TTreeNodeClickHandler
  nodeView: React.FC<INodeView>
}

export interface INodeView {
  arrowClicked: () => void
  isOpened: boolean
  data: IData
  textClicked: (event: React.MouseEvent) => void
}

export interface ITree {
  dataSource: IData[]
  nodeView: React.FC<INodeView>
  onNodeClicked?: (id: string) => void
}
