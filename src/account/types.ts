import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { KeyringAddress } from '@polkadot/ui-keyring/types';
import { BN } from '@polkadot/util';
import { AllBalancesResponse, UnsignedTxPayloadResponse } from '@unique-nft/sdk';
import { IEthereumExtensionResultSafe } from '@unique-nft/utils/extension';
import { useWalletCenter } from './useWalletCenter';

export type BaseWalletType<T> = {
  name: string;
  address: string;
  normalizedAddress: string;
  signerType: AccountSigner;
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
  signer?: Account;
  accounts: Map<string, Account>;
  selectedAccount: Account | undefined;
  fetchAccountsError: string | undefined;
  changeAccount(account: Account): void;
  setFetchAccountsError(error: string | undefined): void;
  setIsLoading(loading: boolean): void;
  showSignDialog(signer: Account): Promise<string>;
  forgetLocalAccount(addressWallet: string): void;
  walletsCenter: ReturnType<typeof useWalletCenter>;
};
