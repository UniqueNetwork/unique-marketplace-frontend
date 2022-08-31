import React from 'react';

export interface INodeView<T> {
  arrowClicked: (event: React.MouseEvent) => void
  isOpened: boolean
  isSelected: boolean
  data: T
  textClicked: (event: React.MouseEvent) => void
  isFirst?: boolean
  level: number
}

export interface INode {
  opened?: boolean
  disabled?: boolean
  selected?: boolean
}

interface INodeChildren<T> {
  [k: string]: T[]
}

export type TTreeNodeClickHandler<T> = (data: T) => void

export interface INodeContainer<T> {
  data: T
  nodeView: React.FC<INodeView<T>>
  onNodeClicked: TTreeNodeClickHandler<T>
  getKey: (a: T) => string
  childrenProperty: string
  isFirst?: boolean
  level: number
  children?: React.ReactNode
}

export interface ITree<T> {
  dataSource: T[]
  nodeView: React.FC<INodeView<T>>
  onNodeClicked: TTreeNodeClickHandler<T>
  className?: string
  compareNodes: (a: T, b: T) => boolean
  getKey: (a: T) => string
  childrenProperty: string
}

export interface IBundleTree<T> extends ITree<T>{
  nestedSectionView: React.FC<INestedSectionView<T>>
}

export interface INestedSectionView<T> {
  selectedToken: T | null
}
