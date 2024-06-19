import { CollectionPermissionsDto, TokenProperty, AttributeSchemaDto, DecodedAttributeDto } from '@unique-nft/sdk';

export type GQLCollection = {
  attributesSchema: Record<number, AttributeSchemaDto>
  owner: string
  cover: string
  description?: string
  id: number
  name: string
  tokenPrefix: string
  tokensCount: number
  tokenLimit: number
  properties: TokenProperty[]
  permissions: CollectionPermissionsDto
  mode: 'NFT' | 'Fungible' | 'ReFungible'

  allowedTokens?: string
  isMarketable?: boolean
}

export type GQLToken = {
  tokenId: number
  tokenName: string
  tokenPrefix: string
  collectionId: number
  collectionName?: string
  collectionCover?: string;
  collectionOwner?: string;
  parent?: string
  owner: string
  image: {
    fullUrl?: string | null;
    ipfsCid?: string | null;
  }
  video?: {
    fullUrl?: string | null;
    ipfsCid?: string | null;
  };
  nested: boolean
  attributes: DecodedAttributeDto[];
  creationDate?: string;
  childrenCount?: number
  tokensAmount?: string
  totalPieces?: string

  file?: {
    fullUrl?: string | null;
    ipfsCid?: string | null;
  }
}
