import { CollectionInfoWithSchema } from '@unique-nft/substrate-client/tokens';

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

export type CollectionData = CollectionInfoWithSchema & {
  allowedTokens?: string
  updatedAt?: string
  status?: string
  name?: string
  owner?: string
}
