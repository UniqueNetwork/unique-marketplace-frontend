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
  tokenPrefix?: string;
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
  collectionName?: string;
  collectionCover?: string;
  collectionOwner?: string;
  type?: TokenTypeEnum;
  parent_id?: string | null;
  nested?: boolean;
  childrenCount?: number
}

export type GqlToken = Omit<MyToken, 'attributes'> & { attributes: Record<string, DecodedAttributeDto> };

export type MixedMyTokenAndOffer = Omit<MyToken, 'collection' | 'nestingParentToken' | 'properties'> & Partial<Offer>;
