import { PaginatedResponse } from '../base/types';
import { Attribute, AttributeCount, CollectionDescription, GetOffersRequestPayload, TokenDescription } from '../offers/types';

export type Token = {
  collectionId: number
  tokenId: number
  price: {
    parsed: number, // 123
    raw: string // 123000000000000
  }
  priceParsed: string
  quoteId: number
  seller: string
  creationDate: string
  tokenDescription: TokenDescription,
  collectionDescription: CollectionDescription
}

export type TokensResponse = PaginatedResponse<Token> & {
  attributes: Record<string, Attribute[]>;
  attributesCount: AttributeCount[]
}

export type UseFetchOffersProps = Partial<GetOffersRequestPayload>
