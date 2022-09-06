import { DecodedAttributes, DecodedInfixOrUrlOrCidAndHash } from '@unique-nft/substrate-client/tokens';

export interface INestingToken {
  tokenId: number
  collectionId: number
  owner: string
  nestingChildTokens: INestingToken[]
  attributes: DecodedAttributes
  image: DecodedInfixOrUrlOrCidAndHash
  opened?: boolean
  disabled?: boolean
  selected?: boolean
}

// export interface INestedSection {
//   selectedToken: INestingToken | null
// }

export interface ITokenCard {
  token: INestingToken
  onViewNodeDetails?: (token: INestingToken) => void
}
