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
}

export interface ITree {
  dataSource: IData[]
}
