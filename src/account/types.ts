import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { KeyringAddress } from '@polkadot/ui-keyring/types';
import { BN } from '@polkadot/util';
import { Signer as SdkSigner, UnsignedTxPayloadResponse } from '@unique-nft/sdk';
import { IEthereumExtensionResultSafe } from '@unique-nft/utils/extension';
import { useWalletCenter } from './useWalletCenter';
import { Signer as EthSigner } from 'ethers';
import { KeyringPair } from '@polkadot/keyring/types';
import { PairType } from 'utils/seedUtils';

export type Signer = SdkSigner | EthSigner;

export type BaseWalletType<T> = {
  name: string;
  address: string;
  normalizedAddress: string;
  signerType: AccountSigner;
  signer: Signer;
  walletMetaInformation: T;
  sign(data: any, account?: any, meta?: any): any;
  changeChain(network: string): Promise<void>;
  isMintingEnabled: boolean;
};

export type BaseWalletEntity<T> = {
  isMintingEnabled: boolean;
  changeChain(network: string): Promise<void>;
  getAccounts(): Promise<Map<string, BaseWalletType<T>>>;
  getSignature(
    unsignedTxPayload: UnsignedTxPayloadResponse,
    account: Account,
    meta: any,
  ): any;
};

export type RequestPasswordCallback = (pair: KeyringPair) => Promise<string>;

export type ConnectedWalletOptions = {
  requestPasswordCallback?: RequestPasswordCallback;
}

export enum AccountSigner {
  extension = 'Extension',
  local = 'Local',
}

export type WalletsType =
  | InjectedAccountWithMeta
  | KeyringAddress
  | IEthereumExtensionResultSafe['result'];

export type AccountBalance = {
  raw: BN,
  parsed: string
}

export type AccountBalances = {
  proper: AccountBalance
  ethMirror: AccountBalance
}

export type Account<T extends WalletsType = WalletsType> = BaseWalletType<T> & {
  balances?: AccountBalances;
  unitBalance?: string;
};

export type AccountContextProps = {
  isLoading: boolean;
  signer?: KeyringPair;
  accounts: Map<string, Account>;
  selectedAccount: Account | undefined;
  fetchAccountsError: string | undefined;
  changeAccount(account: Account): void;
  setFetchAccountsError(error: string | undefined): void;
  setIsLoading(loading: boolean): void;
  showSignDialog(pair: KeyringPair): Promise<string>;
  addLocalAccount(seed: string, derivePath: string, name: string, password: string, pairType: PairType): void;
  forgetLocalAccount(addressWallet: string): void;
  walletsCenter: ReturnType<typeof useWalletCenter>;
  fetchAccounts(): void;
};
