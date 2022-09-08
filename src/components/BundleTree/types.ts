import { DecodedAttributes, DecodedInfixOrUrlOrCidAndHash } from '@unique-nft/substrate-client/tokens';
import { Address } from '@unique-nft/substrate-client/types';

export interface INestingToken {
  tokenId: number
  collectionId: number
  owner?: Address
  nestingChildTokens: INestingToken[]
  attributes: DecodedAttributes
  image?: DecodedInfixOrUrlOrCidAndHash | string
  opened?: boolean
  disabled?: boolean
  selected?: boolean
}

export interface ITokenCard {
  token: INestingToken
  onViewNodeDetails?: (token: INestingToken) => void
}
