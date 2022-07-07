import { DecoratedRpc } from '@polkadot/api/types';
import { RpcInterface } from '@polkadot/rpc-core/types/jsonrpc';
import { GenericAccountId } from '@polkadot/types';
import { UpDataStructsCollection, UpDataStructsCreateCollectionData, UpDataStructsCreateNftExData } from '@unique-nft/unique-mainnet-types/default/types';
import { BN } from '@polkadot/util';

export type TokenId = {
  toNumber(): number
};

export type UniqueDecoratedRpc = DecoratedRpc<'promise', RpcInterface> & {
  unique?: {
    collectionById(collectionId: string): Promise<{ value: UpDataStructsCollection & UpDataStructsCreateCollectionData }>
    tokenData(collectionId: number, tokenId: number): Promise<{ toJSON: () => UpDataStructsCreateNftExData }>
    variableMetadata(collectionId: number, tokenId: number): Promise<{ toJSON: () => string }>
    constMetadata(collectionId: number, tokenId: number): Promise<{ toJSON: () => string }>
    tokenOwner(collectionId: number, tokenId: number): Promise<{ toJSON: () => string }>
    accountTokens(collectionId: number, accountId: CrossAccountId): Promise<TokenId[]>
  }
}

export type UniqueDecoratedQuery = DecoratedRpc<'promise', RpcInterface> & {
  unique?: {
    accountTokens(collectionId: number, accountId: CrossAccountId): Promise<TokenId[]>
  }
}

export interface NFTCollectionSponsorship {
  unconfirmed?: string
  confirmed?: string
}

export interface NFTCollection {
  id: number
  tokenPrefix: string
  coverImageUrl?: string
  collectionName?: string
  description?: string
  owner: GenericAccountId
  sponsorship?: NFTCollectionSponsorship | null
}

export type AttributesDecoded = {
  [key: string]: string | string[]
}

export interface NFTToken {
  id: number
  owner?: CrossAccountId
  attributes?: AttributesDecoded
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
