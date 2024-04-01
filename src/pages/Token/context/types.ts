import { CollectionWithInfoV2Dto, TokenByIdResponse, TokenChildrenResponse } from '@unique-nft/sdk';
import { Offer } from 'api/restApi/offers/types';

export type Fraction = { amount: number, totalPieces: number };

export type TokenContextValue = {
  token?: TokenByIdResponse
  collection?: CollectionWithInfoV2Dto
  offer?: Offer
  ownerAddress?: string
  isBundle: boolean
  isNested: boolean
  isRft: boolean
  isRftFracton: boolean
  isOwner: boolean
  isWearable: boolean
  isCustomizable: boolean
  topmostOwner?: string
  bundle?: TokenChildrenResponse
  fraction?: Fraction
  isFetching: boolean
  fetchToken(): Promise<void>
  fetchOffer(): Promise<void>
}
