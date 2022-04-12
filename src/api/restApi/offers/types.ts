import { PaginatedResponse, Pagination, Sortable } from '../base/types';

export type GetOffersRequestPayload = {
  collectionId?: number | number[]
  minPrice?: string
  maxPrice?: string
  seller?: string
  isAuction?: boolean
  bidderAddress?: string
  traitsCount?: number[]
  searchText?: string
  searchLocale?: string
} & Pagination & Sortable;

export type Bid = {
  amount: string
  balance: string
  bidderAddress: string
  createdAt: string
  pendingAmount: string
  updatedAt: string
}

export type Auction = {
  bids: Bid[]
  priceStep: string
  startPrice: string
  status: 'created' | 'active' | 'withdrawing' | 'stopped' // ???
  stopAt: string
}

export type OfferTokenDescriptionItem = {
  key: string
  type: string
  value: string
}

export type Offer = {
  collectionId: number
  tokenId: number
  price: string
  quoteId: number
  seller: string
  creationDate: string
  auction: Auction | null
  tokenDescription: OfferTokenDescriptionItem[]
}

export type OffersResponse = PaginatedResponse<Offer>

export type UseFetchOffersProps = Partial<GetOffersRequestPayload>

export type Trait = {
  trait: string; // name
  count: number;
};

export type TraitsResponse = {
  collectionId: number;
  traits: Trait[];
};
