import React from 'react';

export interface INodeView<T> {
  arrowClicked: (event: React.MouseEvent) => void
  isOpened: boolean
  isSelected: boolean
  isParentSelected: boolean
  data: T
  textClicked: (event: React.MouseEvent) => void
  isFirst?: boolean
  level: number
  onViewNodeDetails?: (node: T, mode: string) => void
  onUnnestClick?: (node: T) => void
  onTransferClick?: (node: T) => void
}

export interface INode {
  opened?: boolean
  disabled?: boolean
  selected?: boolean
  parentSelected?: boolean
}

export type TTreeNodeClickHandler<T> = (data: T) => void

export interface INodeContainer<T> {
  data: T
  nodeView: React.FC<INodeView<T>>
  onNodeClicked: TTreeNodeClickHandler<T>
  getKey: (a: T) => string
  childrenProperty: keyof T
  isFirst?: boolean
  level: number
  children?: React.ReactNode
  onViewNodeDetails?: (node: T, mode: string) => void
  onUnnestClick?: (node: T) => void
  onTransferClick?: (node: T) => void
}

export interface ITree<T> {
  dataSource: T[]
  nodeView: React.FC<INodeView<T>>
  onNodeClicked: TTreeNodeClickHandler<T>
  className?: string
  compareNodes: (a: T, b: T) => boolean
  getKey: (a: T) => string
  childrenProperty: keyof T
  onViewNodeDetails?: (node: T, mode: string) => void
  onUnnestClick?: (node: T) => void
  onTransferClick?: (node: T) => void
}

export interface IBundleTree<T> extends ITree<T>{
  nestedSectionView?: React.FC<INestedSectionView<T>>
  showTree?: boolean
}

export interface INestedSectionView<T> {
  selectedToken: T | null
  onViewNodeDetails?: (node: T, mode: string) => void
  onUnnestClick?: (node: T) => void
  onTransferClick?: (node: T) => void
}
