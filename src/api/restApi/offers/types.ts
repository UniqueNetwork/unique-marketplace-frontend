import { PaginatedResponse, Pagination, Sortable } from '../base/types';

export type GetOffersRequestPayload = {
  collectionId?: number | number[]
  minPrice?: string
  maxPrice?: string
  seller?: string
  traitsCount?: number[]
  searchText?: string
  searchLocale?: string
} & Pagination & Sortable;

export type Offer = {
  collectionId: number
  tokenId: number
  price: string
  quoteId: number
  seller: string
  metadata: null,
  creationDate: string
}

export type OffersResponse = PaginatedResponse<Offer>

export type UseFetchOffersProps = Omit<GetOffersRequestPayload, 'page'>
