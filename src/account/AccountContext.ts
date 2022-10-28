import { Consumer, Context, createContext, Provider } from 'react';
import { BN } from '@polkadot/util';
import { KeyringPair } from '@polkadot/keyring/types';
import { TWithdrawBid } from '../api/restApi/auction/types';
import { Account, SignResult, UnsignedTxPayload } from '@unique-nft/accounts';

export type AccountDeposits = {
  bids: {
    leader: TWithdrawBid[]
    withdraw: TWithdrawBid[]
  }
  sponsorshipFee?: BN
}

declare module '@unique-nft/accounts' {
  export abstract class Account {
    name: string;
    address: string;
    balance?: {
      KSM?: BN
    };

    deposits?: AccountDeposits;
    isOnWhiteList?: boolean;
    isLocal?: boolean;
    abstract sign(unsignedTxPayload: Pick<UnsignedTxPayload, 'signerPayloadHex'> & Partial<UnsignedTxPayload>): Promise<SignResult>
  }
}

export type AccountContextProps = {
  isLoading: boolean
  isLoadingDeposits: boolean
  accounts: Account[]
  selectedAccount: Account | undefined
  fetchAccountsError: string | undefined
  changeAccount(account: Account): void
  setSelectedAccount(account: Account): void
  showSignDialog(keyringPair: KeyringPair): Promise<string>
  fetchAccounts(): Promise<void>
  updateAccountsDeposits(): Promise<void>
  updateCurrentAccountDeposit(): Promise<void>
}

const AccountContext: Context<AccountContextProps> = createContext({} as unknown as AccountContextProps);
const AccountConsumer: Consumer<AccountContextProps> = AccountContext.Consumer;
const AccountProvider: Provider<AccountContextProps> = AccountContext.Provider;

export default AccountContext;

export { AccountConsumer, AccountProvider };
