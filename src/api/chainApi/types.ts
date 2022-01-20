import { ChainData } from '../ApiContext'
import { ApiPromise } from '@polkadot/api'

export interface IRpcClient {
  isApiConnected: boolean
  controller?: INFTController<any, any>
  chainData: any
  rawRpcApi?: ApiPromise // allow access to the raw API for exceptions in the future
  setOnChainReadyListener(callback: (chainData: ChainData) => void): void
  changeEndpoint(endpoint: string, options?: IRpcClientOptions): void
}

export interface IRpcClientOptions {
  onChainReady?: (chainData: ChainData) => void
}

export interface INFTController<Collection, Token> {
  getCollection(collectionId: number): Promise<Collection | null>
  getTokensOfCollection(collectionId: number, ownerId: number): Promise<Token[]>
  getToken(collectionId: number, tokenId: number): Promise<Token | null>
}

export type Chain = {
  network: string
  name: string
  gqlEndpoint: string
  rpcEndpoint: string
}
