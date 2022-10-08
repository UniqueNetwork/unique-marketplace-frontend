import { NestedToken } from '@unique-nft/substrate-client/tokens';

export interface INestingToken extends NestedToken {
  opened?: boolean
  disabled?: boolean
  selected?: boolean
  isCurrentAccountOwner?: boolean
}

export interface ITokenCard {
  token: INestingToken
  onViewNodeDetails?: (token: INestingToken) => void
  onUnnestClick?: (token: INestingToken) => void
  onTransferClick?: (token: INestingToken) => void
}
