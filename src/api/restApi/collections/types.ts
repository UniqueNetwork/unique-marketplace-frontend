import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';

export type LoginPayload = {
    account: string
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
}

export type SetCollectionTokensPayload = {
  collectionId: number,
  tokens: string
}

export type CollectionData = CollectionInfoWithSchemaResponse & {
  allowedTokens?: string
  updatedAt?: string
  status?: string
  name?: string
  owner?: string
}
