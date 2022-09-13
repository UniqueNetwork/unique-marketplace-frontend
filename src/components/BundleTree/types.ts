import { NestedToken } from '@unique-nft/substrate-client/tokens';

export type INestingToken = NestedToken & {
  opened?: boolean
  disabled?: boolean
  selected?: boolean
}

export interface ITokenCard {
  token: INestingToken
  onViewNodeDetails?: (token: INestingToken) => void
}
