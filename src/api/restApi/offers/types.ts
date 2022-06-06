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

export type OfferTokenAttribute = {
  key: string
  type: string
  value: string | string[]
}

export type Offer = {
  collectionId: number
  tokenId: number
  price: string
  quoteId: number
  seller: string
  creationDate: string
  auction: Auction | null
  tokenDescription: {
    collectionName: string
    collectionCover: string | null
    description: string
    image: string
    prefix: string
    attributes: OfferTokenAttribute[]
  }
}

export type OffersResponse = PaginatedResponse<Offer>

export type UseFetchOffersProps = Partial<GetOffersRequestPayload>

export type Attribute = {
  key: string;
  count: number;
};

export type AttributesResponse = {
  collectionId: number;
  attributes: Record<string, Attribute[]>;
};

export type AttributeCount = {
  numberOfAttributes: number
  amount: number
};
