import { NestedToken } from '@unique-nft/substrate-client/tokens';

export interface INestingToken extends NestedToken {
  opened?: boolean
  disabled?: boolean
  selected?: boolean
}

export interface INestedTokenId {
  collectionId: number
  tokenId: number
}

export interface ITokenCard {
  token: INestingToken
  parent: INestingToken
  onViewNodeDetails?: (token: INestingToken) => void
  onUnnestClick?: (token: INestingToken, parent: INestingToken) => void
  onTransferClick?: (token: INestingToken, parent: INestingToken) => void
}
