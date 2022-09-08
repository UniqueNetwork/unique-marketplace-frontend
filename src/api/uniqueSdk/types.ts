import { BN } from '@polkadot/util';
import { DecodedAttributes, DecodedInfixOrUrlOrCidAndHash } from '@unique-nft/substrate-client/tokens';
import { Account } from '../../account/AccountContext';
import { SignerPayloadJSON, UnsignedTxPayload, Address } from '@unique-nft/substrate-client/types';

export type TokenId = {
  toNumber(): number
};

export type TTransaction = {
  signerPayloadJSON?: SignerPayloadJSON
  signature: `0x${string}`
}

export type TSignMessage = { (message: string, account?: string | Account | undefined): Promise<`0x${string}`>; (arg0: string): any; }

export type TransactionOptions = {
  // this function will be called after transaction is created and awaited before proceeding
  signer?: string
  sign: (unsignedTxPayload: UnsignedTxPayload) => Promise<`0x${string}` | null>
  signMessage?: (message: string) => Promise<`0x${string}` | null>
  // if not provided, signed.send() will be called instead
  send?: (tx: TTransaction) => Promise<any | void>
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
  owner?: string
  sponsorship?: NFTCollectionSponsorship | null
}

export type AttributesDecoded = {
  [key: string]: string | string[]
}

export type VideoAttribute = DecodedInfixOrUrlOrCidAndHash | undefined;

export interface NFTToken {
  id: number
  owner?: Address
  attributes?: DecodedAttributes
  imageUrl?: DecodedInfixOrUrlOrCidAndHash | string
  collectionId?: number
  collectionName?: string
  prefix?: string
  description?: string
  collectionCover?: string
  isAllowed?: boolean
  video: VideoAttribute
}

export type MetadataType = {
  metadata?: string
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
  withdraw: (amount: string, currencyCode: string, address: string) => {
    encodeABI: () => any;
  };
  withdrawAllKSM: (ethAddress: string) => {
    encodeABI: () => any;
  };
}
