import { PaginatedResponse, Pagination, Sortable } from '../base/types';
import { INestingToken } from 'components/BundleTree/types';
import { TokenByIdResponse, CollectionInfoWithSchemaResponse } from '@unique-nft/sdk/full';
import { AnyString } from '@polkadot/types/types';

export type OfferFilters = {
  collectionId?: number | number[];
  minPrice?: string;
  maxPrice?: string;
  minUsdtPrice?: string;
  maxUsdtPrice?: string;
  currencies?: number[];
  seller?: AnyString;
  bidderAddress?: string;
  attributes?: string[];
  numberOfAttributes?: number[];
  searchText?: string;
  searchLocale?: string;
};

export type GetOffersRequestPayload = OfferFilters & Pagination & Sortable;

export type Bid = {
  amount: string
  balance: string
  bidderAddress: string
  createdAt: string
  pendingAmount: string
  updatedAt: string
}

export type OfferTokenAttribute = {
  key: string
  type: string
  value: string | string[]
}

export type CollectionDescription = CollectionInfoWithSchemaResponse

export type TokenDescription = TokenByIdResponse & { nestingChildTokens: INestingToken[] };

export type OfferPrice = {
  parsed: number, // 123
  raw: string // 123000000000000
  currency: number
}

export type Offer = {
  collectionId: number
  tokenId: number
  price: OfferPrice
  priceParsed: string
  quoteId: number
  seller: string
  creationDate: string
  tokenDescription: TokenDescription,
  collectionDescription: CollectionDescription
  contractAddress: string
}

export type OfferResponse = Offer

export type OffersResponse = PaginatedResponse<Offer> 

export type OffersAttributesResponse = {
  attributes: Record<string, Attribute[]>;
  attributesCount: AttributeCount[]
}

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
