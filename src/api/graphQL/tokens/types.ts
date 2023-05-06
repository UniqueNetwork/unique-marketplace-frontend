import { QueryHookOptions } from '@apollo/client';
import { QueryVariables } from '../types';

export interface Attribute {
  name: { _: string };
  value: { _: string } | { _: string }[];
  isEnum: boolean;
  isArray: boolean;
  type:
    | 'integer'
    | 'float'
    | 'boolean'
    | 'timestamp'
    | 'string'
    | 'url'
    | 'isoDate'
    | 'time'
    | 'colorRgba';
  rawValue: {
    _: string;
  };
}

export enum TokenTypeEnum {
  NFT = 'NFT',
  RFT = 'RFT',
}

export interface Token {
  token_id: number;
  token_name: string;
  token_prefix: string;
  owner: string;
  owner_normalized: string;
  attributes: Record<string, Attribute>;
  date_of_creation: number;
  image?: {
    fullUrl: string | null;
    ipfsCid: string | null;
  };
  collection_id: number;
  collection_name: string;
  collection_cover: string;
  collection_description: string;
  type: TokenTypeEnum;
  children_count: number;
  parent_id: string | null;
  nested: boolean;
  total_pieces: string;
  tokens_owner: string;
  tokens_amount: string;
}

export type useGqlGetTokensProps = QueryHookOptions<Token, QueryVariables<Token>>;

export type useGqlGetTokenProps = { skip: boolean, tokenId: number };
