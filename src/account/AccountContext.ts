import { Consumer, Context, createContext, Provider } from 'react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { BN } from '@polkadot/util';
import { KeyringPair } from '@polkadot/keyring/types';
import { TWithdrawBid } from '../api/restApi/auction/types';

export enum AccountSigner {
  extension = 'Extension',
  local = 'Local'
}
export interface Account extends InjectedAccountWithMeta {
  signerType: AccountSigner,
  balance?: {
    KSM?: BN
  },
  deposits?: {
    bids: {
      leader: TWithdrawBid[]
      withdraw: TWithdrawBid[]
    }
    sponsorshipFee?: BN
  }
  isOnWhiteList?: boolean
}

export type AccountContextProps = {
  isLoading: boolean
  isLoadingDeposits: boolean
  accounts: Account[]
  selectedAccount: Account | undefined
  fetchAccountsError: string | undefined
  changeAccount(account: Account): void
  setSelectedAccount(account: Account): void
  showSignDialog(account: Account): Promise<KeyringPair>
  fetchAccounts(): Promise<void>
  fetchAccountsWithDeposits(): Promise<Account[]>
}

const AccountContext: Context<AccountContextProps> = createContext({} as unknown as AccountContextProps);
const AccountConsumer: Consumer<AccountContextProps> = AccountContext.Consumer;
const AccountProvider: Provider<AccountContextProps> = AccountContext.Provider;

export default AccountContext;

export { AccountConsumer, AccountProvider };
