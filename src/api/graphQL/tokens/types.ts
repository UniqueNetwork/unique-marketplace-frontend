import { DecodedAttributes } from '@unique-nft/substrate-client/tokens';
import { VideoAttribute } from 'api/uniqueSdk/types';

export interface TokensVariables {
  limit: number;
  offset: number;
  where?: Record<string, unknown>;
  orderBy?: TokenSorting;
}

export type TokenTypeEnum = 'FRACTIONAL' | 'NESTED' | 'NFT';

export interface Token {
  attributes: DecodedAttributes;
  tokenId: number;
  collectionId: number;
  image: {
    fullUrl: string | null;
  };
  owner: string;
  burned?: boolean;
  prefix?: string;
  parentId?: string;
  video?: VideoAttribute
}

export interface TokensData {
  tokens: {
    data: Token[];
    count: number;
    timestamp: number;
  };
}

export type TokenSorting = {
  [P in keyof Token]?:
    | 'asc'
    | 'desc'
    | 'desc_nulls_last'
    | 'asc_nulls_last'
    | 'asc_nulls_first'
    | 'desc_nulls_first';
};

export type useGraphQlTokensProps = {
  pageSize: number;
  filter?: Record<string, unknown>;
  offset: number;
  orderBy?: TokenSorting;
  collectionId?: string;
  searchString?: string;
};
