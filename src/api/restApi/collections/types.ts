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

export interface MarketableCollection {
  allowedTokens: string
  isMarketable: boolean
  active: boolean
  collectionId: number
  createdAt: string
  data: CollectionInfoWithSchemaResponse
  decimalPoints: number
  description: string
  id: string
  mintMode: boolean
  mode: 'NFT' | 'Fungible' | 'ReFungible' | undefined,
  name: string
  network: string
  owner: string
  status: string
  tokenPrefix: string
  tokensTotal: number
  tokensCount: number
  tokensOnMarket: number
  updatedAt: string
  maxPrice: number | null
  minPrice: number | null
  holders: number
  uniqueHolders: string | null
  metadata: null
}

export interface MyCollection {
  allowedTokens: string
  isMarketable: boolean
  id: number
  tokenPrefix: string
  owner: string
  cover: string
  name: string
}