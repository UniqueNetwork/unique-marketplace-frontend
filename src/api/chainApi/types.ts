import { ApiPromise } from '@polkadot/api'

export interface IRpcClient {
  controller?: INFTController<any, any>
  chainData: any
  chains?: Record<string, Chain>
}

export interface INFTController<Collection, Token> {
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
