import { NestedToken } from '@unique-nft/sdk';
import { CollectionMode, DecodedInfixOrUrlOrCidAndHash } from 'api/chainApi/types';

export interface INestingToken extends NestedToken {
  opened?: boolean
  disabled?: boolean
  selected?: boolean
  isCurrentAccountOwner?: boolean
  image: DecodedInfixOrUrlOrCidAndHash
  mode?: CollectionMode
}

export interface ITokenCard {
  token: INestingToken
  onViewNodeDetails?: (token: INestingToken, collectionMode: CollectionMode) => void
  onUnnestClick?: (token: INestingToken) => void
  onTransferClick?: (token: INestingToken) => void
}
