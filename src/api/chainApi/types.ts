import { BN } from '@polkadot/util';
import { Bytes } from '@polkadot/types';
import { SignerPayloadJSON } from '@polkadot/types/types';
import { Account } from 'account/types';

export type TTransaction = {
  signerPayloadJSON?: SignerPayloadJSON
  signature: `0x${string}`
}

export type TSignMessage = { (message: string, account?: string | Account | undefined): Promise<`0x${string}`>; (arg0: string): any; }

export type TransactionOptions = {
  // the account that will sign the transaction
  account: Account
  // if not provided, signed.send() will be called instead
  send?: (tx: TTransaction) => Promise<any | void>
  // contract address
  contractAddress?: string
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

export type CollectionMode = 'NFT' | 'Fungible' | 'ReFungible';
