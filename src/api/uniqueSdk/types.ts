import { BN } from '@polkadot/util';
import { SignerPayloadJSON } from '@unique-nft/substrate-client/types';
import { Account } from '@unique-nft/accounts/types';
import { Bytes } from '@polkadot/types';

export interface UniqueController {
  setNetwork(options: unknown): void
}

export type TTransaction = {
  signerPayloadJSON?: SignerPayloadJSON
  signature: `0x${string}`
}

export type TSignMessage = { (message: string, account?: string | Account | undefined): Promise<`0x${string}`>; (arg0: string): any; }

export type TransactionOptions = {
  // the account that will sign the transaction
  signer?: Account
  // if not provided, signed.send() will be called instead
  send?: (tx: TTransaction) => Promise<any | void>
};

export interface NFTCollectionSponsorship {
  isConfirmed?: boolean
  address?: string
}

export type AttributesDecoded = {
  [key: string]: string | string[]
}

export type DecodedInfixOrUrlOrCidAndHash = ({
  urlInfix?: string;
  hash?: string | null;
} | {
  url?: string;
  hash?: string | null;
} | {
  ipfsCid?: string;
  hash?: string | null;
}) & {
  fullUrl?: string | null;
};

export type VideoAttribute = DecodedInfixOrUrlOrCidAndHash | undefined;

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

export interface Overrides {
  gasLimit?: BigNumberish | Promise<BigNumberish>;
  gasPrice?: BigNumberish | Promise<BigNumberish>;
  maxFeePerGas?: BigNumberish | Promise<BigNumberish>;
  maxPriorityFeePerGas?: BigNumberish | Promise<BigNumberish>;
  nonce?: BigNumberish | Promise<BigNumberish>;
  type?: number;
  customData?: Record<string, any>;
  ccipReadEnabled?: boolean;
}

// TODO: proper typing extraction
export interface ContractTransaction {
  wait(confirmations?: number): Promise<any>;
}
export interface PayableOverrides extends Overrides {
  value?: BigNumberish | Promise<BigNumberish>;
}
export type PromiseOrValue<T> = T | Promise<T>;
export type BigNumberish = BN | Bytes | bigint | string | number;
export type MarketplaceAbiMethods = {
  buy(
    collectionId: PromiseOrValue<BigNumberish>,
    tokenId: PromiseOrValue<BigNumberish>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  checkApproved(
    collectionId: PromiseOrValue<BigNumberish>,
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getOrder(
    collectionId: PromiseOrValue<BigNumberish>,
    tokenId: PromiseOrValue<BigNumberish>,
    overrides?: any
  ): Promise<[any]>;

  marketFee(overrides?: any): Promise<[number]>;

  put(
    collectionId: PromiseOrValue<BigNumberish>,
    tokenId: PromiseOrValue<BigNumberish>,
    price: PromiseOrValue<BigNumberish>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  revoke(
    collectionId: PromiseOrValue<BigNumberish>,
    tokenId: PromiseOrValue<BigNumberish>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setOwner(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setPause(
    pause: PromiseOrValue<boolean>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  version(overrides?: any): Promise<[number]>;

  withdraw(
    transferTo: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;
}

export type OldMarketplaceAbiMethods = {
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
