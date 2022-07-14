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
  status: string
  offerId: string
}

export type TradesResponse = PaginatedResponse<Trade>

export type UseFetchTradesProps = Partial<GetTradesRequestPayload>

export type TradeDetails = {
  id: string
  createdAt: string
  updatedAt: string
  priceStep: string
  startPrice: string
  status: string
  stopAt: string
  contractAskId: string
  bids: Bid[]
}

export type Bid = {
  id: string
  amount: string
  balance: string
  blockNumber: string
  auctionId: string
  bidderAddress: string
  status: string
  createdAt: string
  updatedAt: string
  isWinner?: boolean
}
