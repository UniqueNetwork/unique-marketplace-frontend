import { ChainData } from '../ApiContext';
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';

export interface IRpc {
  rpcEndpoint: string
  isApiConnected: boolean
  isApiInitialized: boolean
  apiConnectionError?: string
  rawRpcApi?: ApiPromise // allow access to the raw API for exceptions in the future
  setOnChainReadyListener(callback: (chainData: ChainData) => void): void
  changeEndpoint(endpoint: string, options?: IRpcClientOptions): void
}

export interface IRpcClient extends IRpc {
  nftController?: INFTController<any, any>
  collectionController?: ICollectionController<any, any>
  marketController?: IMarketController
  chainData: any
}

export interface IRpcClientOptions {
  onChainReady?: (chainData: ChainData) => void
}

export interface INFTController<Collection, Token> {
  getToken(collectionId: number, tokenId: number): Promise<Token | null>
}

export interface ICollectionController<Collection, Token> {
  getCollection(collectionId: number): Promise<Collection | null>
  getTokensOfCollection(collectionId: number, ownerId: number): Promise<Token[]>
}

export interface IAccountController<Collection, Token> {
  getAccounts: any
}

export type TTransaction = SubmittableExtrinsic<'promise'>

export type TransactionOptions = {
  sign: (tx: TTransaction) => Promise<TTransaction | void>
};
// TODO: receive transaction instead of void
// TODO: token as argument for market operations
/*
 * Main api for marketplace operations, sell-buy-auction
 * Please notice, that most methods are not executions by themselves, but instead - return transactions for further subscribe and execute
 */
export interface IMarketController {
  // substrate address
  addToWhiteList: (account: string, options: TransactionOptions) => Promise<void>
  checkWhiteListed: (account: string) => Promise<boolean>
  lockNftForSale: (account: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  sendNftToSmartContract: (account: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  setForFixPriceSale: (account: string, collectionId: string, tokenId: string, price: number, options: TransactionOptions) => Promise<void>
}

export type Chain = {
  network: string
  name: string
  gqlEndpoint: string
  rpcEndpoint: string
}
