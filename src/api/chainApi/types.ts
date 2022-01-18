import { ApiPromise } from '@polkadot/api'

export interface IRpcClient {
  api?: ApiPromise
  adapter?: INFTAdapter<any, any>
  chainData: any
  chains?: Record<string, Chain>
}

export interface INFTAdapter<Collection, Token> {
  api: ApiPromise
  setApi(api: ApiPromise): void
  getCollection(collectionId: string): Promise<Collection | null>
  getTokensOfCollection(collectionId: string, ownerId: string): Promise<Token[]>
  getToken(collectionId: string, tokenId: string): Promise<Token | null>
}

export type Chain = {
  network: string
  name: string
  clientEndpoint: string
  rpcEndpoint: string
}
