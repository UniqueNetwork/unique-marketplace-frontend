import { DecodedAttributes, DecodedInfixOrUrlOrCidAndHash } from '@unique-nft/sdk/tokens';

export interface IData {
  tokenId: number
  collectionId: number
  owner: string
  nestingChildTokens: IData[]
  attributes: DecodedAttributes
  image: DecodedInfixOrUrlOrCidAndHash
  opened?: boolean
  disabled?: boolean
  selected?: boolean
}

// export interface INestedSection {
//   selectedToken: IData | null
// }

export interface ITokenCard {
  token: IData
  onViewNodeDetails?: (token: IData) => void
}
