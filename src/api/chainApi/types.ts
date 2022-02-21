import { ChainData } from '../ApiContext';
import { ApiPromise } from '@polkadot/api';

export interface IRpcClient {
  isApiConnected: boolean
  nftController?: INFTController<any, any>
  collectionController?: ICollectionController<any, any>
  chainData: any
  rawRpcApi?: ApiPromise // allow access to the raw API for exceptions in the future
  setOnChainReadyListener(callback: (chainData: ChainData) => void): void
  changeEndpoint(endpoint: string, options?: IRpcClientOptions): void
}

export interface IRpcClientOptions {
  onChainReady?: (chainData: ChainData) => void
}

export interface INFTController<Collection, Token> {
  getToken(collectionId: number, tokenId: number): Promise<Token | null>
}

export interface ICollectionController<Collection, Token> {
  getCollection(collectionId: number): Promise<Collection | null>
  getCollections(): Promise<Collection[]>
  getFeaturedCollections(): Promise<Collection[]>
  getTokensOfCollection(collectionId: number, ownerId: number): Promise<Token[]>
}

export type Chain = {
  network: string
  name: string
  gqlEndpoint: string
  rpcEndpoint: string
}
