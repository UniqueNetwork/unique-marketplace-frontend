import { ChainData } from '../ApiContext';
import { ApiPromise } from '@polkadot/api';
import { AddressOrPair, SubmittableExtrinsic } from '@polkadot/api/types';
import { Settings } from '../restApi/settings/types';
import { BN } from '@polkadot/util';
import { TokenId } from './unique/types';
import { Account } from '../../account/AccountContext';
import { SignerPayloadJSON } from '@polkadot/types/types/extrinsic';
import { AllBalances } from '@unique-nft/sdk/types';

export interface IRpc {
  rpcEndpoint: string
  isApiConnected: boolean
  isApiInitialized: boolean
  isKusamaApiConnected: boolean
  apiConnectionError?: string
  rawUniqRpcApi?: ApiPromise // allow access to the raw API for exceptions in the future
  rawKusamaRpcApi?: ApiPromise
  setOnChainReadyListener(callback: (chainData: ChainData) => void): void
  changeEndpoint(endpoint: string, options?: IRpcClientOptions): void
}

export interface IRpcClient extends IRpc {
  initialize(config: IRpcConfig, options?: IRpcClientOptions): Promise<void>
  nftController?: INFTController<any, any>
  collectionController?: ICollectionController<any, any>
  marketController?: IMarketController
  chainData: any
}

export type IRpcConfig = Settings;

export interface IRpcClientOptions {
  onChainReady?: (chainData: ChainData) => void
}

export interface INFTController<Collection, Token> {
  getToken(collectionId: number, tokenId: number): Promise<Token | null>
  getAccountMarketableTokens(account: string): Promise<Token[]>
}

export interface ICollectionController<Collection, Token> {
  getCollection(collectionId: number): Promise<Collection | null>
  getFeaturedCollections(): Promise<Collection[]>
  setCollectionSponsor(collectionId: number, sponsorAddress: string, options: TransactionOptions): Promise<void>
  confirmSponsorship(collectionId: number, options: TransactionOptions): Promise<void>
  removeCollectionSponsor(collectionId: number, options: TransactionOptions): Promise<void>
}

export interface IAccountController<Collection, Token> {
  getAccounts: any
}

export type TTransaction = SubmittableExtrinsic<'promise'>

export type TransactionOptions = {
  // this function will be called after transaction is created and awaited before proceeding
  signer?: string
  sign: (signerPayloadJSON: SignerPayloadJSON) => Promise<`0x${string}` | null>
  signMessage?: (message: string) => Promise<`0x${string}` | null>
  // if not provided, signed.send() will be called instead
  send?: (signature: string) => Promise<any | void>
};

export type TSignMessage = { (message: string, account?: string | Account | undefined): Promise<string>; (arg0: string): any; }

export interface IMarketController {
  kusamaDecimals: number
  // substrate address
  addToWhiteList: (address: string, options: TransactionOptions, signMessage: TSignMessage) => Promise<void>
  checkWhiteListed: (address: string) => Promise<boolean>
  lockNftForSale: (address: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  sendNftToSmartContract: (address: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  setForFixPriceSale: (address: string, collectionId: string, tokenId: string, price: string, options: TransactionOptions) => Promise<void>
  cancelSell: (address: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  unlockNft: (address: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  getUserDeposit: (address: string) => Promise<BN>
  addDeposit: (address: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  withdrawDeposit: (address: string, options: TransactionOptions) => Promise<void>
  buyToken: (address: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  transferToken: (from: string, to: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  transferToAuction: (owner: string, collectionId: string, tokenId: string, options: TransactionOptions) => Promise<void>
  transferBidBalance: (from: string, amount: string, options: TransactionOptions) => Promise<void>
  transferBalance: (from: string, to: string, amount: string, options: TransactionOptions) => Promise<void>
  getKusamaFee: (sender: string, recipient?: string, value?: BN) => Promise<string | null>
  getAccountBalance: (address: string) => Promise<AllBalances>
  isUniqueSdkConnected: () => boolean
  isKusamaSdkConnected: () => boolean
}

export type Chain = {
  network: string
  name: string
  apiEndpoint: string
}
