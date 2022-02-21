import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

import { AccountProvider } from './AccountContext';

const DefaultAccountKey = 'unique_market_account_address';

const AccountWrapper: FC = ({ children }) => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchAccountsError, setFetchAccountsError] = useState<string | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta>();

  const changeAccount = useCallback((account: InjectedAccountWithMeta) => {
    localStorage.setItem(DefaultAccountKey, account.address);
    setSelectedAccount(account);
  }, []);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    // this call fires up the authorization popup
    const extensions = await web3Enable('my cool dapp');
    if (extensions.length === 0) {
      setFetchAccountsError('No extension installed, or the user did not accept the authorization');
      return;
    }
    const allAccounts = await web3Accounts();

    if (allAccounts?.length) {
      setAccounts(allAccounts);
      setIsLoading(false);

      const defaultAccountAddress = localStorage.getItem(DefaultAccountKey);
      const defaultAccount = allAccounts.find((item) => item.address === defaultAccountAddress);

      if (defaultAccount) {
        changeAccount(defaultAccount);
      } else {
        changeAccount(accounts[0]);
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
