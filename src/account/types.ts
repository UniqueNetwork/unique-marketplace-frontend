import { KeyringPair } from '@polkadot/keyring/types';
import { BN } from '@polkadot/util';
import { Account } from '@unique-nft/accounts/types';
import { BalanceResponse } from '@unique-nft/sdk';
import { Signer } from '../api/chainApi/adapters/IBaseAdapter';
import { TWithdrawBid } from '../api/restApi/auction/types';

export type AccountDeposits = {
  bids: {
    leader: TWithdrawBid[]
    withdraw: TWithdrawBid[]
  }
  sponsorshipFee?: BN
}

export type MarketAccountBalance = {
  withdraw: {
    parsed: string,
    raw: BN
  },
  parsed: string, // ex. 2006.186351956969336199
  raw: BN // ex. 2006186351956969336199 (as in chain)
}

export type MarketAccount = {
  account: Account,
  signer: Signer,
  name: string,
  address: string,
  isLocal: boolean,
  deposits?: AccountDeposits,
  balance: MarketAccountBalance
}

export type AccountContextProps = {
  isLoading: boolean
  isLoadingDeposits: boolean
  accounts: MarketAccount[]
  selectedAccount: MarketAccount | undefined
  fetchAccountsError: string | undefined
  isOpenConnectWalletModal: boolean
  changeAccount(account: MarketAccount): void
  setSelectedAccount(account: MarketAccount): void
  showSignDialog(keyringPair: KeyringPair): Promise<string>
  fetchAccounts(): Promise<void>
  updateAccountsDeposits(): Promise<void>
  updateAccountBalance(account: string): Promise<MarketAccountBalance>
  updateCurrentAccountDeposit(): Promise<void>
  setIsOpenConnectWalletModal(isOpen: boolean): void
  connectProvider(type: ProviderTypesName): Promise<void>
  forgetAccount(address: string): void
}

export type ProviderTypesName = 'polkadot' | 'keyring' | 'metamask';
