import { ApiPromise } from '@polkadot/api'

export interface IRpcClient {
  isApiConnected: boolean
  controller?: INFTController<any, any>
  chainData: any
  chains?: Record<string, Chain>
}

export interface INFTController<Collection, Token> {
  getCollection(collectionId: number): Promise<Collection | null>
  getTokensOfCollection(collectionId: number, ownerId: number): Promise<Token[]>
  getToken(collectionId: number, tokenId: number): Promise<Token | null>
}

export type Chain = {
  network: string
  name: string
  clientEndpoint: string
  rpcEndpoint: string
}
