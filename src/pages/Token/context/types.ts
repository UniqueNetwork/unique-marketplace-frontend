import { CollectionInfoWithSchemaResponse, TokenByIdResponse } from '@unique-nft/sdk';
import { Offer } from 'api/restApi/offers/types';
import { INestingToken } from 'components/BundleTree/types';

export type Fraction = { amount: number, totalPieces: number };

export type TokenContextValue = {
  token?: TokenByIdResponse
  collection?: CollectionInfoWithSchemaResponse
  offer?: Offer
  ownerAddress?: string
  isBundle: boolean
  isNested: boolean
  isRft: boolean
  isRftFracton: boolean
  isOwner: boolean
  topmostOwner?: string
  bundle?: INestingToken
  fraction?: Fraction
  isFetching: boolean
  fetchToken(): Promise<void>
  fetchOffer(): Promise<void>
}
