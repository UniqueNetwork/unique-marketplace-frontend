import { PaginatedResponse, Pagination } from '../base/types';
import { OfferTokenAttribute } from '../offers/types';

export type GetTradesRequestPayload = {
  sort?: string // ex. "asc(Price)"
  seller?: string
  collectionId?: number | number[]
  searchText?: string
} & Pagination;

export type TokenDescription = {
  collectionName: string
  collectionCover: string | null
  description: string
  image: string
  prefix: string
  attributes: OfferTokenAttribute[]
}

export type Trade = {
  buyer: string
  seller: string
  collectionId: number
  creationDate: string
  metadata: Record<string, any>
  price: string
  quoteId: number
  tokenId: number
  tradeDate: number
  tokenDescription: TokenDescription
}

export type TradesResponse = PaginatedResponse<Trade>

export type UseFetchTradesProps = Partial<GetTradesRequestPayload>
