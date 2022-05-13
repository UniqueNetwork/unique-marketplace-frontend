import { BN } from '@polkadot/util';

export type SchemaVersionTypes = 'ImageURL' | 'Unique' | 'TokenURI'

export interface NFTCollection {
  id: number
  access?: 'Normal' | 'WhiteList'
  decimalPoints: BN | number
  description: number[]
  tokenPrefix: string
  coverImageUrl: string
  mintMode?: boolean
  mode: {
    nft: null
    fungible: null
    reFungible: null
    invalid: null
  }
  name: number[]
  collectionName: string,
  offchainSchema: string
  owner?: string
  schemaVersion: SchemaVersionTypes
  sponsorship: {
    confirmed?: string
    disabled?: string | null
    unconfirmed?: string | null
  }
  limits?: {
    accountTokenOwnershipLimit: string
    sponsoredDataSize: string
    sponsoredDataRateLimit: string
    sponsoredMintSize: string
    tokenLimit: string
    sponsorTimeout: string
    ownerCanTransfer: boolean
    ownerCanDestroy: boolean
  }
  variableOnChainSchema: string
  constOnChainSchema: string
}

export type AttributesDecoded = {
  [key: string]: string | string[]
}

export interface NFTToken {
  id: number
  owner?: CrossAccountId
  constData?: string
  variableData?: string
  attributes?: AttributesDecoded
  imageUrl: string
  collectionId?: number
  collectionName?: string
  prefix?: string
  description?: string
  collectionCover?: string
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
