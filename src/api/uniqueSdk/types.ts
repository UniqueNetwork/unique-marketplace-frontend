import { BN } from '@polkadot/util';
import { DecoratedRpc, SubmittableExtrinsic } from '@polkadot/api/types';
import { RpcInterface } from '@polkadot/rpc-core/types/jsonrpc';
import { DecodedAttributes } from '@unique-nft/sdk/tokens';
import { Account } from '../../account/AccountContext';
import { UnsignedTxPayload } from '@unique-nft/sdk/types';

export type TokenId = {
  toNumber(): number
};

export type UniqueDecoratedRpc = DecoratedRpc<'promise', RpcInterface> & {
  unique?: {
    accountTokens(collectionId: number, accountId: CrossAccountId): Promise<TokenId[]>
    allowance(collectionId: string, accountId: CrossAccountId, contractAccountId: CrossAccountId, tokenId: string): Promise<{ toJSON(): number }>
  }
}

export type TTransaction = SubmittableExtrinsic<'promise'>

export type TSignMessage = { (message: string, account?: string | Account | undefined): Promise<string>; (arg0: string): any; }

export type TransactionOptions = {
  // this function will be called after transaction is created and awaited before proceeding
  signer?: string
  sign: (unsignedTxPayload: UnsignedTxPayload) => Promise<`0x${string}` | null>
  signMessage?: (message: string) => Promise<`0x${string}` | null>
  // if not provided, signed.send() will be called instead
  send?: (signature: string) => Promise<any | void>
};

export interface NFTCollectionSponsorship {
  isConfirmed?: boolean
  address?: string
}

export interface NFTCollection {
  id: number
  tokenPrefix: string
  coverImageUrl?: string
  collectionName?: string
  description?: string
  owner?: CrossAccountId | string
  sponsorship?: NFTCollectionSponsorship | null
}

export type AttributesDecoded = {
  [key: string]: string | string[]
}

export interface NFTToken {
  id: number
  owner?: CrossAccountId
  attributes?: DecodedAttributes
  imageUrl: string
  collectionId?: number
  collectionName?: string
  prefix?: string
  description?: string
  collectionCover?: string
  isAllowed?: boolean
}

export type MetadataType = {
  metadata?: string
}

export type CrossAccountId = {
  Substrate?: string
  Ethereum?: string
}

export type EvmCollectionAbiMethods = {
  approve: (contractAddress: string, tokenId: string) => {
    encodeABI: () => any;
  },
  getApproved: (tokenId: string | number) => {
    call: () => Promise<string>;
  }
}

export type TokenAskType = { flagActive: '0' | '1', ownerAddr: string, price: BN };

export type MarketplaceAbiMethods = {
  addAsk: (price: string, currencyCode: string, address: string, tokenId: string) => {
    encodeABI: () => any;
  },
  balanceKSM: (ethAddress: string) => {
    call: () => Promise<string>;
  };
  buyKSM: (collectionAddress: string, tokenId: string, buyer: string, receiver: string) => {
    encodeABI: () => any;
  };
  cancelAsk: (collectionId: string, tokenId: string) => {
    encodeABI: () => any;
  };
  depositKSM: (price: number) => {
    encodeABI: () => any;
  },
  getOrder: (collectionId: string, tokenId: string) => {
    call: () => Promise<TokenAskType>;
  };
  getOrdersLen: () => {
    call: () => Promise<number>;
  },
  orders: (orderNumber: number) => {
    call: () => Promise<TokenAskType>;
  },
  setEscrow: (escrow: string) => {
    encodeABI: () => any;
  },
  // (amount: string, currencyCode: string, address: string) => any;
  withdraw: (amount: string, currencyCode: string, address: string) => {
    encodeABI: () => any;
  };
  withdrawAllKSM: (ethAddress: string) => {
    encodeABI: () => any;
  };
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

export interface IMarketController {
  kusamaDecimals: number
  addToWhiteList(account: string, options: TransactionOptions, signMessage: TSignMessage): Promise<void>
  checkWhiteListed(account: string): Promise<boolean>
  lockNftForSale(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void>
  sendNftToSmartContract(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void>
  setForFixPriceSale(account: string, collectionId: string, tokenId: string, price: string, options: TransactionOptions): Promise<void>
  cancelSell(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void>
  unlockNft(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void>
  getUserDeposit(account: string): Promise<BN>
  addDeposit(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void>
  withdrawDeposit(account: string, options: TransactionOptions): Promise<void>
  buyToken(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void>
  transferToken(from: string, to: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void>
  transferToAuction(owner: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void>
  transferBidBalance(from: string, amount: string, options: TransactionOptions): Promise<void>
  transferBalance(from: string, to: string, amount: string, options: TransactionOptions): Promise<void>
  getKusamaFee(sender: string, recipient?: string, value?: BN): Promise<string | null>
}
