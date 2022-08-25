import React from 'react';
import { DecodedAttributes, DecodedInfixOrUrlOrCidAndHash } from '@unique-nft/sdk/tokens';

export interface IData {
  tokenId: number
  collectionId: number
  owner: string
  nestingChildTokens?: IData[]
  attributes: DecodedAttributes
  image: DecodedInfixOrUrlOrCidAndHash
  opened?: boolean
  disabled?: boolean
  selected?: boolean
}

export type TTreeNodeClickHandler = (data: IData) => void

export interface INode {
  data: IData
  onNodeClicked?: TTreeNodeClickHandler
  nodeView: React.FC<INodeView>
  isFirst?: boolean
  level: number
}

export interface INodeView {
  arrowClicked: () => void
  isOpened: boolean
  data: IData
  textClicked: (event: React.MouseEvent) => void
  isFirst?: boolean
  level: number
}

export interface ITree {
  dataSource: IData[]
  nodeView: React.FC<INodeView>
  onNodeClicked?: TTreeNodeClickHandler
}
