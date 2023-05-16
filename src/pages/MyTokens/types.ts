import { DecodedAttributeDto, TokenByIdResponse } from '@unique-nft/sdk';
import { SelectOptionProps } from '@unique-nft/ui-kit';
import { Offer } from 'api/restApi/offers/types';

export type TOption = SelectOptionProps & {
  direction: 'asc' | 'desc';
  field: keyof Pick<Offer & MyToken, 'price' | 'tokenId' | 'creationDate'>;
  id: string;
  title: string;
}

export enum TokenTypeEnum {
  NFT = 'NFT',
  RFT = 'RFT',
}

export type MyToken = {
  tokenId: number;
  token_name?: string;
  token_prefix?: string;
  owner: string;
  attributes: DecodedAttributeDto[];
  creationDate?: string;
  image?: {
    fullUrl?: string | null;
    ipfsCid?: string | null;
  };
  video?: {
    fullUrl?: string | null;
    ipfsCid?: string | null;
  };
  collectionId: number;
  collection_name?: string;
  collection_cover?: string;
  collection_description?: string;
  type?: TokenTypeEnum;
  parent_id?: string | null;
  nested?: boolean;
}

export type GqlToken = Omit<MyToken, 'attributes'> & { attributes: Record<string, DecodedAttributeDto> };

export type MixedMyTokenAndOffer = Omit<MyToken, 'collection' | 'nestingParentToken' | 'properties'> & Partial<Offer>;

// TODO: remove it after switching the collection page to receive tokens from the market backend
export type MixedTokenAndOffer = Omit<TokenByIdResponse, 'collection' | 'nestingParentToken' | 'properties'> & Partial<Offer>;
