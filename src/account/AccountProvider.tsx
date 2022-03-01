import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { BN } from '@polkadot/util';
import keyring from '@polkadot/ui-keyring';
import { sleep } from '../utils/helpers';

import { AccountProvider } from './AccountContext';

const DefaultAccountKey = 'unique_market_account_address';
export enum AccountSigner {
  extension = 'Extension',
  local = 'Local'
}
export interface Account extends InjectedAccountWithMeta {
  signerType: AccountSigner,
  balance?: {
    KSM?: BN
  }
}

const AccountWrapper: FC = ({ children }) => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchAccountsError, setFetchAccountsError] = useState<string | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta>();

  const changeAccount = useCallback((account: InjectedAccountWithMeta) => {
    localStorage.setItem(DefaultAccountKey, account.address);
    setSelectedAccount(account);
  }, []);

  const getExtensionAccounts = useCallback(async () => {
    // this call fires up the authorization popup
    let extensions = await web3Enable('my cool dapp');
    if (extensions.length === 0) {
      console.log('Extension not found, retry in 1s');
      await sleep(1000);
      extensions = await web3Enable('my cool dapp');
      if (extensions.length === 0) {
        // alert('no extension installed, or the user did not accept the authorization');
        return [];
      }
    }
    return (await web3Accounts()).map((account) => ({ ...account, signerType: AccountSigner.extension })) as Account[];
  }, []);

  const getLocalAccounts = useCallback(() => {
    const keyringAccounts = keyring.getAccounts();
    return keyringAccounts.map((account) => ({ address: account.address, meta: account.meta, signerType: AccountSigner.local } as Account));
  }, []);

  const getAccountBalance = useCallback((account: Account) => {
    return {
      ...account,
      balance: {
        KSM: 0 // rawKusamaRpcApi?.derive.balances?.all(account.address) as number
      }
    } as unknown as Account;
  }, [/* rawKusamaRpcApi */]);

  const getAccounts = useCallback(async () => {
    // this call fires up the authorization popup
    const extensionAccounts = await getExtensionAccounts();
    const localAccounts = getLocalAccounts();

    const allAccounts: Account[] = [...extensionAccounts, ...localAccounts];

    return allAccounts;
  }, [getExtensionAccounts, getLocalAccounts]);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    // this call fires up the authorization popup
    const extensions = await web3Enable('my cool dapp');
    if (extensions.length === 0) {
      setFetchAccountsError('No extension installed, or the user did not accept the authorization');
      return;
    }
    const allAccounts = await getAccounts();
    const accountsWithBalance = allAccounts.map((account) => getAccountBalance(account));

    if (allAccounts?.length) {
      setAccounts(accountsWithBalance);
      setIsLoading(false);

      const defaultAccountAddress = localStorage.getItem(DefaultAccountKey);
      const defaultAccount = accountsWithBalance.find((item) => item.address === defaultAccountAddress);

      if (defaultAccount) {
        changeAccount(defaultAccount);
      } else {
        changeAccount(accountsWithBalance[0]);
      }
    } else {
      setFetchAccountsError('No accounts in extension');
    }
  }, [changeAccount]);

  useEffect(() => {
    void fetchAccounts();
  }, []);

  const value = useMemo(() => ({
    isLoading,
    accounts,
    selectedAccount,
    changeAccount,
    fetchAccounts,
    fetchAccountsError
  }), [isLoading, accounts, selectedAccount, fetchAccounts, fetchAccountsError, changeAccount]);

  return (
    <AccountProvider value={value}>
      {children}
    </AccountProvider>
  );
};

export default AccountWrapper;
