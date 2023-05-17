// import { CollectionInfoWithSchemaResponse } from '@unique-nft/sdk';

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

export interface MyCollectionBackend {
  id: number,
  tokenPrefix: string,
  owner: string,
  cover: string,
  name: string
}

export interface MyCollection extends MyCollectionBackend {
  allowedTokens: string, // TODO: type
  isMarketable: boolean
}
